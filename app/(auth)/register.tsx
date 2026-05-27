import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Shadows } from '@/constants/colors';
import { useAuth, UserRole } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [cardAnim]);

  const cardStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    const result = await register({ email, password, name, role, farmName });
    setLoading(false);
    if (result.ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error ?? 'Registration failed');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>AgriRecord</Text>
          <Text style={styles.tagline}>Precision Farm Management</Text>
        </View>

        <Animated.View style={[styles.card, Shadows.soft, cardStyle]}>
          <Text style={styles.welcome}>Create account</Text>
          <Text style={styles.sub}>Join the precision farming network</Text>

          <View style={styles.roleRow}>
            {(['farmer', 'admin'] as const).map((r) => (
              <Pressable
                key={r}
                style={[styles.rolePill, role === r && styles.rolePillActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r === 'farmer' ? 'Farmer' : 'Admin'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input label="Full Name" icon="person-outline" value={name} onChangeText={setName} placeholder="James Mwangi" />
          <Input label="Farm Name (optional)" icon="business-outline" value={farmName} onChangeText={setFarmName} placeholder="Sunrise Farm" />
          <Input label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="you@farm.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button onPress={handleRegister} loading={loading}>
            Create Account
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.link}>Sign in →</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: '#fff' },
  tagline: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.accentLight, marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: 28, padding: 28 },
  welcome: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.foreground, marginBottom: 4 },
  sub: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mutedForeground, marginBottom: 20 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.muted,
    alignItems: 'center',
  },
  rolePillActive: { backgroundColor: Colors.primary },
  roleText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.mutedForeground },
  roleTextActive: { color: '#fff' },
  error: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.danger, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' },
  footerText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mutedForeground },
  link: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.accent },
});
