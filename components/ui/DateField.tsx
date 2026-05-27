import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
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

/** Web: native HTML date input (reliable in browsers). */
function WebDateInput({
  value,
  onChange,
  borderColor,
  hasError,
}: {
  value?: string;
  onChange: (next: string) => void;
  borderColor: string;
  hasError: boolean;
}) {
  const inputStyle: ViewStyle & Record<string, string | number> = {
    flex: 1,
    minHeight: 52,
    width: '100%',
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: Colors.foreground,
    backgroundColor: Colors.muted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor,
    borderStyle: 'solid',
    paddingLeft: 44,
    paddingRight: 16,
    paddingTop: 14,
    paddingBottom: 14,
    outlineStyle: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  };

  return (
    <View style={[styles.row, { borderColor }, hasError && styles.rowError, styles.webRow]}>
      <Ionicons
        name="calendar-outline"
        size={20}
        color={Colors.mutedForeground}
        style={styles.webIcon}
      />
      {/* @ts-expect-error — RN Web renders a real <input> */}
      <input
        type="date"
        value={value?.trim() || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const next = e.target.value;
          if (next) onChange(next);
        }}
        style={inputStyle}
        aria-label="Date"
      />
    </View>
  );
}

/** iOS: picker inside a modal with Done (works inside bottom sheets). */
function IOSDatePickerModal({
  visible,
  value,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalBar}>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Select date</Text>
            <Pressable onPress={() => onConfirm(draft)} hitSlop={12}>
              <Text style={styles.modalDone}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={draft}
            mode="date"
            display="spinner"
            onChange={(_: DateTimePickerEvent, date?: Date) => {
              if (date) setDraft(date);
            }}
            style={styles.iosPicker}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DateField({ label, required, hint, error, value, onChange, placeholder }: Props) {
  const [showNative, setShowNative] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);
  const borderColor = error ? Colors.danger : Colors.border;
  const selected = useMemo(() => fromYmd(value) ?? new Date(), [value]);
  const display = value?.trim() ? value.trim() : placeholder ?? 'YYYY-MM-DD';

  const onAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowNative(false);
    if (event.type === 'dismissed' || event.type === 'neutralButtonPressed') return;
    if (!date) return;
    onChange(toYmd(date));
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrapper}>
        {label ? (
          <Text style={styles.label}>
            {label}
            {required ? ' *' : ''}
          </Text>
        ) : null}
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        <WebDateInput
          value={value}
          onChange={onChange}
          borderColor={borderColor}
          hasError={!!error}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  if (Platform.OS === 'ios') {
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
          onPress={() => setIosOpen(true)}
          style={[styles.row, { borderColor }, error && styles.rowError]}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.mutedForeground} />
          <Text style={[styles.value, !value?.trim() && styles.placeholder]}>{display}</Text>
        </Pressable>
        <IOSDatePickerModal
          visible={iosOpen}
          value={selected}
          onClose={() => setIosOpen(false)}
          onConfirm={(date) => {
            onChange(toYmd(date));
            setIosOpen(false);
          }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  // Android: system dialog when showNative is true
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
        onPress={() => setShowNative(true)}
        style={[styles.row, { borderColor }, error && styles.rowError]}
      >
        <Ionicons name="calendar-outline" size={20} color={Colors.mutedForeground} />
        <Text style={[styles.value, !value?.trim() && styles.placeholder]}>{display}</Text>
      </Pressable>
      {showNative ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display="default"
          onChange={onAndroidChange}
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
  webRow: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  webIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    pointerEvents: 'none',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  modalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.foreground,
  },
  modalCancel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: Colors.mutedForeground,
  },
  modalDone: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
  iosPicker: {
    height: 220,
    width: '100%',
  },
});
