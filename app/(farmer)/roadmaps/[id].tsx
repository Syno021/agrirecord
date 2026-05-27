import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/shared/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Colors } from '@/constants/colors';
import { useRoadmapDetail } from '@/hooks/useRoadmaps';
import { setRoadmapStepCompleted } from '@/services/firestore/roadmapSteps';
import { useToast } from '@/components/shared/ToastProvider';
import { Image } from 'expo-image';

export default function RoadmapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { detail, loading, error } = useRoadmapDetail(id);
  const toast = useToast();

  if (loading || !detail) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingState message={error ?? 'Loading roadmap…'} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{detail.crop} Roadmap</Text>

      {detail.imageUrl ? (
        <View style={styles.imageWrap}>
          <Image source={{ uri: detail.imageUrl }} style={styles.image} contentFit="cover" />
          <Text style={styles.imageCaption}>Reference image (AI-generated)</Text>
        </View>
      ) : null}

      <View style={styles.insight}>
        <Ionicons name="sparkles" size={20} color={Colors.accent} style={styles.sparkle} />
        <Text style={styles.insightText}>{detail.insight}</Text>
      </View>

      {detail.steps.map((step, index) => {
        const isDone = step.status === 'done';
        const isActive = step.status === 'active';
        const badge =
          step.status === 'done' ? 'DONE' : step.status === 'active' ? 'ACTIVE' : null;

        return (
          <View key={step.id} style={styles.stepWrap}>
            <View style={[styles.stepRow, isActive && styles.stepActive]}>
              <View style={styles.timeline}>
                <View
                  style={[
                    styles.dot,
                    isDone && styles.dotDone,
                    isActive && styles.dotActive,
                  ]}
                />
                {index < detail.steps.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isDone && styles.stepTitleDone,
                      !isDone && !isActive && styles.stepTitlePending,
                    ]}
                  >
                    Step {index + 1}: {step.title}
                  </Text>
                  {badge ? (
                    <Badge
                      label={badge}
                      variant={step.status === 'done' ? 'success' : 'warning'}
                    />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.stepDesc,
                    isDone && styles.stepDescDone,
                    isActive && styles.stepDescActive,
                  ]}
                >
                  {step.description}
                </Text>

                <Pressable
                  onPress={() => {
                    const nextDone = step.status !== 'done';
                    setRoadmapStepCompleted(step.id, nextDone)
                      .then(() => toast.success(nextDone ? 'Marked done' : 'Marked pending'))
                      .catch((e) =>
                        toast.error('Could not update step', e instanceof Error ? e.message : undefined),
                      );
                  }}
                  style={[styles.checkBtn, isDone && styles.checkBtnDone]}
                >
                  <Ionicons
                    name={isDone ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={isDone ? Colors.accent : Colors.mutedForeground}
                  />
                  <Text style={[styles.checkText, isDone && styles.checkTextDone]}>
                    {isDone ? 'Completed' : 'Mark completed'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: Colors.foreground,
    marginBottom: 20,
  },
  imageWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  image: { width: '100%', height: 220, backgroundColor: Colors.muted },
  imageCaption: {
    padding: 10,
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.mutedForeground,
    backgroundColor: Colors.surface,
  },
  insight: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sparkle: { marginRight: 10, marginTop: 2 },
  insightText: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.primary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  stepWrap: { marginBottom: 4 },
  stepRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    paddingVertical: 12,
  },
  stepActive: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    paddingLeft: 12,
    marginLeft: -3,
  },
  timeline: { width: 24, alignItems: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dotDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  stepContent: { flex: 1, marginLeft: 12 },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  stepTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: Colors.foreground,
    flex: 1,
  },
  stepTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.mutedForeground,
  },
  stepTitlePending: { color: Colors.mutedForeground },
  stepDesc: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.mutedForeground,
    lineHeight: 20,
  },
  stepDescDone: { textDecorationLine: 'line-through' },
  stepDescActive: {
    color: Colors.foreground,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.accent,
  },
  checkBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  checkBtnDone: { borderColor: Colors.accent + '55' },
  checkText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: Colors.foreground,
  },
  checkTextDone: { color: Colors.accent },
});
