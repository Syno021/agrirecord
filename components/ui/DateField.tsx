import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

type Props = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** ISO `YYYY-MM-DD` */
  value?: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

function pad2(n: number) {
  return `${n}`.padStart(2, '0');
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromYmd(ymd?: string): Date | null {
  if (!ymd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  const date = new Date(y, mo - 1, da);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function DateField({ label, required, hint, error, value, onChange, placeholder }: Props) {
  const [show, setShow] = useState(false);
  const borderColor = error ? Colors.danger : Colors.border;

  const selected = useMemo(() => fromYmd(value) ?? new Date(), [value]);
  const display = value?.trim() ? value.trim() : placeholder ?? 'YYYY-MM-DD';

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShow(false);
    if (event.type === 'dismissed') return;
    if (!date) return;
    onChange(toYmd(date));
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <Pressable
        onPress={() => setShow(true)}
        style={[styles.row, { borderColor }, error && styles.rowError]}
      >
        <Ionicons name="calendar-outline" size={20} color={Colors.mutedForeground} />
        <Text style={[styles.value, !value?.trim() && styles.placeholder]}>{display}</Text>
      </Pressable>

      {show ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      ) : null}

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
    marginBottom: 8,
  },
  hint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.mutedForeground,
    marginBottom: 8,
    marginTop: -4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: Colors.muted,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 10,
  },
  rowError: {},
  value: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: Colors.foreground,
  },
  placeholder: { color: Colors.mutedForeground },
  error: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.danger,
    marginTop: 6,
  },
});

