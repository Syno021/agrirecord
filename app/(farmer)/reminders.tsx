import { SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { ReminderListItem, useReminders } from '@/hooks/useReminders';
import { BottomSheetForm } from '@/components/shared/BottomSheetForm';
import { Input } from '@/components/ui/Input';
import { DateField } from '@/components/ui/DateField';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteReminder, updateReminder } from '@/services/firestore/reminders';
import { useToast } from '@/components/shared/ToastProvider';

function ReminderItem({
  item,
  onEdit,
  onDelete,
}: {
  item: ReminderListItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOverdue = item.status === 'overdue';
  const isCompleted = item.completed;

  return (
    <Card style={{ ...styles.item, ...(isCompleted ? styles.itemCompleted : {}) }}>
      <View style={styles.row}>
        <View style={[styles.iconWell, isOverdue && styles.iconWellOverdue]}>
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'notifications-outline'}
            size={22}
            color={isCompleted ? Colors.accent : isOverdue ? Colors.danger : Colors.primary}
          />
        </View>
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.title,
              isOverdue && styles.titleOverdue,
              isCompleted && styles.titleCompleted,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.due}>Due {item.due}</Text>
        </View>
        {isOverdue ? <Badge label="OVERDUE" variant="danger" /> : null}
        <View style={styles.actions}>
          <Ionicons
            name="pencil-outline"
            size={18}
            color={Colors.mutedForeground}
            onPress={onEdit}
          />
          <Ionicons name="trash-outline" size={18} color={Colors.danger} onPress={onDelete} />
        </View>
      </View>
    </Card>
  );
}

export default function RemindersScreen() {
  const { sections, loading, error } = useReminders();
  const toast = useToast();
  const [active, setActive] = useState<ReminderListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<{ title: string; dueYmd: string }>({ title: '', dueYmd: '' });

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Alerts" />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Alerts" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {sections.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="All clear"
          subtitle="No reminders scheduled. They will appear here when created."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <ReminderItem
              item={item}
              onEdit={() => {
                setActive(item);
                setEdit({ title: item.title, dueYmd: item.scheduledAt.slice(0, 10) });
              }}
              onDelete={() => {
                setActive(item);
                setEdit({ title: item.title, dueYmd: item.scheduledAt.slice(0, 10) });
              }}
            />
          )}
          stickySectionHeadersEnabled={false}
        />
      )}

      <BottomSheetForm
        visible={!!active}
        title="Edit Reminder"
        onClose={() => setActive(null)}
        onSave={() => {
          if (!active) return;
          if (!edit.title.trim()) {
            toast.error('Missing title', 'Enter the reminder message.');
            return;
          }
          if (!edit.dueYmd.trim()) {
            toast.error('Missing date', 'Pick a due date.');
            return;
          }
          setSaving(true);
          updateReminder(active.id, {
            message: edit.title.trim(),
            scheduledAt: new Date(`${edit.dueYmd.trim()}T09:00:00`).toISOString(),
          })
            .then(() => {
              toast.success('Reminder updated');
              setActive(null);
            })
            .catch((e) =>
              toast.error('Update failed', e instanceof Error ? e.message : undefined),
            )
            .finally(() => setSaving(false));
        }}
      >
        <Input
          label="Message"
          required
          value={edit.title}
          onChangeText={(v) => setEdit((s) => ({ ...s, title: v }))}
          placeholder="What should we remind you about?"
        />
        <DateField
          label="Due date"
          required
          value={edit.dueYmd}
          onChange={(v) => setEdit((s) => ({ ...s, dueYmd: v }))}
        />
        {active ? (
          <View style={{ marginTop: 12 }}>
            <Button
              variant="danger"
              onPress={() => {
                setSaving(true);
                deleteReminder(active.id)
                  .then(() => {
                    toast.success('Reminder deleted');
                    setActive(null);
                  })
                  .catch((e) =>
                    toast.error('Delete failed', e instanceof Error ? e.message : undefined),
                  )
                  .finally(() => setSaving(false));
              }}
              disabled={saving}
              loading={saving}
            >
              Delete reminder
            </Button>
          </View>
        ) : null}
      </BottomSheetForm>
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
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 8,
  },
  item: { marginBottom: 10 },
  itemCompleted: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWellOverdue: { backgroundColor: '#FEE2E2' },
  textWrap: { flex: 1 },
  title: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: Colors.foreground,
  },
  titleOverdue: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: Colors.danger,
  },
  titleCompleted: { textDecorationLine: 'line-through' },
  due: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 12 },
});
