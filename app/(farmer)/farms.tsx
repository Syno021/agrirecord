import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { EntityCard } from '@/components/shared/EntityCard';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { BottomSheetForm } from '@/components/shared/BottomSheetForm';
import { LoadingState } from '@/components/shared/LoadingState';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  COMMON_CROPS,
  IRRIGATION_TYPES,
  SOIL_TYPES,
} from '@/constants/farmInventoryOptions';
import { Colors } from '@/constants/colors';
import { useFarms } from '@/hooks/useFarms';
import { useToast } from '@/components/shared/ToastProvider';
import { ScreenLock } from '@/components/shared/ScreenLock';
import {
  emptyFarmForm,
  FarmFormValues,
  validateFarmForm,
} from '@/lib/validation/farmInventory';
import { archiveFarm } from '@/services/firestore/farms';
import { Button } from '@/components/ui/Button';

const cropOptions = COMMON_CROPS.map((c) => ({ value: c, label: c }));

function resetForm(): FarmFormValues {
  return emptyFarmForm();
}

export default function FarmsScreen() {
  const toast = useToast();
  const { farms, loading, error, addFarm, editFarm } = useFarms();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FarmFormValues>(resetForm);
  const [formErrors, setFormErrors] = useState<ReturnType<typeof validateFarmForm>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [deletingFarmId, setDeletingFarmId] = useState<string | null>(null);

  const openAddSheet = () => {
    setEditingFarmId(null);
    setForm(resetForm());
    setFormErrors({});
    setSaveError('');
    setSheetOpen(true);
  };
  const openEditSheet = (farmId: string) => {
    const existing = farms.find((f) => f.id === farmId);
    if (!existing) return;
    setEditingFarmId(farmId);
    setForm({
      name: existing.name ?? '',
      location: existing.location ?? '',
      sizeHectares: existing.sizeHectares?.toString() ?? '',
      primaryCrop: existing.primaryCrop ?? '',
      irrigationType: existing.irrigationType ?? '',
      soilType: existing.soilType ?? '',
      description: existing.description ?? '',
    });
    setFormErrors({});
    setSaveError('');
    setSheetOpen(true);
  };

  const patch = (key: keyof FarmFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = async () => {
    const errors = validateFarmForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        sizeHectares: parseFloat(form.sizeHectares),
        primaryCrop: form.primaryCrop.trim(),
        irrigationType: form.irrigationType,
        soilType: form.soilType || undefined,
        description: form.description.trim() || undefined,
      };
      if (editingFarmId) {
        await editFarm(editingFarmId, payload);
      } else {
        await addFarm(payload);
      }
      setSheetOpen(false);
      setForm(resetForm());
      toast.success('Farm saved');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save farm';
      setSaveError(msg);
      toast.error('Save failed', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Farms" />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Farms" showAdd onAdd={openAddSheet} />
      {error ? <Text style={styles.banner}>{error}</Text> : null}
      {farms.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title="No farms yet"
          subtitle="Register your farm with location, size, crop, and irrigation — standard for crop planning and compliance."
          actionLabel="Add Farm"
          onAction={openAddSheet}
        />
      ) : (
        <FlatList
          data={farms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EntityCard
              title={item.name}
              subtitle={item.location ?? '—'}
              icon="map-outline"
              badge="ACTIVE"
              stats={[
                `${item.sizeHectares ?? 0} ha`,
                item.primaryCrop ?? '—',
                item.irrigationType?.replace('_', ' ') ?? '—',
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(farmer)/farm/[id]',
                  params: { id: item.id },
                })
              }
              onEdit={() => openEditSheet(item.id)}
              onDelete={() => setDeletingFarmId(item.id)}
            />
          )}
        />
      )}
      <BottomSheetForm
        visible={sheetOpen}
        title={editingFarmId ? 'Edit Farm' : 'Add Farm'}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      >
        <Text style={styles.sectionHint}>
          Based on standard field records: name, location, area, crop, and water source are required in most farm systems.
        </Text>

        <Input
          label="Farm name"
          required
          value={form.name}
          onChangeText={(v) => patch('name', v)}
          placeholder="Sunrise Farm"
          icon="business-outline"
          error={formErrors.name}
        />
        <Input
          label="Location"
          required
          hint="County, region, or nearest town — used for weather and logistics"
          value={form.location}
          onChangeText={(v) => patch('location', v)}
          placeholder="Nakuru, Kenya"
          icon="location-outline"
          error={formErrors.location}
        />
        <Input
          label="Farm size (hectares)"
          required
          hint="Official or working area — 1 ha ≈ 2.47 acres"
          value={form.sizeHectares}
          onChangeText={(v) => patch('sizeHectares', v)}
          placeholder="24"
          keyboardType="decimal-pad"
          icon="resize-outline"
          error={formErrors.sizeHectares}
        />
        <SelectField
          label="Primary crop"
          required
          hint="Main crop this season — drives roadmaps and input planning"
          value={form.primaryCrop}
          options={cropOptions}
          onChange={(v) => patch('primaryCrop', v)}
          error={formErrors.primaryCrop}
        />
        <SelectField
          label="Irrigation"
          required
          value={form.irrigationType}
          options={IRRIGATION_TYPES.map((i) => ({ value: i.value, label: i.label }))}
          onChange={(v) => patch('irrigationType', v)}
          error={formErrors.irrigationType}
        />
        <SelectField
          label="Soil type"
          value={form.soilType}
          options={SOIL_TYPES.map((s) => ({ value: s.value, label: s.label }))}
          onChange={(v) => patch('soilType', v)}
        />
        <Input
          label="Notes"
          hint="Optional: legal land description, boundaries, previous crop"
          value={form.description}
          onChangeText={(v) => patch('description', v)}
          placeholder="e.g. Red volcanic soils, maize last season"
          multiline
        />
        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
        {saving ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} /> : null}
      </BottomSheetForm>

      <BottomSheetForm
        visible={!!deletingFarmId}
        title="Delete Farm?"
        onClose={() => setDeletingFarmId(null)}
        onSave={() => setDeletingFarmId(null)}
      >
        <Text style={styles.sectionHint}>
          This will remove the farm from your active list (soft delete). Activities and records will remain in the database.
        </Text>
        <View style={{ marginTop: 12 }}>
          <Button
            variant="danger"
            onPress={() => {
              const id = deletingFarmId;
              if (!id) return;
              setSaving(true);
              archiveFarm(id)
                .then(() => {
                  toast.success('Farm deleted');
                  setDeletingFarmId(null);
                })
                .catch((e) =>
                  toast.error('Delete failed', e instanceof Error ? e.message : undefined),
                )
                .finally(() => setSaving(false));
            }}
            disabled={saving}
            loading={saving}
          >
            Delete farm
          </Button>
        </View>
      </BottomSheetForm>
      <ScreenLock visible={saving} message="Saving farm…" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  banner: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.danger,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionHint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    marginBottom: 16,
    lineHeight: 20,
  },
  saveError: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 8,
  },
});
