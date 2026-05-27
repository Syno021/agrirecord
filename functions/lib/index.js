"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoadmapHttp = exports.generateRoadmap = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const openai_1 = __importDefault(require("openai"));
(0, app_1.initializeApp)();
const OPENAI_API_KEY = (0, params_1.defineSecret)('OPENAI_API_KEY');
const OPENROUTER_API_KEY = (0, params_1.defineSecret)('OPENROUTER_API_KEY');
function assertString(v, name) {
    if (typeof v !== 'string' || !v.trim())
        throw new Error(`Missing ${name}`);
    return v.trim();
}
async function generateRoadmapImpl(body) {
    const farmId = assertString(body.farmId, 'farmId');
    const createdBy = assertString(body.createdBy, 'createdBy');
    const cropName = assertString(body.cropName, 'cropName');
    const plantingEnvironment = assertString(body.plantingEnvironment, 'plantingEnvironment');
    const additionalNotes = typeof body.additionalNotes === 'string' ? body.additionalNotes.trim() : '';
    const openAiClient = new openai_1.default({ apiKey: OPENAI_API_KEY.value() });
    const openRouterKey = (() => {
        try {
            return OPENROUTER_API_KEY.value();
        }
        catch {
            return '';
        }
    })();
    const openRouterClient = openRouterKey
        ? new openai_1.default({
            apiKey: openRouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
        })
        : null;
    const prompt = [
        `Create a practical farming roadmap for crop: ${cropName}.`,
        `Planting environment: ${plantingEnvironment}.`,
        additionalNotes ? `Additional notes: ${additionalNotes}` : '',
        '',
        'Return JSON only with this shape:',
        '{ "insight": string, "steps": [ { "title": string, "description": string, "category": "preparation"|"planting"|"fertilising"|"watering"|"pest_control"|"harvesting" } ] }',
        '',
        'Steps MUST include soil preparation, sowing/planting, fertiliser types/timing, pesticide guidance and timing, irrigation guidance and timing.',
        'Keep steps actionable and concise.',
    ]
        .filter(Boolean)
        .join('\n');
    const completion = await (async () => {
        try {
            return await openAiClient.chat.completions.create({
                model: 'gpt-4.1-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            });
        }
        catch (e) {
            if (!openRouterClient)
                throw e;
            return await openRouterClient.chat.completions.create({
                model: 'openai/gpt-4.1-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            });
        }
    })();
    const content = completion.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(content);
    const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
    if (steps.length === 0)
        throw new Error('Model returned no steps');
    const imgPrompt = `A realistic photo of mature ${cropName} crop ready for harvest, in a ${plantingEnvironment} setting.`;
    // Image generation is kept on OpenAI; if OpenAI fails, we skip image rather than fail the roadmap.
    let image = null;
    try {
        image = await openAiClient.images.generate({
            model: 'gpt-image-1',
            prompt: imgPrompt,
            size: '1024x1024',
        });
    }
    catch {
        image = null;
    }
    const b64 = image?.data?.[0]?.b64_json;
    let imageUrl = '';
    if (b64) {
        const buffer = Buffer.from(b64, 'base64');
        const bucket = (0, storage_1.getStorage)().bucket();
        const path = `roadmap-images/${createdBy}/${Date.now()}-${cropName
            .replace(/\\s+/g, '-')
            .toLowerCase()}.png`;
        const file = bucket.file(path);
        await file.save(buffer, { contentType: 'image/png', resumable: false, public: false });
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        });
        imageUrl = signedUrl;
    }
    const db = (0, firestore_1.getFirestore)();
    const roadmapRef = await db.collection('roadmaps').add({
        farmId,
        createdBy,
        title: `${cropName} (${plantingEnvironment})`,
        cropName,
        plantingEnvironment,
        status: 'active',
        aiGeneratedPlan: parsed.insight ?? '',
        promptUsed: additionalNotes,
        imageUrl,
        isActive: true,
    });
    const batch = db.batch();
    steps.forEach((s, idx) => {
        const stepRef = db.collection('roadmapSteps').doc();
        batch.set(stepRef, {
            roadmapId: roadmapRef.id,
            stepNumber: idx + 1,
            title: String(s.title ?? `Step ${idx + 1}`),
            description: String(s.description ?? ''),
            dueDate: new Date().toISOString(),
            isCompleted: false,
            category: s.category ?? 'preparation',
        });
    });
    await batch.commit();
    return { ok: true, roadmapId: roadmapRef.id, imageUrl };
}
// Callable (mobile-friendly)
exports.generateRoadmap = (0, https_1.onCall)({ secrets: [OPENAI_API_KEY, OPENROUTER_API_KEY] }, async (req) => {
    return generateRoadmapImpl((req.data ?? {}));
});
// HTTP (web-friendly, explicit CORS)
exports.generateRoadmapHttp = (0, https_1.onRequest)({ secrets: [OPENAI_API_KEY, OPENROUTER_API_KEY], cors: true }, async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'content-type, authorization');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ ok: false, error: 'Method not allowed' });
            return;
        }
        const result = await generateRoadmapImpl((req.body ?? {}));
        res.json(result);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        res.status(400).json({ ok: false, error: msg });
    }
});
