import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { StatCard } from '@/components/dashboard/StatCard';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Colors, iconWellBg } from '@/constants/colors';
import { useActivities } from '@/hooks/useActivities';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { recentForDashboard, loading: activitiesLoading } = useActivities();
  const firstName = user?.name?.split(' ')[0] ?? 'Farmer';
  const loading = statsLoading || activitiesLoading;

  const dateLine = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingState message="Syncing your farm data…" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Good morning, {firstName} 👋</Text>
        <Text style={styles.dateLine}>{dateLine}</Text>

        <View style={styles.statGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCell}>
              <StatCard
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                icon={stat.icon}
                trend={stat.trend}
                trendValue={stat.trendValue}
              />
            </View>
          ))}
        </View>

        <WeatherCard />

        <SectionHeader title="Recent Activity" actionLabel="See all →" onAction={() => {}} />

        {recentForDashboard.length === 0 ? (
          <Card>
            <Text style={styles.emptyActivity}>No recent activity. Log your first field task.</Text>
          </Card>
        ) : (
          recentForDashboard.map((item) => (
            <Card key={item.id} style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="leaf-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySub}>
                    {item.farm} · {item.time}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  greeting: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 26,
    color: Colors.primary,
    marginBottom: 4,
  },
  dateLine: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    marginBottom: 24,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCell: { width: '48%' },
  activityCard: { marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: iconWellBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityText: { flex: 1 },
  activityTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: Colors.foreground,
  },
  activitySub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  emptyActivity: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
});
