import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, iconWellBg } from '@/constants/colors';

type Props = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info';
  stats: string[];
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function EntityCard({
  title,
  subtitle,
  icon,
  badge,
  badgeVariant = 'success',
  stats,
  onPress,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconWell}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge ? <Badge label={badge} variant={badgeVariant} /> : null}
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {onEdit || onDelete ? (
          <View style={styles.actions}>
            {onEdit ? (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                hitSlop={10}
                style={styles.actionBtn}
              >
                <Ionicons name="pencil-outline" size={18} color={Colors.mutedForeground} />
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                hitSlop={10}
                style={styles.actionBtn}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.divider} />
      <Text style={styles.stats}>{stats.join('   ·   ')}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: iconWellBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.foreground,
    flex: 1,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  stats: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 10 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
});
