import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EntityCard } from '@/components/shared/EntityCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { useFarmers } from '@/hooks/useFarmers';

export default function FarmersScreen() {
  const { farmers, loading, error } = useFarmers();

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Farmers" />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Farmers" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {farmers.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No farmers registered"
          subtitle="Farmer accounts will appear here once they sign up."
        />
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EntityCard
              title={item.name}
              subtitle={item.farm}
              icon="people-outline"
              stats={[item.location, 'Active']}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  error: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.danger,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
});
