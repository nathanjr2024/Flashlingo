/**
 * Stats Screen - FlashLingo
 * Statistics dashboard with totals, SRS level distribution, activity heatmap, and SRS explanation.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../presentation/theme';
import { WordRepository } from '../../data/repositories/wordRepository';
import { StatsRepository } from '../../data/repositories/statsRepository';
import { SRS_LABELS, SRS_INTERVALS } from '../../domain/srs/types';

interface DayActivity {
  date: string;
  count: number;
}

export default function StatsScreen() {
  const [totalWords, setTotalWords] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [levelCounts, setLevelCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [heatmap, setHeatmap] = useState<DayActivity[]>([]);

  useEffect(() => {
    const wordRepo = new WordRepository();
    const statsRepo = new StatsRepository();

    // Totals
    const allWords = wordRepo.getAll();
    setTotalWords(allWords.length);

    const stats = statsRepo.get();
    setTotalReviews(stats.totalReviews);
    setStreak(stats.streak);
    const acc =
      stats.totalReviews > 0
        ? Math.round((stats.totalCorrect / stats.totalReviews) * 100)
        : 0;
    setAccuracy(acc);

    // Level distribution
    const counts = [0, 0, 0, 0, 0, 0, 0];
    allWords.forEach((w) => {
      if (w.level >= 0 && w.level <= 6) {
        counts[w.level]++;
      }
    });
    setLevelCounts(counts);

    // Heatmap: last 35 days
    const days: DayActivity[] = [];
    const now = new Date();
    for (let i = 34; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;
      days.push({
        date: key,
        count: stats.activity[key] || 0,
      });
    }
    setHeatmap(days);
  }, []);

  const maxLevelCount = Math.max(...levelCounts, 1);

  const getHeatmapColor = (count: number): string => {
    if (count >= 10) return Colors.primary;
    if (count >= 5) return '#818cf8';
    if (count >= 2) return '#a5b4fc';
    if (count >= 1) return '#c7d2fe';
    return '#e0e7ff';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{'\u{1F4CA}'} Estatísticas</Text>
          <Text style={styles.subtitle}>Seu progresso completo</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{totalWords}</Text>
            <Text style={styles.statLabel}>Total Palavras</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{totalReviews}</Text>
            <Text style={styles.statLabel}>Revisões Totais</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>{'\u{1F525}'} Sequência</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Precisão Geral</Text>
          </View>
        </View>

        {/* Level Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{'\u{1F4C8}'} Distribuição por Nível SRS</Text>
          {SRS_LABELS.map((label, i) => (
            <View key={label} style={styles.levelRow}>
              <Text style={styles.levelLabel}>{label}</Text>
              <View style={styles.levelTrack}>
                <View
                  style={[
                    styles.levelFill,
                    { width: `${(levelCounts[i] / maxLevelCount) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.levelCount}>{levelCounts[i]}</Text>
            </View>
          ))}
        </View>

        {/* Activity Heatmap */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{'\u{1F4C5}'} Atividade (últimas 5 semanas)</Text>
          <View style={styles.heatmap}>
            {heatmap.map((day) => (
              <View
                key={day.date}
                style={[
                  styles.heatCell,
                  { backgroundColor: getHeatmapColor(day.count) },
                ]}
              />
            ))}
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={styles.legendText}>Menos</Text>
            <View style={[styles.legendCell, { backgroundColor: '#e0e7ff' }]} />
            <View style={[styles.legendCell, { backgroundColor: '#a5b4fc' }]} />
            <View style={[styles.legendCell, { backgroundColor: '#818cf8' }]} />
            <View style={[styles.legendCell, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Mais</Text>
          </View>
        </View>

        {/* SRS Info */}
        <View style={styles.srsCard}>
          <Text style={styles.srsTitle}>{'\u{1F9EC}'} Como Funciona o SRS</Text>
          {SRS_LABELS.map((label, i) => (
            <View key={label} style={styles.srsStep}>
              <View
                style={[
                  styles.srsDot,
                  i < 6 && styles.srsDotDone,
                ]}
              />
              <Text style={styles.srsText}>
                <Text style={styles.srsBold}>{label}:</Text>{' '}
                {i === 0
                  ? 'Cartão visto pela 1ª vez'
                  : i === 6
                  ? 'Revisar em 90 dias \u{1F3C6}'
                  : `Revisar em ${SRS_INTERVALS[i]} dia${SRS_INTERVALS[i] !== 1 ? 's' : ''}`}
              </Text>
            </View>
          ))}
        </View>
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
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
    fontSize: Typography.sizes.xl + 2,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  cardTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  levelLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    minWidth: 60,
  },
  levelTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  levelCount: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    minWidth: 24,
    textAlign: 'right',
  },
  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatCell: {
    width: '12.5%',
    aspectRatio: 1,
    borderRadius: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  legendText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  srsCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  srsTitle: {
    fontSize: Typography.sizes.base + 2,
    fontWeight: Typography.weights.extraBold,
    color: '#ffffff',
    marginBottom: Spacing.md,
  },
  srsStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  srsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  srsDotDone: {
    backgroundColor: '#ffffff',
  },
  srsText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  srsBold: {
    fontWeight: Typography.weights.bold,
  },
});