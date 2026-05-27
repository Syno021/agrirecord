import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOG = '[RoadmapAI]';

type StepCategory =
  | 'preparation'
  | 'planting'
  | 'fertilising'
  | 'watering'
  | 'pest_control'
  | 'harvesting';

export type RoadmapStepDraft = {
  stepNumber: number;
  title: string;
  description: string;
  category: StepCategory;
  daysFromStart: number;
};

export type GeneratedRoadmap = {
  insight: string;
  steps: RoadmapStepDraft[];
  imageUrl?: string;
  provider: 'openai';
};

export type ActivityHistoryItem = {
  cropName: string;
  type: string;
  date: string;
  notes?: string;
};

function getOpenAIKey(): string {
  const fromExtra = Constants.expoConfig?.extra?.openaiApiKey as string | undefined;
  const fromEnv = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const key = (fromExtra || fromEnv || '').trim();

  console.log(`${LOG} resolve key`, {
    hasExtra: !!fromExtra,
    hasEnv: !!fromEnv,
    keyPrefix: key ? key.slice(0, 7) : '(empty)',
    keyLooksValid: key.startsWith('sk-'),
  });

  if (!key) {
    throw new Error(
      'Missing OpenAI API key. Set EXPO_PUBLIC_OPENAI_API_KEY in .env and restart with: npx expo start -c',
    );
  }
  if (!key.startsWith('sk-')) {
    throw new Error(
      `OpenAI key looks invalid (must start with "sk-", got "${key.slice(0, 12)}…"). Check .env — do not paste the variable name, only the key value.`,
    );
  }
  return key;
}

function buildPrompt(input: {
  cropName: string;
  plantingEnvironment: string;
  additionalNotes?: string;
  activityHistory?: ActivityHistoryItem[];
}) {
  const additionalNotes = (input.additionalNotes ?? '').trim();
  const historyBlock =
    input.activityHistory?.length ?
      [
        'Recent farm activity history (use for context):',
        ...input.activityHistory.map(
          (a, i) =>
            `${i + 1}. ${a.date?.slice(0, 10) ?? '—'} — ${a.type} — ${a.cropName}${a.notes ? `: ${a.notes}` : ''}`,
        ),
      ].join('\n')
    : '';

  return [
    `Create a practical farming roadmap for crop: ${input.cropName}.`,
    `Planting environment: ${input.plantingEnvironment}.`,
    additionalNotes ? `Additional notes: ${additionalNotes}` : '',
    historyBlock,
    '',
    'Return JSON only with this shape:',
    '{',
    '  "insight": string,',
    '  "steps": [',
    '    {',
    '      "stepNumber": number,',
    '      "title": string,',
    '      "description": string,',
    '      "category": "preparation"|"planting"|"fertilising"|"watering"|"pest_control"|"harvesting",',
    '      "daysFromStart": number',
    '    }',
    '  ]',
    '}',
    '',
    'Requirements:',
    '- At least 8 steps, ordered by stepNumber starting at 1.',
    '- Include soil preparation, sowing/planting, fertiliser types and timing, pesticide guidance and timing, irrigation schedule, and pre-harvest checks.',
    '- daysFromStart is days after today when the step is due (0 = today).',
    '- Keep descriptions actionable (what to do, what products/classes, how much/when).',
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizeSteps(raw: unknown[]): RoadmapStepDraft[] {
  return raw.map((s: any, idx) => ({
    stepNumber: Number(s.stepNumber ?? idx + 1),
    title: String(s.title ?? `Step ${idx + 1}`).trim(),
    description: String(s.description ?? '').trim(),
    category: (s.category ?? 'preparation') as StepCategory,
    daysFromStart: Math.max(0, Number(s.daysFromStart ?? idx * 3)),
  }));
}

async function callOpenAI(
  prompt: string,
  activityHistory?: ActivityHistoryItem[],
): Promise<GeneratedRoadmap> {
  const key = getOpenAIKey();
  console.log(`${LOG} OpenAI chat request`, { platform: Platform.OS, model: 'gpt-4o-mini' });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.error(`${LOG} OpenAI chat failed`, { status: res.status, body: text.slice(0, 500) });
    let detail = text;
    try {
      const j = JSON.parse(text);
      detail = j?.error?.message ?? text;
    } catch {
      /* keep raw */
    }
    throw new Error(`OpenAI failed (${res.status}): ${detail}`);
  }

  const data = JSON.parse(text) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data?.choices?.[0]?.message?.content ?? '';
  console.log(`${LOG} OpenAI chat ok`, { contentLength: content.length });

  const parsed = JSON.parse(content) as { insight?: string; steps?: unknown[] };
  const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
  if (!steps.length) throw new Error('OpenAI returned no steps in JSON');

  return {
    insight: String(parsed.insight ?? ''),
    steps: normalizeSteps(steps),
    provider: 'openai',
  };
}

async function tryGenerateImageOpenAI(input: {
  cropName: string;
  plantingEnvironment: string;
}): Promise<string | undefined> {
  const key = getOpenAIKey();
  const prompt = `A realistic photo of healthy ${input.cropName} seedlings ready for sowing, ${input.plantingEnvironment} farm setting, natural light.`;
  console.log(`${LOG} OpenAI image request (best-effort)`);

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`${LOG} image skipped`, { status: res.status, body: errText.slice(0, 200) });
      return undefined;
    }
    const data = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return undefined;
    return `data:image/png;base64,${b64}`;
  } catch (e) {
    console.warn(`${LOG} image error`, e);
    return undefined;
  }
}

/** Same contract as the legacy web `generateRoadmapAI` — returns step array with scheduling. */
export async function generateRoadmapAI(
  cropName: string,
  plantingEnvironment: string,
  additionalNotes?: string,
  activityHistory?: ActivityHistoryItem[],
): Promise<RoadmapStepDraft[]> {
  const prompt = buildPrompt({
    cropName,
    plantingEnvironment,
    additionalNotes,
    activityHistory,
  });

  const generated = await callOpenAI(prompt, activityHistory);
  console.log(`${LOG} generated ${generated.steps.length} steps`);
  return generated.steps;
}

export async function generateRoadmapWithMeta(input: {
  cropName: string;
  plantingEnvironment: string;
  additionalNotes?: string;
  activityHistory?: ActivityHistoryItem[];
}): Promise<GeneratedRoadmap> {
  console.log(`${LOG} start`, {
    crop: input.cropName,
    env: input.plantingEnvironment,
    historyCount: input.activityHistory?.length ?? 0,
  });

  const prompt = buildPrompt(input);
  const generated = await callOpenAI(prompt, input.activityHistory);
  const imageUrl = await tryGenerateImageOpenAI({
    cropName: input.cropName,
    plantingEnvironment: input.plantingEnvironment,
  });

  console.log(`${LOG} done`, { steps: generated.steps.length, hasImage: !!imageUrl });
  return { ...generated, imageUrl };
}
