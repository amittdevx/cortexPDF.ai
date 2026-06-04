/**
 * Root layout — composes the app shell:
 *   GestureHandlerRootView → ThemeProvider → themed root → ErrorBoundary → Stack.
 *
 * Runs bootstrap (storage hydrate + DB migrate), drives the status bar from the
 * resolved theme, and keeps the animated launch splash on top until the first
 * frame settles.
 */

import { ErrorBoundary } from '@/components';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useBootstrap } from '@/hooks/use-bootstrap';
import { useTheme } from '@/hooks/use-theme';
import { ThemeProvider } from '@/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const { scheme, colors } = useTheme();
  useBootstrap();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </ErrorBoundary>
      <AnimatedSplashOverlay />
    </View>
  );
}
