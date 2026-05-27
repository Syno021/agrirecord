/** Entity types aligned with firebase-blueprint.json */

export type BlueprintUserRole = 'farmer' | 'admin';
export type AppUserRole = BlueprintUserRole | 'supplier';

export type UserProfile = {
  name: string;
  email: string;
  role: BlueprintUserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  farmName?: string;
};

export type Farm = {
  ownerId: string;
  name: string;
  location?: string;
  sizeHectares?: number;
  description?: string;
  /** Main crop grown (field planning standard) */
  primaryCrop?: string;
  irrigationType?: string;
  soilType?: string;
  isActive: boolean;
  collaborators?: string[];
};

export type ActivityLogType =
  | 'planting'
  | 'fertilising'
  | 'pesticide'
  | 'harvesting'
  | 'irrigation'
  | 'other';

export type ActivityLog = {
  farmId: string;
  recordedBy: string;
  farmOwnerId: string;
  type: ActivityLogType;
  date: string;
  cropName: string;
  productUsed?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  photoUrl?: string;
  isActive: boolean;
};

export type RoadmapStatus = 'draft' | 'active' | 'completed' | 'archived';
export type PlantingEnvironment = 'outdoor' | 'indoor' | 'greenhouse';

export type Roadmap = {
  farmId: string;
  createdBy: string;
  title: string;
  cropName: string;
  plantingEnvironment: PlantingEnvironment;
  status: RoadmapStatus;
  aiGeneratedPlan?: string;
  promptUsed?: string;
  imageUrl?: string;
  isActive: boolean;
};

export type RoadmapStepCategory =
  | 'preparation'
  | 'planting'
  | 'fertilising'
  | 'watering'
  | 'pest_control'
  | 'harvesting';

export type RoadmapStep = {
  roadmapId: string;
  stepNumber: number;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  category: RoadmapStepCategory;
};

export type ReminderType =
  | 'weather'
  | 'harvest'
  | 'fertilise'
  | 'water'
  | 'pesticide'
  | 'custom';

export type Reminder = {
  userId: string;
  farmId: string;
  roadmapStepId?: string;
  type: ReminderType;
  message: string;
  scheduledAt: string;
  isSent: boolean;
  isRead: boolean;
};

export type CourseGuide = {
  uploadedBy: string;
  title: string;
  content: string;
  fileUrl?: string;
  fileType?: 'pdf' | 'text';
  isActive: boolean;
};

export type InventoryCategory =
  | 'seeds'
  | 'fertilizer'
  | 'protection'
  | 'materials'
  | 'harvested'
  | 'other';

export type InventoryItem = {
  userId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  farmId: string;
  notes?: string;
  /** Lot/batch for traceability (regulatory & quality) */
  lotBatchId?: string;
  /** ISO date — critical for seeds & crop protection */
  expiryDate?: string;
  storageLocation?: string;
  lastUpdated: string;
};

export type InventoryAuditType = 'addition' | 'drawdown' | 'reconciliation';

export type InventoryAudit = {
  userId: string;
  itemId: string;
  itemName: string;
  type: InventoryAuditType;
  changeAmount: number;
  reason: string;
  timestamp: string;
};

/** Document with Firestore id */
export type WithId<T> = T & { id: string };
