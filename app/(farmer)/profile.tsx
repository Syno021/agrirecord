import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

const accountItems = [
  { icon: 'person-outline' as const, label: 'Edit Profile' },
  { icon: 'notifications-outline' as const, label: 'Notification Settings' },
  { icon: 'language-outline' as const, label: 'Language' },
];

const farmItems = [
  { icon: 'map-outline' as const, label: 'My Farms' },
  { icon: 'scale-outline' as const, label: 'Units & Measurements' },
];

const supportItems = [
  { icon: 'help-circle-outline' as const, label: 'Help Center' },
  { icon: 'shield-outline' as const, label: 'Privacy Policy' },
  { icon: 'document-text-outline' as const, label: 'Terms of Service' },
];

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: { icon: keyof typeof Ionicons.glyphMap; label: string }[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <Card style={styles.sectionCard}>
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            style={[styles.listItem, i < items.length - 1 && styles.listItemBorder]}
          >
            <View style={styles.itemIcon}>
              <Ionicons name={item.icon} size={18} color={Colors.primary} />
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedForeground} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) ?? 'J'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'James Mwangi'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>FARMER</Text>
        </View>
      </View>

      <View style={styles.body}>
        <ProfileSection title="Account" items={accountItems} />
        <ProfileSection title="Farm Settings" items={farmItems} />
        <ProfileSection title="Support" items={supportItems} />
        <Button variant="danger" onPress={() => void logout()}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: Colors.primary,
  },
  name: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  body: { padding: 20 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  sectionCard: { padding: 0, overflow: 'hidden' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: Colors.foreground,
  },
});
