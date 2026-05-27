import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/shared/ToastProvider';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }

    if (user) {
      const roleGroup =
        user.role === 'farmer'
          ? '(farmer)'
          : user.role === 'admin'
            ? '(admin)'
            : '(supplier)';
      if (inAuth || segments[0] !== roleGroup) {
        router.replace(
          user.role === 'farmer'
            ? '/(farmer)'
            : user.role === 'admin'
              ? '/(admin)/guides'
              : '/(supplier)',
        );
      }
    }
  }, [user, isLoading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <AuthProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(farmer)" />
              <Stack.Screen name="(admin)" />
              <Stack.Screen name="(supplier)" />
            </Stack>
          </AuthGate>
          <StatusBar style="dark" />
        </AuthProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
