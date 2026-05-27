/** Collection names from firebase-blueprint.json */
export const COLLECTIONS = {
  users: 'users',
  farms: 'farms',
  activityLogs: 'activityLogs',
  roadmaps: 'roadmaps',
  roadmapSteps: 'roadmapSteps',
  reminders: 'reminders',
  courseGuides: 'courseGuides',
  inventoryItems: 'inventoryItems',
  inventoryAudits: 'inventoryAudits',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
