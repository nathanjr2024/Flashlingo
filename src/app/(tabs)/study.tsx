/**
 * Study Screen - FlashLingo
 * Flip card study session with SRS ratings and audio pronunciation.
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../presentation/theme';
import { FlipCard } from '../../presentation/components/FlipCard';
import { RatingButtons } from '../../presentation/components/RatingButtons';
import { useStudySession } from '../../presentation/hooks/useStudySession';
import { audioService } from '../../data/services/audioService';
import type { Rating } from '../../domain/srs/types';

export default function StudyScreen() {
  const {
    currentCard,
    isFlipped,
    isComplete,
    progress,
    currentIndex,
    totalCards,
    stats,
    startSession,
    flipCard,
    rateCard,
  } = useStudySession('due');

  useEffect(() => {
    startSession();
  }, []);

  const handlePlayAudio = async () => {
    if (currentCard) {
      await audioService.playPronunciation(currentCard.word);
    }
  };

  const handleRate = (rating: Rating) => {
    rateCard(rating);
  };

  // Session complete screen
  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.completeContent}>
          <Text style={styles.bigEmoji}>{'\u{1F389}'}</Text>
          <Text style={styles.completeTitle}>Sessão Concluída!</Text>
          <Text style={styles.completeSubtitle}>
            Incrível! Continue assim para manter sua sequência.
          </Text>
          <View style={styles.sessionStats}>
            <View style={styles.sessionStat}>
              <Text style={styles.sessionStatNum}>{stats.totalCards}</Text>
              <Text style={styles.sessionStatLabel}>Cartões</Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={styles.sessionStatNum}>{stats.correctCount}</Text>
              <Text style={styles.sessionStatLabel}>Corretas</Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={styles.sessionStatNum}>{stats.accuracy}%</Text>
              <Text style={styles.sessionStatLabel}>Precisão</Text>
            </View>
          </View>
          <Pressable style={styles.primaryBtn} onPress={startSession}>
            <Text style={styles.primaryBtnText}>{'\u{1F501}'} Estudar Novamente</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // No cards to study
  if (!currentCard && totalCards === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.emptyContent}>
          <Text style={styles.bigEmoji}>{'\u{1F4DA}'}</Text>
          <Text style={styles.emptyTitle}>Nenhum cartão para revisar</Text>
          <Text style={styles.emptySubtitle}>
            Todas as palavras estão em dia! Volte mais tarde ou adicione novas palavras.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={() => startSession()}>
            <Text style={styles.primaryBtnText}>Recarregar</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active study session
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.counter}>
            {currentIndex + 1}/{totalCards}
          </Text>
        </View>

        {/* Flip Card */}
        {currentCard && (
          <FlipCard
            isFlipped={isFlipped}
            onFlip={flipCard}
            front={
              <View style={styles.cardContent}>
                <Text style={styles.cardPos}>{currentCard.pos}</Text>
                <Text style={styles.cardWord}>{currentCard.word}</Text>
                {currentCard.phonetic ? (
                  <Text style={styles.cardPhonetic}>{currentCard.phonetic}</Text>
                ) : null}
                <Pressable onPress={handlePlayAudio} style={styles.audioBtnFront}>
                  <Ionicons name="volume-high" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.cardHint}>Toque para revelar</Text>
              </View>
            }
            back={
              <View style={styles.cardContent}>
                <Text style={styles.cardPosBack}>{currentCard.pos}</Text>
                <Text style={styles.cardTranslation}>{currentCard.translation}</Text>
                <Pressable onPress={handlePlayAudio} style={styles.audioBtnBack}>
                  <Ionicons name="volume-high" size={24} color={Colors.primary} />
                </Pressable>
                {currentCard.example ? (
                  <Text style={styles.cardExample}>"{currentCard.example}"</Text>
                ) : null}
                {currentCard.examplePt ? (
                  <Text style={styles.cardExamplePt}>"{currentCard.examplePt}"</Text>
                ) : null}
              </View>
            }
          />
        )}

        {/* Tap hint or rating buttons */}
        {!isFlipped && (
          <Text style={styles.tapHint}>
            {'\u{1F446}'} Toque no cartão para ver a resposta
          </Text>
        )}
        <RatingButtons visible={isFlipped} onRate={handleRate} />
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e7ff',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  counter: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPos: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardPosBack: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.primary,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardWord: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.extraBold,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cardPhonetic: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  cardHint: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
  },
  cardTranslation: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cardExample: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardExamplePt: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  audioBtnFront: {
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  audioBtnBack: {
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tapHint: {
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  // Complete screen
  completeContent: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  completeTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  completeSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sessionStat: {
    alignItems: 'center',
  },
  sessionStatNum: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
  },
  sessionStatLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  // Empty screen
  emptyContent: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});