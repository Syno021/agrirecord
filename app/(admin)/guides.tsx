import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EntityCard } from '@/components/shared/EntityCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { useCourseGuides } from '@/hooks/useCourseGuides';

export default function GuidesScreen() {
  const { guides, loading, error } = useCourseGuides();

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Guides" />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Guides" showAdd onAdd={() => {}} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {guides.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="No guides published"
          subtitle="Upload course guides for AI-assisted recommendations."
        />
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EntityCard
              title={item.title}
              subtitle={item.fileType ?? 'Guide'}
              icon="book-outline"
              badge="PUBLISHED"
              stats={[`${item.content.slice(0, 40)}…`]}
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
