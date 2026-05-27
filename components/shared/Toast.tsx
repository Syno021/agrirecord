import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export type ToastType = 'success' | 'error' | 'info';

export type ToastMessage = {
  type: ToastType;
  title: string;
  message?: string;
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const y = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    Animated.parallel([
      Animated.spring(y, { toValue: 0, useNativeDriver: true, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(y, { toValue: -24, duration: 160, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) {
          setVisible(false);
          onDismiss();
        }
      });
    }, 2600);
    return () => clearTimeout(t);
  }, [toast, y, opacity, onDismiss]);

  if (!toast || !visible) return null;

  const icon =
    toast.type === 'success'
      ? 'checkmark-circle'
      : toast.type === 'error'
        ? 'close-circle'
        : 'information-circle';

  const bg =
    toast.type === 'success'
      ? Colors.primary
      : toast.type === 'error'
        ? Colors.danger
        : Colors.secondary;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Pressable onPress={onDismiss}>
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: bg, opacity, transform: [{ translateY: y }] },
          ]}
        >
          <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{toast.title}</Text>
            {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    zIndex: 999,
  },
  toast: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  message: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});

