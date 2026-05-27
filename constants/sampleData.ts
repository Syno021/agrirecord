export const sampleFarms = [
  {
    id: '1',
    name: 'Sunrise Farm',
    location: 'Nakuru, Kenya',
    acres: 24,
    crops: ['Maize', 'Wheat'],
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Green Valley',
    location: 'Eldoret, Kenya',
    acres: 12,
    crops: ['Tea'],
    status: 'active' as const,
  },
];

export const sampleActivities = [
  {
    id: '1',
    title: 'Applied fertilizer',
    farm: 'Sunrise Farm',
    date: '2025-05-14',
    type: 'fertilization',
  },
  {
    id: '2',
    title: 'Irrigation cycle',
    farm: 'Green Valley',
    date: '2025-05-13',
    type: 'irrigation',
  },
  {
    id: '3',
    title: 'Pest inspection',
    farm: 'Sunrise Farm',
    date: '2025-05-12',
    type: 'inspection',
  },
];

export const sampleInventory = [
  {
    id: '1',
    name: 'NPK Fertilizer',
    quantity: 120,
    unit: 'kg',
    category: 'fertilizer',
  },
  {
    id: '2',
    name: 'Maize Seeds',
    quantity: 45,
    unit: 'kg',
    category: 'seeds',
  },
];

export const sampleReminders = [
  {
    id: '1',
    title: 'Spray fungicide — Maize field',
    due: '2025-05-10',
    status: 'overdue' as const,
    completed: false,
  },
  {
    id: '2',
    title: 'Soil test — Green Valley',
    due: '2025-05-16',
    status: 'pending' as const,
    completed: false,
  },
  {
    id: '3',
    title: 'Apply mulch',
    due: '2025-05-18',
    status: 'pending' as const,
    completed: false,
  },
  {
    id: '4',
    title: 'Harvest readiness check',
    due: '2025-05-14',
    status: 'pending' as const,
    completed: true,
  },
];

export const sampleStats = [
  { label: 'Active Farms', value: '3', icon: 'map-outline' as const },
  {
    label: 'Harvest Yield',
    value: '2,400',
    unit: 'kg',
    icon: 'leaf-outline' as const,
    trend: 'up' as const,
    trendValue: '12%',
  },
  {
    label: 'Tasks Due',
    value: '7',
    icon: 'checkmark-circle-outline' as const,
  },
  {
    label: 'Alerts',
    value: '2',
    icon: 'warning-outline' as const,
    trend: 'down' as const,
    trendValue: '3%',
  },
];

export const sampleRoadmaps = [
  {
    id: '1',
    crop: 'Maize',
    season: 'Long Rains 2025',
    completedSteps: 2,
    totalSteps: 5,
    insight:
      'Based on your soil data, consider delaying sowing by 3–5 days if rainfall remains below 40mm this week.',
    steps: [
      {
        id: '1',
        title: 'Soil Preparation',
        description: 'Complete seedbed preparation and apply compost.',
        status: 'done' as const,
      },
      {
        id: '2',
        title: 'Sowing',
        description: 'Sow seeds at 5cm depth with 25cm row spacing.',
        status: 'active' as const,
      },
      {
        id: '3',
        title: 'Fertilization',
        description: 'Apply N-P-K blend at recommended rates.',
        status: 'pending' as const,
      },
      {
        id: '4',
        title: 'Weed Control',
        description: 'First weeding pass within 3 weeks of emergence.',
        status: 'pending' as const,
      },
      {
        id: '5',
        title: 'Harvest',
        description: 'Monitor moisture content before harvest.',
        status: 'pending' as const,
      },
    ],
  },
  {
    id: '2',
    crop: 'Tea',
    season: 'Year-round',
    completedSteps: 4,
    totalSteps: 4,
    insight: 'Plucking cycle is on track. Schedule pruning in June.',
    steps: [
      {
        id: '1',
        title: 'Plucking Round 1',
        description: 'Two leaves and a bud standard.',
        status: 'done' as const,
      },
      {
        id: '2',
        title: 'Fertilizer Application',
        description: 'Apply tea-specific NPK.',
        status: 'done' as const,
      },
      {
        id: '3',
        title: 'Pest Monitoring',
        description: 'Check for red spider mite.',
        status: 'done' as const,
      },
      {
        id: '4',
        title: 'Quality Grading',
        description: 'Sort and grade harvested leaves.',
        status: 'done' as const,
      },
    ],
  },
];

export const recentActivities = [
  {
    id: '1',
    title: 'Fertilizer applied',
    farm: 'Sunrise Farm',
    time: '2h ago',
  },
  {
    id: '2',
    title: 'Irrigation completed',
    farm: 'Green Valley',
    time: '5h ago',
  },
  {
    id: '3',
    title: 'Soil sample collected',
    farm: 'Sunrise Farm',
    time: 'Yesterday',
  },
];
