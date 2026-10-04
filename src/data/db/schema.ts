/**
 * SQLite Schema - Drizzle ORM
 * Defines the database tables for Flashlingo.
 */
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const words = sqliteTable('words', {
  id: text('id').primaryKey(),
  word: text('word').notNull().unique(),
  translation: text('translation').notNull(),
  phonetic: text('phonetic').default(''),
  pos: text('pos').default('noun'),
  example: text('example').default(''),
  examplePt: text('example_pt').default(''),
  tag: text('tag').default('Geral'),
  level: integer('level').default(0),
  nextReview: text('next_review'),
  lastReview: text('last_review'),
  totalReviews: integer('total_reviews').default(0),
  easeFactor: real('ease_factor').default(2.5),
  createdAt: text('created_at').notNull(),
});

export const stats = sqliteTable('stats', {
  id: integer('id').primaryKey().default(1),
  totalReviews: integer('total_reviews').default(0),
  totalCorrect: integer('total_correct').default(0),
  streak: integer('streak').default(0),
  lastStudyDate: text('last_study_date'),
  activity: text('activity').default('{}'), // JSON string: {"YYYY-MM-DD": count}
});

export type WordRow = typeof words.$inferSelect;
export type NewWordRow = typeof words.$inferInsert;
export type StatsRow = typeof stats.$inferSelect;
export type NewStatsRow = typeof stats.$inferInsert;