import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  hint?: string;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  required,
  hint,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: Colors.mutedForeground,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: Colors.foreground,
  },
  chipTextActive: { color: '#fff' },
  error: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.danger,
    marginTop: 6,
  },
});
