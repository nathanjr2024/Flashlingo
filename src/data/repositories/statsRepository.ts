/**
* Stats Repository - Data Access Layer
* CRUD operations for the singleton stats row using Drizzle ORM.
*/
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { stats } from '../db/schema';
import type { Stats } from '../../domain/srs/types';

export class StatsRepository {
  /**
   * Get the singleton stats row.
   */
  get(): Stats {
    const db = getDb();
    const row = db.select().from(stats).where(eq(stats.id, 1)).get();
    if (!row) {
      return {
        totalReviews: 0,
        totalCorrect: 0,
        streak: 0,
        lastStudyDate: null,
        activity: {},
      };
    }
    return this.rowToDomain(row);
  }

  /**
   * Update the singleton stats row.
   */
  update(statsData: Partial<Stats>): void {
    const db = getDb();
    const current = this.get();
    const merged = { ...current, ...statsData };
    db.update(stats)
      .set({
        totalReviews: merged.totalReviews,
        totalCorrect: merged.totalCorrect,
        streak: merged.streak,
        lastStudyDate: merged.lastStudyDate,
        activity: JSON.stringify(merged.activity),
      })
      .where(eq(stats.id, 1))
      .run();
  }

  /**
   * Record a study session: increment reviews, update streak and activity.
   */
  recordReview(rating: number, todayStr: string): void {
    const current = this.get();
    const isCorrect = rating >= 3;

    // Update streak
    let newStreak = current.streak;
    if (current.lastStudyDate !== todayStr) {
      const yesterday = this.getYesterday(todayStr);
      if (current.lastStudyDate === yesterday) {
        newStreak = current.streak + 1;
      } else {
        newStreak = 1;
      }
    }

    // Update activity
    const newActivity = { ...current.activity };
    newActivity[todayStr] = (newActivity[todayStr] || 0) + 1;

    this.update({
      totalReviews: current.totalReviews + 1,
      totalCorrect: current.totalCorrect + (isCorrect ? 1 : 0),
      streak: newStreak,
      lastStudyDate: todayStr,
      activity: newActivity,
    });
  }

  /**
   * Get yesterday's date string (YYYY-MM-DD) from a given date string.
   */
  private getYesterday(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Convert a database row to a domain Stats object.
   */
  private rowToDomain(row: typeof stats.$inferSelect): Stats {
    let activity: Record<string, number> = {};
    try {
      activity = JSON.parse(row.activity || '{}');
    } catch {
      activity = {};
    }
    return {
      totalReviews: row.totalReviews ?? 0,
      totalCorrect: row.totalCorrect ?? 0,
      streak: row.streak ?? 0,
      lastStudyDate: row.lastStudyDate,
      activity,
    };
  }
}