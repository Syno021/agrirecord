import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

type Variant = 'success' | 'warning' | 'danger' | 'info';

type Props = {
  label: string;
  variant?: Variant;
};

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  success: { bg: '#E8F5F0', text: Colors.primary },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  danger: { bg: '#FEE2E2', text: Colors.danger },
  info: { bg: Colors.muted, text: Colors.mutedForeground },
};

export function Badge({ label, variant = 'info' }: Props) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
