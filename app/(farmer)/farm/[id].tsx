import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ScreenLock } from '@/components/shared/ScreenLock';
import { BottomSheetForm } from '@/components/shared/BottomSheetForm';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Colors } from '@/constants/colors';
import { useToast } from '@/components/shared/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import { useFarms } from '@/hooks/useFarms';
import { ActivityLogType } from '@/types/firestore';
import { archiveFarm } from '@/services/firestore/farms';
import {
  archiveActivityLog,
  createActivityLog,
  subscribeActivityLogsByFarm,
  updateActivityLog,
} from '@/services/firestore/activities';
import { formatDisplayDate, toIsoString } from '@/lib/firebase/utils';
import { createReminder, setReminderCompleted } from '@/services/firestore/reminders';
import { useFarmTasks } from '@/hooks/useFarmTasks';
import { DateField } from '@/components/ui/DateField';

const ACTIVITY_TYPES: { value: ActivityLogType; label: string }[] = [
  { value: 'planting', label: 'Planting' },
  { value: 'fertilising', label: 'Fertilising' },
  { value: 'pesticide', label: 'Pesticide' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'other', label: 'Other' },
];

type FarmActivityForm = {
  type: ActivityLogType | '';
  cropName: string;
  notes: string;
  productUsed: string;
};

function emptyActivityForm(): FarmActivityForm {
  return { type: '', cropName: '', notes: '', productUsed: '' };
}

export default function FarmDetailScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { farms } = useFarms();

  const farm = useMemo(() => farms.find((f) => f.id === id) ?? null, [farms, id]);

  const [activities, setActivities] = useState<
    { id: string; title: string; subtitle: string; type: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [deleteSheet, setDeleteSheet] = useState(false);
  const [form, setForm] = useState<FarmActivityForm>(emptyActivityForm);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState<string | undefined>(undefined); // YYYY-MM-DD
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const { sections: taskSections } = useFarmTasks(farm?.id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const unsub = subscribeActivityLogsByFarm(
      id,
      (logs) => {
        const mapped = logs
          .map((l) => {
            const iso = toIsoString(l.date);
            return {
              id: l.id,
              title: l.notes?.trim() || `${l.type} — ${l.cropName}`,
              subtitle: `${formatDisplayDate(iso)} · ${l.productUsed || '—'}`,
              type: l.type,
            };
          })
          .sort((a, b) => b.subtitle.localeCompare(a.subtitle));
        setActivities(mapped);
        setLoading(false);
      },
      (err) => {
        toast.error('Failed to load activities', err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [id, toast]);

  const openAddActivity = () => {
    setEditingActivityId(null);
    setForm(emptyActivityForm());
    setActivitySheetOpen(true);
  };
  const openEditActivity = (activityId: string) => {
    const existing = activities.find((a) => a.id === activityId);
    if (!existing) return;
    setEditingActivityId(activityId);
    setForm({
      type: (existing.type as ActivityLogType) ?? '',
      cropName: existing.title.split('—').pop()?.trim() || '',
      notes: existing.title,
      productUsed: existing.subtitle.split('·').pop()?.trim() === '—' ? '' : existing.subtitle.split('·').pop()?.trim() || '',
    });
    setActivitySheetOpen(true);
  };

  const saveActivity = async () => {
    if (!user?.id || !farm?.id) return;
    if (!form.cropName.trim()) {
      toast.error('Missing crop', 'Enter a crop name (e.g. Maize).');
      return;
    }
    setBusy(true);
    try {
      if (editingActivityId) {
        await updateActivityLog(editingActivityId, {
          type: (form.type || 'other') as ActivityLogType,
          cropName: form.cropName.trim(),
          notes: form.notes.trim() || `${form.type || 'other'} activity`,
          productUsed: form.productUsed.trim() || '',
        });
      } else {
        await createActivityLog({
          farmId: farm.id,
          recordedBy: user.id,
          farmOwnerId: user.id,
          type: (form.type || 'other') as ActivityLogType,
          cropName: form.cropName.trim(),
          notes: form.notes.trim() || `${form.type || 'other'} activity`,
          productUsed: form.productUsed.trim() || undefined,
        });
      }
      setActivitySheetOpen(false);
      toast.success(editingActivityId ? 'Activity updated' : 'Activity added');
    } catch (e) {
      toast.error('Could not add activity', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const openAddTask = () => {
    setTaskTitle('');
    setTaskDue('');
    setTaskSheetOpen(true);
  };

  const saveTask = async () => {
    if (!user?.id || !farm?.id) return;
    if (!taskTitle.trim()) {
      toast.error('Missing task', 'Enter what needs to be done.');
      return;
    }
    setBusy(true);
    try {
      const scheduledAt = taskDue?.trim()
        ? new Date(`${taskDue.trim()}T09:00:00`).toISOString()
        : new Date().toISOString();
      await createReminder({
        userId: user.id,
        farmId: farm.id,
        message: taskTitle.trim(),
        scheduledAt,
        type: 'custom',
      });
      setTaskSheetOpen(false);
      toast.success('Task added');
    } catch (e) {
      toast.error('Could not add task', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const updateTaskStatus = async (reminderId: string, completed: boolean) => {
    setBusy(true);
    try {
      await setReminderCompleted(reminderId, completed);
      toast.success(completed ? 'Marked complete' : 'Marked pending');
    } catch (e) {
      toast.error('Could not update task', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const deleteFarm = async () => {
    if (!farm?.id) return;
    setBusy(true);
    try {
      await archiveFarm(farm.id);
      toast.success('Farm deleted');
    } catch (e) {
      toast.error('Delete failed', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={farm?.name ?? 'Farm'} showBack />

      <View style={styles.meta}>
        <Text style={styles.metaText}>{farm?.location ?? '—'}</Text>
        <Text style={styles.metaText}>
          {(farm?.sizeHectares ?? 0).toString()} ha · {farm?.primaryCrop ?? '—'}
        </Text>
        <Text style={styles.metaText}>
          Irrigation: {farm?.irrigationType?.replace('_', ' ') ?? '—'}
        </Text>
        <Text style={styles.deleteLink} onPress={() => setDeleteSheet(true)}>
          Delete farm
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Text style={styles.actionBtn} onPress={openAddActivity}>
          + Activity
        </Text>
        <Text style={styles.actionBtnSecondary} onPress={openAddTask}>
          + Task
        </Text>
      </View>

      {loading ? (
        <Text style={styles.hint}>Loading farm activities…</Text>
      ) : activities.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No activity logged"
          subtitle="Tap + to add your first activity for this farm."
          actionLabel="Add Activity"
          onAction={openAddActivity}
        />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSub}>{item.subtitle}</Text>
                </View>
                <Pressable
                  onPress={() => openEditActivity(item.id)}
                  hitSlop={10}
                  style={styles.iconBtn}
                >
                  <Ionicons name="pencil-outline" size={18} color={Colors.mutedForeground} />
                </Pressable>
                <Pressable
                  onPress={() => void archiveActivityLog(item.id).then(() => toast.success('Activity deleted')).catch((e) => toast.error('Delete failed', e instanceof Error ? e.message : undefined))}
                  hitSlop={10}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </Pressable>
              </View>
            </Card>
          )}
          ListFooterComponent={
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              {taskSections.length === 0 ? (
                <Card>
                  <Text style={styles.itemSub}>No tasks for this farm yet.</Text>
                </Card>
              ) : (
                taskSections.map((section) => (
                  <View key={section.title} style={{ marginTop: 12 }}>
                    <Text style={styles.taskGroupTitle}>{section.title}</Text>
                    {section.data.map((t) => (
                      <Card
                        key={t.id}
                        style={{ marginBottom: 10 }}
                        onPress={() => setActiveTaskId(t.id)}
                      >
                        <View style={styles.taskRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.itemTitle, t.completed && styles.completed]}>
                              {t.title}
                            </Text>
                            <Text style={styles.itemSub}>Due {t.due}</Text>
                          </View>
                          {t.status === 'overdue' && !t.completed ? (
                            <Badge label="OVERDUE" variant="danger" />
                          ) : null}
                          {t.completed ? <Badge label="DONE" variant="success" /> : null}
                        </View>
                      </Card>
                    ))}
                  </View>
                ))
              )}
            </View>
          }
        />
      )}

      <BottomSheetForm
        visible={activitySheetOpen}
        title={editingActivityId ? 'Edit Activity' : 'Add Activity'}
        onClose={() => setActivitySheetOpen(false)}
        onSave={() => void saveActivity()}
      >
        <SelectField
          label="Type"
          value={form.type}
          options={ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          onChange={(v) => setForm((f) => ({ ...f, type: v as ActivityLogType }))}
        />
        <Input
          label="Crop"
          required
          value={form.cropName}
          onChangeText={(v) => setForm((f) => ({ ...f, cropName: v }))}
          placeholder="Maize"
          icon="leaf-outline"
        />
        <Input
          label="Product used"
          hint="Optional (e.g. NPK 17-17-17)"
          value={form.productUsed}
          onChangeText={(v) => setForm((f) => ({ ...f, productUsed: v }))}
          placeholder="—"
          icon="flask-outline"
        />
        <Input
          label="Notes"
          value={form.notes}
          onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
          placeholder="What was done?"
          multiline
        />
        {busy ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} /> : null}
      </BottomSheetForm>

      <BottomSheetForm
        visible={taskSheetOpen}
        title="Add Task"
        onClose={() => setTaskSheetOpen(false)}
        onSave={() => void saveTask()}
      >
        <Input
          label="Task"
          required
          value={taskTitle}
          onChangeText={setTaskTitle}
          placeholder="Spray fungicide — Maize field"
          icon="checkmark-circle-outline"
        />
        <DateField
          label="Due date"
          hint="Pick a date"
          value={taskDue}
          onChange={setTaskDue}
          placeholder="YYYY-MM-DD"
        />
        {busy ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} /> : null}
      </BottomSheetForm>

      <BottomSheetForm
        visible={!!activeTaskId}
        title="Update Task Status"
        onClose={() => setActiveTaskId(null)}
        onSave={() => {
          const selected = taskSections.flatMap((s) => s.data).find((x) => x.id === activeTaskId);
          if (!selected) return;
          void updateTaskStatus(selected.id, !selected.completed);
        }}
      >
        {(() => {
          const selected = taskSections.flatMap((s) => s.data).find((x) => x.id === activeTaskId);
          if (!selected) return null;
          return (
            <>
              <Text style={styles.metaText}>{selected.title}</Text>
              <Text style={styles.itemSub}>Due {selected.due}</Text>
              <Text style={[styles.taskHelp, { marginTop: 12 }]}>
                Status: {selected.completed ? 'Completed' : 'Pending'}.
                Tap Save to mark as {selected.completed ? 'Pending' : 'Completed'}.
              </Text>
            </>
          );
        })()}
      </BottomSheetForm>

      <BottomSheetForm
        visible={deleteSheet}
        title="Delete farm"
        onClose={() => setDeleteSheet(false)}
        onSave={() => void deleteFarm()}
      >
        <Text style={styles.dangerText}>
          This will remove the farm from your active list (soft delete). You can’t undo this from
          the app yet.
        </Text>
      </BottomSheetForm>

      <ScreenLock visible={busy} message="Please wait…" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  meta: { paddingHorizontal: 20, paddingBottom: 12 },
  metaText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    marginBottom: 2,
  },
  deleteLink: {
    marginTop: 10,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: Colors.danger,
  },
  hint: {
    paddingHorizontal: 20,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  itemTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.foreground },
  itemSub: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.mutedForeground, marginTop: 4 },
  completed: { opacity: 0.6, textDecorationLine: 'line-through' },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: Colors.foreground,
    marginBottom: 10,
    marginTop: 8,
  },
  taskGroupTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    fontFamily: 'Outfit_600SemiBold',
    overflow: 'hidden',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: Colors.secondary,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    fontFamily: 'Outfit_600SemiBold',
    overflow: 'hidden',
  },
  dangerText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.danger,
    lineHeight: 20,
  },
  taskHelp: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    lineHeight: 20,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
});

