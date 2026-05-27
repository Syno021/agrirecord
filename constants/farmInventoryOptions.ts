import { InventoryCategory } from '@/types/firestore';

/** Common units in ag input inventory (ISO / industry practice) */
export const INVENTORY_UNITS = ['kg', 'g', 'L', 'mL', 'bags', 'tonnes', 'units'] as const;
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

export const INVENTORY_CATEGORIES: {
  value: InventoryCategory;
  label: string;
  hint: string;
}[] = [
  { value: 'seeds', label: 'Seeds', hint: 'Varieties, hybrids, treated seed' },
  { value: 'fertilizer', label: 'Fertilizer', hint: 'NPK, urea, organic amendments' },
  { value: 'protection', label: 'Crop protection', hint: 'Pesticides, fungicides, herbicides' },
  { value: 'materials', label: 'Materials', hint: 'Mulch, packaging, tools, fuel' },
  { value: 'harvested', label: 'Harvested produce', hint: 'Grain, fruit, fiber in storage' },
  { value: 'other', label: 'Other', hint: 'Miscellaneous stock' },
];

export const IRRIGATION_TYPES = [
  { value: 'rain_fed', label: 'Rain-fed' },
  { value: 'drip', label: 'Drip' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'furrow', label: 'Furrow / flood' },
  { value: 'pivot', label: 'Center pivot' },
  { value: 'manual', label: 'Manual / bucket' },
] as const;

export type IrrigationType = (typeof IRRIGATION_TYPES)[number]['value'];

export const SOIL_TYPES = [
  { value: 'clay', label: 'Clay' },
  { value: 'loam', label: 'Loam' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'silt', label: 'Silt' },
  { value: 'peat', label: 'Peat / organic' },
  { value: 'volcanic', label: 'Volcanic' },
  { value: 'unknown', label: 'Not sure' },
] as const;

export type SoilType = (typeof SOIL_TYPES)[number]['value'];

export const COMMON_CROPS = [
  'Maize',
  'Wheat',
  'Rice',
  'Tea',
  'Coffee',
  'Beans',
  'Potatoes',
  'Tomatoes',
  'Sorghum',
  'Cotton',
  'Sugarcane',
  'Mixed / other',
] as const;
