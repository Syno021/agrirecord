import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  required?: boolean;
  hint?: string;
};

export function Input({ label, icon, error, required, hint, style, multiline, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? Colors.danger : focused ? Colors.primary : Colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View
        style={[
          styles.inputRow,
          multiline && styles.inputRowMultiline,
          { borderColor },
        ]}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={Colors.mutedForeground} style={styles.icon} />
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={Colors.mutedForeground}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: Colors.muted,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    minHeight: 96,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: Colors.foreground,
    paddingVertical: 14,
  },
  inputMultiline: {
    minHeight: 72,
    paddingVertical: 0,
  },
  error: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.danger,
    marginTop: 6,
  },
});
