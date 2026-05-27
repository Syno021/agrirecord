import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, iconWellBg } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

const orders = [
  { id: '1', farm: 'Sunrise Farm', item: 'NPK Fertilizer 50kg', status: 'Pending' },
  { id: '2', farm: 'Green Valley', item: 'Maize Seeds 20kg', status: 'Shipped' },
];

export default function SupplierScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconWell}>
          <Ionicons name="storefront-outline" size={28} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Supplier Portal</Text>
        <Text style={styles.sub}>{user?.name ?? 'Your Company'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Orders</Text>
      {orders.map((order) => (
        <Card key={order.id} style={styles.orderCard}>
          <Text style={styles.orderFarm}>{order.farm}</Text>
          <Text style={styles.orderItem}>{order.item}</Text>
          <Text style={styles.orderStatus}>{order.status}</Text>
        </Card>
      ))}

      <View style={styles.logout}>
        <Button variant="outline" onPress={() => void logout()}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconWell: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: iconWellBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: Colors.foreground,
  },
  sub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 17,
    color: Colors.foreground,
    marginBottom: 12,
  },
  orderCard: { marginBottom: 12 },
  orderFarm: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.foreground,
  },
  orderItem: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  orderStatus: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.accent,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  logout: { marginTop: 24 },
});
