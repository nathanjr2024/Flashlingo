/**
 * SRS Module - Core Types
 * Pure domain types for the Spaced Repetition System algorithm.
 */

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';

export type Rating = 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy

export interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  pos: PartOfSpeech;
  example: string;
  examplePt: string;
  tag: string;
  level: number; // 0-6
  nextReview: string | null; // YYYY-MM-DD or null (new)
  lastReview: string | null; // ISO datetime or null
  totalReviews: number;
  easeFactor: number; // 1.3-3.0
  createdAt: string; // ISO datetime
}

export interface Stats {
  totalReviews: number;
  totalCorrect: number;
  streak: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  activity: Record<string, number>; // YYYY-MM-DD -> count
}

export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30, 90] as const;
export const SRS_LABELS = ['Novo', 'Lv1 (1d)', 'Lv2 (3d)', 'Lv3 (7d)', 'Lv4 (14d)', 'Lv5 (30d)', 'Mestre'] as const;

export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.0;
export const DEFAULT_EASE_FACTOR = 2.5;
export const MAX_LEVEL = 6;
export const MIN_LEVEL = 0;