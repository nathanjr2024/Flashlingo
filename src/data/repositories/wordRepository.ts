/**
* Word Repository - Data Access Layer
* CRUD operations for words using Drizzle ORM.
*/
import { eq, lte, isNull, or, asc } from 'drizzle-orm';
import { getDb } from '../db';
import { words } from '../db/schema';
import type { Word } from '../../domain/srs/types';

export class WordRepository {
  /**
   * Get all words from the database.
   */
  getAll(): Word[] {
    const db = getDb();
    const rows = db.select().from(words).orderBy(asc(words.word)).all();
    return rows.map(this.rowToDomain);
  }

  /**
   * Get words due for review on or before todayStr (YYYY-MM-DD).
   */
  getDue(todayStr: string): Word[] {
    const db = getDb();
    const rows = db
      .select()
      .from(words)
      .where(or(isNull(words.nextReview), lte(words.nextReview, todayStr)))
      .all();
    return rows.map(this.rowToDomain);
  }

  /**
   * Get words that have never been reviewed (new words).
   */
  getNew(): Word[] {
    const db = getDb();
    const rows = db.select().from(words).where(isNull(words.lastReview)).all();
    return rows.map(this.rowToDomain);
  }

  /**
   * Get words with level >= 3 (learned).
   */
  getLearned(): Word[] {
    const db = getDb();
    const rows = db.select().from(words).all();
    return rows.filter((r) => r.level >= 3).map(this.rowToDomain);
  }

  /**
   * Search words by word or translation (case-insensitive).
   */
  search(query: string): Word[] {
    const db = getDb();
    const all = db.select().from(words).orderBy(asc(words.word)).all();
    const q = query.toLowerCase();
    return all
      .filter(
        (r) =>
          r.word.toLowerCase().includes(q) ||
          r.translation.toLowerCase().includes(q)
      )
      .map(this.rowToDomain);
  }

  /**
   * Get a single word by ID.
   */
  getById(id: string): Word | null {
    const db = getDb();
    const row = db.select().from(words).where(eq(words.id, id)).get();
    return row ? this.rowToDomain(row) : null;
  }

  /**
   * Check if a word with the given text already exists (case-insensitive).
   */
  exists(wordText: string): boolean {
    const db = getDb();
    const all = db.select().from(words).all();
    return all.some((r) => r.word.toLowerCase() === wordText.toLowerCase());
  }

  /**
   * Insert a new word into the database.
   */
  insert(word: Word): void {
    const db = getDb();
    db.insert(words)
      .values({
        id: word.id,
        word: word.word,
        translation: word.translation,
        phonetic: word.phonetic,
        pos: word.pos,
        example: word.example,
        examplePt: word.examplePt,
        tag: word.tag,
        level: word.level,
        nextReview: word.nextReview,
        lastReview: word.lastReview,
        totalReviews: word.totalReviews,
        easeFactor: word.easeFactor,
        createdAt: word.createdAt,
      })
      .run();
  }

  /**
   * Update an existing word in the database.
   */
  update(word: Word): void {
    const db = getDb();
    db.update(words)
      .set({
        word: word.word,
        translation: word.translation,
        phonetic: word.phonetic,
        pos: word.pos,
        example: word.example,
        examplePt: word.examplePt,
        tag: word.tag,
        level: word.level,
        nextReview: word.nextReview,
        lastReview: word.lastReview,
        totalReviews: word.totalReviews,
        easeFactor: word.easeFactor,
      })
      .where(eq(words.id, word.id))
      .run();
  }

  /**
   * Delete a word by ID.
   */
  delete(id: string): void {
    const db = getDb();
    db.delete(words).where(eq(words.id, id)).run();
  }

  /**
   * Get total word count.
   */
  count(): number {
    const db = getDb();
    const all = db.select().from(words).all();
    return all.length;
  }

  /**
   * Convert a database row to a domain Word object.
   */
  private rowToDomain(row: typeof words.$inferSelect): Word {
    return {
      id: row.id,
      word: row.word,
      translation: row.translation,
      phonetic: row.phonetic || '',
      pos: (row.pos as Word['pos']) || 'noun',
      example: row.example || '',
      examplePt: row.examplePt || '',
      tag: row.tag || 'Geral',
      level: row.level ?? 0,
      nextReview: row.nextReview,
      lastReview: row.lastReview,
      totalReviews: row.totalReviews ?? 0,
      easeFactor: row.easeFactor ?? 2.5,
      createdAt: row.createdAt,
    };
  }
}