/**
 * RatingButtons Component
 * 4 rating buttons for SRS feedback after flipping a card.
 */
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import type { Rating } from '../../domain/srs/types';

interface RatingButtonsProps {
  visible: boolean;
  onRate: (rating: Rating) => void;
}

const RATINGS: { rating: Rating; emoji: string; label: string; bg: string; color: string }[] = [
  { rating: 1, emoji: '\u{1F62D}', label: 'Errei', bg: '#fee2e2', color: '#b91c1c' },
  { rating: 2, emoji: '\u{1F605}', label: 'Difícil', bg: '#fef3c7', color: '#b45309' },
  { rating: 3, emoji: '\u{1F60A}', label: 'Bom', bg: '#d1fae5', color: '#065f46' },
  { rating: 4, emoji: '\u{1F929}', label: 'Fácil', bg: '#dbeafe', color: '#1e40af' },
];

export function RatingButtons({ visible, onRate }: RatingButtonsProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {RATINGS.map((r) => (
        <Pressable
          key={r.rating}
          onPress={() => onRate(r.rating)}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: r.bg },
            pressed && styles.pressed,
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`${r.label} (${r.rating} de 4)`}
        >
          <Text style={styles.emoji}>{r.emoji}</Text>
          <Text style={[styles.label, { color: r.color }]}>{r.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: 3,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});