import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ScreenLock } from '@/components/shared/ScreenLock';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { useRoadmaps, useRoadmapStepCounts } from '@/hooks/useRoadmaps';
import { BottomSheetForm } from '@/components/shared/BottomSheetForm';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';
import { useFarms } from '@/hooks/useFarms';
import { useToast } from '@/components/shared/ToastProvider';
import { PlantingEnvironment } from '@/types/firestore';
import { Button } from '@/components/ui/Button';

export default function RoadmapsListScreen() {
  const toast = useToast();
  const { roadmaps, rawRoadmaps, loading, error, addRoadmap, removeRoadmap } = useRoadmaps();
  const { farms } = useFarms();
  const stepCounts = useRoadmapStepCounts(rawRoadmaps.map((r) => r.id));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<{
    farmId: string;
    cropName: string;
    plantingEnvironment: PlantingEnvironment | '';
    additionalNotes: string;
  }>({ farmId: farms[0]?.id ?? '', cropName: '', plantingEnvironment: '', additionalNotes: '' });

  const envOptions = [
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'greenhouse', label: 'Greenhouse' },
  ] as const;

  const openCreate = () => {
    setForm({
      farmId: farms[0]?.id ?? '',
      cropName: '',
      plantingEnvironment: '',
      additionalNotes: '',
    });
    setSheetOpen(true);
  };

  const handleGenerate = async () => {
    if (!form.farmId) {
      toast.error('Missing farm', 'Create a farm first.');
      return;
    }
    if (!form.cropName.trim()) {
      toast.error('Missing crop', 'Choose a crop to plant.');
      return;
    }
    if (!form.plantingEnvironment) {
      toast.error('Missing environment', 'Select indoor, outdoor, or greenhouse.');
      return;
    }

    setGenerating(true);
    setGenStatus('Loading your recent farm activity…');
    try {
      setGenStatus('Generating planting plan with OpenAI…');
      const roadmapId = await addRoadmap({
        farmId: form.farmId,
        cropName: form.cropName.trim(),
        plantingEnvironment: form.plantingEnvironment as PlantingEnvironment,
        additionalNotes: form.additionalNotes.trim() || undefined,
      });
      setSheetOpen(false);
      toast.success('Roadmap created');
      console.log('[RoadmapsScreen] created', roadmapId);
      router.push(`/(farmer)/roadmaps/${roadmapId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.error('[RoadmapsScreen] generate failed', e);
      toast.error('Could not create roadmap', msg);
    } finally {
      setGenerating(false);
      setGenStatus('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await removeRoadmap(deleteTargetId);
      toast.success('Roadmap deleted');
      setDeleteTargetId(null);
    } catch (e) {
      console.error('[RoadmapsScreen] delete failed', e);
      toast.error('Delete failed', e instanceof Error ? e.message : undefined);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Roadmaps" />
        <LoadingState />
      </View>
    );
  }

  const deleteTarget = rawRoadmaps.find((r) => r.id === deleteTargetId);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Roadmaps" showAdd onAdd={openCreate} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {roadmaps.length === 0 ? (
        <EmptyState
          icon="compass-outline"
          title="No roadmaps yet"
          subtitle="AI-generated crop plans will appear here once created for your farms."
          actionLabel={farms.length > 0 ? 'Create Roadmap' : undefined}
          onAction={farms.length > 0 ? openCreate : undefined}
        />
      ) : (
        <FlatList
          data={roadmaps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const counts = stepCounts[item.id] ?? { done: 0, total: 0 };
            const total = counts.total || 1;
            const progress = counts.done / total;
            return (
              <Card style={styles.card}>
                <View style={styles.header}>
                  <Text style={styles.crop}>{item.crop}</Text>
                  <View style={styles.headerRight}>
                    <Badge label={item.season} variant="info" />
                    <Pressable
                      onPress={() => setDeleteTargetId(item.id)}
                      hitSlop={10}
                      style={styles.iconBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.stepsLabel}>
                  {counts.done} of {counts.total} steps complete
                </Text>
                <Pressable onPress={() => router.push(`/(farmer)/roadmaps/${item.id}`)}>
                  <Text style={styles.link}>View Plan →</Text>
                </Pressable>
              </Card>
            );
          }}
        />
      )}

      <BottomSheetForm
        visible={sheetOpen}
        title="Create Roadmap"
        onClose={() => !generating && setSheetOpen(false)}
        onSave={() => void handleGenerate()}
      >
        <SelectField
          label="Farm"
          required
          value={form.farmId}
          options={farms.map((f) => ({ value: f.id, label: f.name }))}
          onChange={(v) => setForm((s) => ({ ...s, farmId: v }))}
        />
        <Input
          label="Crop"
          required
          value={form.cropName}
          onChangeText={(v) => setForm((s) => ({ ...s, cropName: v }))}
          placeholder="e.g. Maize"
          icon="leaf-outline"
        />
        <SelectField
          label="Planting environment"
          required
          value={form.plantingEnvironment}
          options={envOptions as unknown as { value: string; label: string }[]}
          onChange={(v) => setForm((s) => ({ ...s, plantingEnvironment: v as PlantingEnvironment }))}
        />
        <Input
          label="Additional notes"
          hint="Optional — soil, climate, spacing, varieties"
          value={form.additionalNotes}
          onChangeText={(v) => setForm((s) => ({ ...s, additionalNotes: v }))}
          placeholder="Anything else the plan should consider?"
          multiline
        />
      </BottomSheetForm>

      <BottomSheetForm
        visible={!!deleteTargetId}
        title="Delete roadmap?"
        onClose={() => !deleting && setDeleteTargetId(null)}
        onSave={() => setDeleteTargetId(null)}
      >
        <Text style={styles.deleteHint}>
          This removes &quot;{deleteTarget?.title ?? deleteTarget?.cropName}&quot; and all its steps.
        </Text>
        <Button variant="danger" onPress={() => void handleDelete()} loading={deleting} disabled={deleting}>
          Delete roadmap
        </Button>
      </BottomSheetForm>

      <ScreenLock
        visible={generating}
        message={genStatus || 'Generating your custom roadmap…'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  error: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.danger,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  card: { marginBottom: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crop: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: Colors.foreground,
    flex: 1,
  },
  progressBg: {
    height: 8,
    backgroundColor: Colors.muted,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  stepsLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  link: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.accent,
  },
  deleteHint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.mutedForeground,
    marginBottom: 16,
    lineHeight: 20,
  },
});
