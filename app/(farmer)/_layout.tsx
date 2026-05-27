import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({
  active,
  inactive,
  focused,
  color,
}: {
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
}

export default function FarmerLayout() {
  const insets = useSafeAreaInsets();

  const baseHeight = Platform.OS === 'ios' ? 64 : 56;
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 18 : 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: baseHeight + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: 'Outfit_600SemiBold',
          fontSize: 10,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="grid" inactive="grid-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'Farms',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="map" inactive="map-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="cube" inactive="cube-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="roadmaps"
        options={{
          title: 'Roadmaps',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="compass" inactive="compass-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="farm"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="notifications" inactive="notifications-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon active="person" inactive="person-outline" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
