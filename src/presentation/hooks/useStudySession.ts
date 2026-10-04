/**
 * useStudySession Hook
 * Manages the study session state: card queue, flip state, ratings, and session stats.
 */
import { useState, useCallback, useMemo } from 'react';
import type { Word, Rating } from '../../domain/srs/types';
import { applyRating, shuffle } from '../../domain/srs/algorithm';
import { WordRepository } from '../../data/repositories/wordRepository';
import { StatsRepository } from '../../data/repositories/statsRepository';

export interface SessionStats {
  totalCards: number;
  correctCount: number;
  accuracy: number;
}

export function useStudySession(mode: 'due' | 'all' = 'due') {
  const [queue, setQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [todayStr] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const wordRepo = useMemo(() => new WordRepository(), []);
  const statsRepo = useMemo(() => new StatsRepository(), []);

  const currentCard = queue[currentIndex] ?? null;
  const progress = queue.length > 0 ? currentIndex / queue.length : 0;

  const startSession = useCallback(() => {
    let pool: Word[];
    if (mode === 'due') {
      pool = wordRepo.getDue(todayStr);
    } else {
      pool = wordRepo.getAll();
    }
    const shuffled = shuffle(pool, Math.random);
    setQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCorrect(0);
    setSessionTotal(0);
    setIsComplete(false);
  }, [mode, todayStr, wordRepo]);

  const flipCard = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const rateCard = useCallback(
    (rating: Rating) => {
      if (!currentCard) return;
      const updatedWord = applyRating(currentCard, rating, todayStr);
      wordRepo.update(updatedWord);
      statsRepo.recordReview(rating, todayStr);
      const newTotal = sessionTotal + 1;
      const newCorrect = sessionCorrect + (rating >= 3 ? 1 : 0);
      setSessionTotal(newTotal);
      setSessionCorrect(newCorrect);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        setIsComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }
    },
    [currentCard, todayStr, wordRepo, statsRepo, sessionTotal, sessionCorrect, currentIndex, queue.length]
  );

  const stats: SessionStats = useMemo(
    () => ({
      totalCards: sessionTotal,
      correctCount: sessionCorrect,
      accuracy: sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0,
    }),
    [sessionTotal, sessionCorrect]
  );

  return {
    currentCard,
    isFlipped,
    isComplete,
    progress,
    currentIndex,
    totalCards: queue.length,
    stats,
    startSession,
    flipCard,
    rateCard,
  };
}