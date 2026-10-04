/**
 * Root Layout - Expo Router
 * Sets up the root navigation with Reanimated and SafeArea providers.
 * Initializes seed data and daily notification reminders on startup.
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { NotificationService } from '../data/services/notificationService';
import { SeedService } from '../data/services/seedService';

export default function RootLayout() {
  useEffect(() => {
    // Seed demo words on first launch
    try {
      SeedService.seedIfEmpty();
    } catch {
      // Ignore seed errors (e.g., DB not ready yet)
    }
    // Set up notification handler and schedule daily reminder
    NotificationService.setupNotificationHandler();
    NotificationService.scheduleDailyReminder().catch(() => {
      // Ignore notification errors (permissions not granted, etc.)
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});