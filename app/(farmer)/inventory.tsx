import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { EntityCard } from '@/components/shared/EntityCard';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { BottomSheetForm } from '@/components/shared/BottomSheetForm';
import { LoadingState } from '@/components/shared/LoadingState';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';
import { EmptyState } from '@/components/ui/EmptyState';
import { DateField } from '@/components/ui/DateField';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from '@/constants/farmInventoryOptions';
import { Colors } from '@/constants/colors';
import { useInventory } from '@/hooks/useInventory';
import { InventoryCategory } from '@/types/firestore';
import { useToast } from '@/components/shared/ToastProvider';
import { ScreenLock } from '@/components/shared/ScreenLock';
import {
  emptyInventoryForm,
  InventoryFormValues,
  validateInventoryForm,
} from '@/lib/validation/farmInventory';
import { deleteInventoryItem } from '@/services/firestore/inventory';
import { Button } from '@/components/ui/Button';

function resetForm(defaultFarmId: string): InventoryFormValues {
  return { ...emptyInventoryForm(), farmId: defaultFarmId };
}

function categoryLabel(cat: string) {
  return INVENTORY_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

export default function InventoryScreen() {
  const toast = useToast();
  const { items, farms, loading, error, addItem, editItem } = useInventory();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<InventoryFormValues>(emptyInventoryForm());
  const [formErrors, setFormErrors] = useState<ReturnType<typeof validateInventoryForm>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const farmOptions = farms.map((f) => ({ value: f.id, label: f.name }));

  useEffect(() => {
    if (farms.length > 0 && !form.farmId) {
      setForm((f) => ({ ...f, farmId: farms[0].id }));
    }
  }, [farms, form.farmId]);

  const openAddSheet = () => {
    setEditingItemId(null);
    setForm(resetForm(farms[0]?.id ?? ''));
    setFormErrors({});
    setSaveError('');
    setSheetOpen(true);
  };
  const openEditSheet = (id: string) => {
    const existing = items.find((i) => i.id === id);
    if (!existing) return;
    setEditingItemId(id);
    setForm({
      farmId: existing.farmId,
      name: existing.name ?? '',
      category: existing.category ?? '',
      quantity: `${existing.quantity ?? ''}`,
      unit: existing.unit ?? '',
      minThreshold: `${existing.minThreshold ?? ''}`,
      costPerUnit: `${existing.costPerUnit ?? ''}`,
      lotBatchId: existing.lotBatchId ?? '',
      expiryDate: existing.expiryDate ?? '',
      storageLocation: existing.storageLocation ?? '',
      notes: existing.notes ?? '',
    });
    setFormErrors({});
    setSaveError('');
    setSheetOpen(true);
  };

  const patch = (key: keyof InventoryFormValues, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = async () => {
    const errors = validateInventoryForm(form, farms.length > 0);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        farmId: form.farmId,
        name: form.name.trim(),
        category: form.category as InventoryCategory,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        minThreshold: form.minThreshold.trim() ? parseFloat(form.minThreshold) : 0,
        costPerUnit: form.costPerUnit.trim() ? parseFloat(form.costPerUnit) : 0,
        lotBatchId: form.lotBatchId.trim() || undefined,
        expiryDate: form.expiryDate.trim() || undefined,
        storageLocation: form.storageLocation.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      if (editingItemId) {
        await editItem(editingItemId, payload);
      } else {
        await addItem(payload);
      }
      setSheetOpen(false);
      setForm(resetForm(farms[0]?.id ?? ''));
      toast.success('Inventory saved');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save item';
      setSaveError(msg);
      toast.error('Save failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const farmName = (farmId: string) => farms.find((f) => f.id === farmId)?.name ?? 'Farm';
  const activeItem = useMemo(
    () => items.find((i) => i.id === activeItemId) ?? null,
    [items, activeItemId],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Inventory" />
        <LoadingState />
      </View>
    );
  }

  const deleteSelected = async () => {
    if (!activeItem) return;
    setSaving(true);
    try {
      await deleteInventoryItem(activeItem.id);
      toast.success('Item deleted');
      setActiveItemId(null);
    } catch (e) {
      toast.error('Delete failed', e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Inventory" showAdd onAdd={openAddSheet} />
      {error ? <Text style={styles.banner}>{error}</Text> : null}
      {items.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="Inventory empty"
          subtitle="Track seeds, fertilizer, and crop protection with quantity, units, batch IDs, and expiry — standard for traceability."
          actionLabel={farms.length > 0 ? 'Add Item' : undefined}
          onAction={farms.length > 0 ? openAddSheet : undefined}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const low = item.minThreshold > 0 && item.quantity <= item.minThreshold;
            return (
              <EntityCard
                title={item.name}
                subtitle={`${categoryLabel(item.category)} · ${farmName(item.farmId)}`}
                icon="cube-outline"
                badge={low ? 'LOW STOCK' : undefined}
                badgeVariant="warning"
                stats={[
                  `Qty: ${item.quantity} ${item.unit}`,
                  item.lotBatchId ? `Lot: ${item.lotBatchId}` : '',
                  item.expiryDate ? `Exp: ${item.expiryDate}` : '',
                ].filter(Boolean)}
                onPress={() => openEditSheet(item.id)}
                onEdit={() => openEditSheet(item.id)}
                onDelete={() => setActiveItemId(item.id)}
              />
            );
          }}
        />
      )}
      <BottomSheetForm
        visible={sheetOpen}
        title={editingItemId ? 'Edit Inventory Item' : 'Add Inventory Item'}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      >
        <Text style={styles.sectionHint}>
          Record stock like ERP/ag inventory: product, category, quantity, unit, farm, and optional batch/expiry for compliance.
        </Text>

        <Input
          label="Product name"
          required
          value={form.name}
          onChangeText={(v) => patch('name', v)}
          placeholder="NPK 17-17-17"
          icon="flask-outline"
          error={formErrors.name}
        />
        <SelectField
          label="Category"
          required
          value={form.category}
          options={INVENTORY_CATEGORIES.map((c) => ({
            value: c.value,
            label: c.label,
          }))}
          onChange={(v) => patch('category', v)}
          error={formErrors.category}
        />
        {form.category ? (
          <Text style={styles.categoryHint}>
            {INVENTORY_CATEGORIES.find((c) => c.value === form.category)?.hint}
          </Text>
        ) : null}

        <SelectField
          label="Farm"
          required
          value={form.farmId}
          options={farmOptions}
          onChange={(v) => patch('farmId', v)}
          error={formErrors.farmId}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Quantity on hand"
              required
              value={form.quantity}
              onChangeText={(v) => patch('quantity', v)}
              placeholder="120"
              keyboardType="decimal-pad"
              error={formErrors.quantity}
            />
          </View>
          <View style={styles.half}>
            <SelectField
              label="Unit"
              required
              value={form.unit}
              options={INVENTORY_UNITS.map((u) => ({ value: u, label: u }))}
              onChange={(v) => patch('unit', v)}
              error={formErrors.unit}
            />
          </View>
        </View>

        <Input
          label="Reorder level (min threshold)"
          hint="Alert when stock falls to this level"
          value={form.minThreshold}
          onChangeText={(v) => patch('minThreshold', v)}
          placeholder="10"
          keyboardType="decimal-pad"
          error={formErrors.minThreshold}
        />
        <Input
          label="Cost per unit"
          hint="Optional — for margin and application cost tracking"
          value={form.costPerUnit}
          onChangeText={(v) => patch('costPerUnit', v)}
          placeholder="45.00"
          keyboardType="decimal-pad"
          error={formErrors.costPerUnit}
        />
        <Input
          label="Lot / batch ID"
          hint="From supplier label — required for traceability in many regions"
          value={form.lotBatchId}
          onChangeText={(v) => patch('lotBatchId', v)}
          placeholder="LOT-2025-0342"
          icon="barcode-outline"
        />
        <DateField
          label="Expiry date"
          hint="Pick a date"
          value={form.expiryDate}
          onChange={(v) => patch('expiryDate', v)}
          placeholder="YYYY-MM-DD"
          error={formErrors.expiryDate}
        />
        <Input
          label="Storage location"
          hint="Building, shed, or bin (e.g. Equipment Shed — Room A)"
          value={form.storageLocation}
          onChangeText={(v) => patch('storageLocation', v)}
          placeholder="Main store — Shelf 3"
          icon="home-outline"
        />
        <Input
          label="Notes"
          hint="NPK formula, supplier, container size"
          value={form.notes}
          onChangeText={(v) => patch('notes', v)}
          placeholder="46-0-0 urea, 50 kg bags"
          multiline
        />
        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
        {saving ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} /> : null}
      </BottomSheetForm>

      <BottomSheetForm
        visible={!!activeItemId}
        title="Delete Item?"
        onClose={() => {
          setActiveItemId(null);
        }}
        onSave={() => setActiveItemId(null)}
      >
        {activeItem ? (
          <>
            <Text style={styles.sectionHint}>
              This will permanently delete the inventory item.
            </Text>
            <Text style={styles.actionTitle}>{activeItem.name}</Text>
            <Text style={styles.actionSub}>
              {categoryLabel(activeItem.category)} · {farmName(activeItem.farmId)}
            </Text>
            <Text style={styles.actionSub}>
              Qty: {activeItem.quantity} {activeItem.unit}
            </Text>
            <View style={{ marginTop: 14 }}>
              <Button variant="danger" onPress={() => void deleteSelected()} disabled={saving} loading={saving}>
                Delete item
              </Button>
            </View>
          </>
        ) : null}
      </BottomSheetForm>

      <ScreenLock visible={saving} message="Please wait…" />
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
  actionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: Colors.foreground,
    marginBottom: 4,
  },
  actionSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  dangerText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.danger,
  },
  categoryHint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.accent,
    marginTop: -8,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  saveError: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 8,
  },
});
