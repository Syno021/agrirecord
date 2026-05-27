import { InventoryCategory } from '@/types/firestore';

export type FarmFormValues = {
  name: string;
  location: string;
  sizeHectares: string;
  primaryCrop: string;
  irrigationType: string;
  soilType: string;
  description: string;
};

export type FarmFormErrors = Partial<Record<keyof FarmFormValues, string>>;

export function validateFarmForm(values: FarmFormValues): FarmFormErrors {
  const errors: FarmFormErrors = {};
  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Farm name is required (min 2 characters)';
  }
  if (!values.location.trim()) {
    errors.location = 'Location is required (e.g. Nakuru, Kenya)';
  }
  const hectares = parseFloat(values.sizeHectares);
  if (!values.sizeHectares.trim() || Number.isNaN(hectares) || hectares <= 0) {
    errors.sizeHectares = 'Enter a valid farm size in hectares';
  }
  if (!values.primaryCrop.trim()) {
    errors.primaryCrop = 'Primary crop is required for planning and records';
  }
  if (!values.irrigationType) {
    errors.irrigationType = 'Select how this farm is irrigated';
  }
  return errors;
}

export type InventoryFormValues = {
  name: string;
  category: InventoryCategory | '';
  farmId: string;
  quantity: string;
  unit: string;
  minThreshold: string;
  costPerUnit: string;
  lotBatchId: string;
  expiryDate: string;
  storageLocation: string;
  notes: string;
};

export type InventoryFormErrors = Partial<Record<keyof InventoryFormValues, string>>;

export function validateInventoryForm(
  values: InventoryFormValues,
  hasFarms: boolean,
): InventoryFormErrors {
  const errors: InventoryFormErrors = {};
  if (!values.name.trim()) errors.name = 'Product name is required';
  if (!values.category) errors.category = 'Select a category';
  if (!hasFarms) {
    errors.farmId = 'Create a farm first before adding inventory';
  } else if (!values.farmId) {
    errors.farmId = 'Select which farm this stock belongs to';
  }
  const qty = parseFloat(values.quantity);
  if (!values.quantity.trim() || Number.isNaN(qty) || qty < 0) {
    errors.quantity = 'Enter quantity on hand (0 or more)';
  }
  if (!values.unit.trim()) errors.unit = 'Unit is required (kg, L, bags, etc.)';
  const min = parseFloat(values.minThreshold);
  if (values.minThreshold.trim() && (Number.isNaN(min) || min < 0)) {
    errors.minThreshold = 'Reorder level must be 0 or more';
  }
  if (values.expiryDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(values.expiryDate.trim())) {
    errors.expiryDate = 'Use format YYYY-MM-DD';
  }
  const cost = parseFloat(values.costPerUnit);
  if (values.costPerUnit.trim() && (Number.isNaN(cost) || cost < 0)) {
    errors.costPerUnit = 'Cost must be 0 or more';
  }
  return errors;
}

export const emptyFarmForm = (): FarmFormValues => ({
  name: '',
  location: '',
  sizeHectares: '',
  primaryCrop: '',
  irrigationType: '',
  soilType: '',
  description: '',
});

export const emptyInventoryForm = (): InventoryFormValues => ({
  name: '',
  category: '',
  farmId: '',
  quantity: '',
  unit: 'kg',
  minThreshold: '',
  costPerUnit: '',
  lotBatchId: '',
  expiryDate: '',
  storageLocation: '',
  notes: '',
});
