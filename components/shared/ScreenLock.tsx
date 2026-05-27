import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

export function ScreenLock({ visible, message }: { visible: boolean; message?: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>{message ?? 'Working…'}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
});

