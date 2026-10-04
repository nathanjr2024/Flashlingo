/**
 * Home Screen - FlashLingo
 * Displays streak, stats counters, and study action buttons.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../presentation/theme';
import { WordRepository } from '../../data/repositories/wordRepository';
import { StatsRepository } from '../../data/repositories/statsRepository';

export default function HomeScreen() {
  const router = useRouter();
  const [totalWords, setTotalWords] = useState(0);
  const [dueToday, setDueToday] = useState(0);
  const [learned, setLearned] = useState(0);
  const [newWords, setNewWords] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const wordRepo = new WordRepository();
    const statsRepo = new StatsRepository();
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${day}`;

    setTotalWords(wordRepo.count());
    setDueToday(wordRepo.getDue(today).length);
    setLearned(wordRepo.getLearned().length);
    setNewWords(wordRepo.getNew().length);

    const stats = statsRepo.get();
    setStreak(stats.streak);

    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    setDateStr(d.toLocaleDateString('pt-BR', opts));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FlashLingo</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <Text style={styles.flag}>{'\u{1F1FA}\u{1F1F8}'}</Text>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>{'\u{1F525}'}</Text>
          <View>
            <Text style={styles.streakNum}>{streak} dia{streak !== 1 ? 's' : ''}</Text>
            <Text style={styles.streakLabel}>de sequência de estudos!</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{totalWords}</Text>
            <Text style={styles.statLabel}>Total de Palavras</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{dueToday}</Text>
            <Text style={styles.statLabel}>Para Revisar Hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{learned}</Text>
            <Text style={styles.statLabel}>Aprendidas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{newWords}</Text>
            <Text style={styles.statLabel}>Novas</Text>
          </View>
        </View>

        {/* Study Buttons */}
        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.push('/(tabs)/study')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Estudar revisões de hoje, ${dueToday} cartões`}
        >
          <Text style={styles.primaryBtnText}>
            {'▶'} Estudar Revisões de Hoje
          </Text>
          {dueToday > 0 && (
            <View style={styles.dueBadge}>
              <Text style={styles.dueBadgeText}>{dueToday}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push('/(tabs)/study')}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Estudar todas as palavras"
        >
          <Text style={styles.secondaryBtnText}>
            {'\u{1F4DA}'} Estudar Todas as Palavras
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
  },
  date: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  flag: {
    fontSize: 32,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  streakIcon: {
    fontSize: 48,
  },
  streakNum: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extraBold,
    color: '#ffffff',
  },
  streakLabel: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statNum: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  dueBadge: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
  },
  dueBadgeText: {
    color: '#ffffff',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
});