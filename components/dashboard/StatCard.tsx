import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, iconWellBg } from '@/constants/colors';

type Props = {
  label: string;
  value: string;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: 'up' | 'down';
  trendValue?: string;
};

export function StatCard({ label, value, unit, icon, trend, trendValue }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWell}>
          <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        {trend && trendValue ? (
          <View style={[styles.trendPill, trend === 'up' ? styles.trendUp : styles.trendDown]}>
            <Text style={[styles.trendText, trend === 'up' ? styles.trendUpText : styles.trendDownText]}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minWidth: '47%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: iconWellBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendUp: { backgroundColor: Colors.accentLight + '40' },
  trendDown: { backgroundColor: '#FEE2E2' },
  trendText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
  },
  trendUpText: { color: Colors.primary },
  trendDownText: { color: Colors.danger },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 30,
    color: Colors.primary,
  },
  unit: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  label: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
});
