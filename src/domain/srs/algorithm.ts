/**
 * SRS Algorithm - Pure Functions
 * SM-2 inspired spaced repetition with corrections from inventory analysis.
 * All functions are pure (no side effects, no Date.now(), no Math.random()).
 */

import {
  Word,
  Rating,
  SRS_INTERVALS,
  MIN_EASE_FACTOR,
  MAX_EASE_FACTOR,
  DEFAULT_EASE_FACTOR,
  MAX_LEVEL,
  MIN_LEVEL,
} from './types';

/**
 * Check if a word is due for review based on YYYY-MM-DD string comparison.
 * New words (nextReview === null) are always due.
 */
export function isDue(word: Word, todayStr: string): boolean {
  if (!word.nextReview) return true;
  return word.nextReview <= todayStr;
}

/**
 * Calculate the next review date string (YYYY-MM-DD) given a level and ease factor.
 * Applies ease factor multiplier for levels >= 1.
 */
export function calculateNextReview(
  level: number,
  easeFactor: number,
  todayStr: string
): string {
  let days: number = SRS_INTERVALS[level] ?? SRS_INTERVALS[SRS_INTERVALS.length - 1];
  if (days === 0) days = 1; // Level 0 always reviews next day

  // Apply ease factor for levels >= 1
  if (level >= 1) {
    days = Math.round(days * (easeFactor / DEFAULT_EASE_FACTOR));
  }

  // Parse today and add days
  const [year, month, day] = todayStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Apply a rating to a word and return the updated word.
 * Pure function - does not mutate input.
 *
 * Corrections from inventory:
 * - "Again" resets to level 0 (not level-1)
 * - Ease factor applied at all levels >= 1
 * - Date comparison by YYYY-MM-DD string
 */
export function applyRating(
  word: Word,
  rating: Rating,
  todayStr: string
): Word {
  let newLevel = word.level;
  let newEaseFactor = word.easeFactor;

  switch (rating) {
    case 1: // Again - reset to level 0
      newLevel = MIN_LEVEL;
      newEaseFactor = Math.max(MIN_EASE_FACTOR, word.easeFactor - 0.2);
      break;
    case 2: // Hard - stay at current level (min 1), reduce ease
      newLevel = Math.max(1, word.level);
      newEaseFactor = Math.max(MIN_EASE_FACTOR, word.easeFactor - 0.15);
      break;
    case 3: // Good - advance one level
      newLevel = Math.min(MAX_LEVEL, word.level + 1);
      break;
    case 4: // Easy - advance two levels, increase ease
      newLevel = Math.min(MAX_LEVEL, word.level + 2);
      newEaseFactor = Math.min(MAX_EASE_FACTOR, word.easeFactor + 0.1);
      break;
  }

  // If was new (level 0) and got Good/Easy, ensure at least level 1
  if (word.level === MIN_LEVEL && rating >= 3) {
    newLevel = Math.max(newLevel, 1);
  }

  const nextReview = calculateNextReview(newLevel, newEaseFactor, todayStr);

  return {
    ...word,
    level: newLevel,
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Avoid floating point drift
    totalReviews: word.totalReviews + 1,
    lastReview: todayStr,
    nextReview,
  };
}

/**
 * Filter words that are due for review.
 */
export function getDueWords(words: Word[], todayStr: string): Word[] {
  return words.filter((w) => isDue(w, todayStr));
}

/**
 * Fisher-Yates shuffle (pure, deterministic with provided random function).
 * Fixes the biased sort(() => Math.random() - 0.5) from prototype.
 */
export function shuffle<T>(items: T[], randomFn: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Create a new word with default SRS values.
 * Uses provided ID generator instead of Date.now() + Math.random().
 */
export function createWord(
  id: string,
  params: {
    word: string;
    translation: string;
    phonetic?: string;
    pos?: string;
    example?: string;
    examplePt?: string;
    tag?: string;
    createdAt: string;
  }
): Word {
  return {
    id,
    word: params.word,
    translation: params.translation,
    phonetic: params.phonetic || '',
    pos: (params.pos as Word['pos']) || 'noun',
    example: params.example || '',
    examplePt: params.examplePt || '',
    tag: params.tag || 'Geral',
    level: MIN_LEVEL,
    nextReview: null,
    lastReview: null,
    totalReviews: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    createdAt: params.createdAt,
  };
}