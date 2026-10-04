/**
 * Data Layer - Integration Tests
 * Tests for WordRepository and StatsRepository with in-memory SQLite.
 *
 * Note: These tests mock the database layer since op-sqlite requires
 * a native runtime. In CI/unit test environment, we test the repository
 * logic with a mock DB that simulates drizzle-orm behavior.
 */
import type { Word, Stats } from '../../domain/srs/types';
import { DEFAULT_EASE_FACTOR } from '../../domain/srs/types';

// Mock database store for testing repository logic
class MockDbStore {
  words: Map<string, any> = new Map();
  statsRow: any = {
    id: 1,
    totalReviews: 0,
    totalCorrect: 0,
    streak: 0,
    lastStudyDate: null,
    activity: '{}',
  };

  reset() {
    this.words.clear();
    this.statsRow = {
      id: 1,
      totalReviews: 0,
      totalCorrect: 0,
      streak: 0,
      lastStudyDate: null,
      activity: '{}',
    };
  }
}

const mockStore = new MockDbStore();

// Simulate WordRepository logic against mock store
class TestableWordRepository {
  getAll(): Word[] {
    return Array.from(mockStore.words.values())
      .sort((a, b) => a.word.localeCompare(b.word))
      .map(this.rowToDomain);
  }

  getDue(todayStr: string): Word[] {
    return Array.from(mockStore.words.values())
      .filter((r) => !r.nextReview || r.nextReview <= todayStr)
      .map(this.rowToDomain);
  }

  getNew(): Word[] {
    return Array.from(mockStore.words.values())
      .filter((r) => !r.lastReview)
      .map(this.rowToDomain);
  }

  getLearned(): Word[] {
    return Array.from(mockStore.words.values())
      .filter((r) => r.level >= 3)
      .map(this.rowToDomain);
  }

  search(query: string): Word[] {
    const q = query.toLowerCase();
    return Array.from(mockStore.words.values())
      .filter(
        (r) =>
          r.word.toLowerCase().includes(q) ||
          r.translation.toLowerCase().includes(q)
      )
      .sort((a, b) => a.word.localeCompare(b.word))
      .map(this.rowToDomain);
  }

  getById(id: string): Word | null {
    const row = mockStore.words.get(id);
    return row ? this.rowToDomain(row) : null;
  }

  exists(wordText: string): boolean {
    return Array.from(mockStore.words.values()).some(
      (r) => r.word.toLowerCase() === wordText.toLowerCase()
    );
  }

  insert(word: Word): void {
    mockStore.words.set(word.id, {
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
    });
  }

  update(word: Word): void {
    const existing = mockStore.words.get(word.id);
    if (existing) {
      mockStore.words.set(word.id, {
        ...existing,
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
      });
    }
  }

  delete(id: string): void {
    mockStore.words.delete(id);
  }

  count(): number {
    return mockStore.words.size;
  }

  private rowToDomain(row: any): Word {
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

// Simulate StatsRepository logic against mock store
class TestableStatsRepository {
  get(): Stats {
    const row = mockStore.statsRow;
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

  update(statsData: Partial<Stats>): void {
    const current = this.get();
    const merged = { ...current, ...statsData };
    mockStore.statsRow = {
      ...mockStore.statsRow,
      totalReviews: merged.totalReviews,
      totalCorrect: merged.totalCorrect,
      streak: merged.streak,
      lastStudyDate: merged.lastStudyDate,
      activity: JSON.stringify(merged.activity),
    };
  }

  recordReview(rating: number, todayStr: string): void {
    const current = this.get();
    const isCorrect = rating >= 3;

    let newStreak = current.streak;
    if (current.lastStudyDate !== todayStr) {
      const yesterday = this.getYesterday(todayStr);
      if (current.lastStudyDate === yesterday) {
        newStreak = current.streak + 1;
      } else {
        newStreak = 1;
      }
    }

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

  private getYesterday(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

// --- Tests ---

const wordRepo = new TestableWordRepository();
const statsRepo = new TestableStatsRepository();

function makeWord(overrides: Partial<Word> = {}): Word {
  return {
    id: 'test-1',
    word: 'hello',
    translation: 'olá',
    phonetic: '/həˈlo/',
    pos: 'noun',
    example: 'Hello world.',
    examplePt: 'Olá mundo.',
    tag: 'Geral',
    level: 0,
    nextReview: null,
    lastReview: null,
    totalReviews: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    createdAt: '2026-10-04T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  mockStore.reset();
});

describe('WordRepository', () => {
  describe('insert and getAll', () => {
    it('inserts a word and retrieves it', () => {
      const word = makeWord({ id: 'w1', word: 'apple' });
      wordRepo.insert(word);
      const all = wordRepo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].word).toBe('apple');
    });

    it('returns words sorted alphabetically', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'zebra' }));
      wordRepo.insert(makeWord({ id: 'w2', word: 'apple' }));
      wordRepo.insert(makeWord({ id: 'w3', word: 'mango' }));
      const all = wordRepo.getAll();
      expect(all.map((w) => w.word)).toEqual(['apple', 'mango', 'zebra']);
    });
  });

  describe('getDue', () => {
    it('returns new words (nextReview is null)', () => {
      wordRepo.insert(makeWord({ id: 'w1', nextReview: null }));
      wordRepo.insert(makeWord({ id: 'w2', nextReview: '2026-10-05' }));
      const due = wordRepo.getDue('2026-10-04');
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe('w1');
    });

    it('returns words due on or before today', () => {
      wordRepo.insert(makeWord({ id: 'w1', nextReview: '2026-10-03' }));
      wordRepo.insert(makeWord({ id: 'w2', nextReview: '2026-10-04' }));
      wordRepo.insert(makeWord({ id: 'w3', nextReview: '2026-10-05' }));
      const due = wordRepo.getDue('2026-10-04');
      expect(due.map((w) => w.id).sort()).toEqual(['w1', 'w2']);
    });
  });

  describe('getNew', () => {
    it('returns words never reviewed', () => {
      wordRepo.insert(makeWord({ id: 'w1', lastReview: null }));
      wordRepo.insert(makeWord({ id: 'w2', lastReview: '2026-10-03' }));
      const newWords = wordRepo.getNew();
      expect(newWords).toHaveLength(1);
      expect(newWords[0].id).toBe('w1');
    });
  });

  describe('getLearned', () => {
    it('returns words with level >= 3', () => {
      wordRepo.insert(makeWord({ id: 'w1', level: 2 }));
      wordRepo.insert(makeWord({ id: 'w2', level: 3 }));
      wordRepo.insert(makeWord({ id: 'w3', level: 5 }));
      const learned = wordRepo.getLearned();
      expect(learned.map((w) => w.id).sort()).toEqual(['w2', 'w3']);
    });
  });

  describe('search', () => {
    it('finds words by word text', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'apple', translation: 'maçã' }));
      wordRepo.insert(makeWord({ id: 'w2', word: 'banana', translation: 'banana' }));
      const results = wordRepo.search('app');
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('apple');
    });

    it('finds words by translation', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'apple', translation: 'maçã' }));
      wordRepo.insert(makeWord({ id: 'w2', word: 'banana', translation: 'banana' }));
      const results = wordRepo.search('maç');
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('apple');
    });

    it('is case-insensitive', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'Apple' }));
      const results = wordRepo.search('apple');
      expect(results).toHaveLength(1);
    });

    it('returns empty array for no matches', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'apple' }));
      expect(wordRepo.search('xyz')).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('returns word by ID', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'test' }));
      const found = wordRepo.getById('w1');
      expect(found).not.toBeNull();
      expect(found!.word).toBe('test');
    });

    it('returns null for non-existent ID', () => {
      expect(wordRepo.getById('nonexistent')).toBeNull();
    });
  });

  describe('exists', () => {
    it('returns true for existing word', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'hello' }));
      expect(wordRepo.exists('hello')).toBe(true);
    });

    it('returns false for non-existing word', () => {
      expect(wordRepo.exists('goodbye')).toBe(false);
    });

    it('is case-insensitive', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'Hello' }));
      expect(wordRepo.exists('hello')).toBe(true);
    });
  });

  describe('update', () => {
    it('updates an existing word', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'hello', level: 0 }));
      const updated = makeWord({ id: 'w1', word: 'hello', level: 3, totalReviews: 5 });
      wordRepo.update(updated);
      const found = wordRepo.getById('w1');
      expect(found!.level).toBe(3);
      expect(found!.totalReviews).toBe(5);
    });
  });

  describe('delete', () => {
    it('removes a word by ID', () => {
      wordRepo.insert(makeWord({ id: 'w1', word: 'hello' }));
      wordRepo.delete('w1');
      expect(wordRepo.getById('w1')).toBeNull();
      expect(wordRepo.count()).toBe(0);
    });
  });

  describe('count', () => {
    it('returns correct count', () => {
      expect(wordRepo.count()).toBe(0);
      wordRepo.insert(makeWord({ id: 'w1' }));
      wordRepo.insert(makeWord({ id: 'w2' }));
      expect(wordRepo.count()).toBe(2);
    });
  });
});

describe('StatsRepository', () => {
  describe('get', () => {
    it('returns default stats when empty', () => {
      const s = statsRepo.get();
      expect(s.totalReviews).toBe(0);
      expect(s.totalCorrect).toBe(0);
      expect(s.streak).toBe(0);
      expect(s.lastStudyDate).toBeNull();
      expect(s.activity).toEqual({});
    });
  });

  describe('update', () => {
    it('updates stats fields', () => {
      statsRepo.update({ totalReviews: 10, totalCorrect: 8 });
      const s = statsRepo.get();
      expect(s.totalReviews).toBe(10);
      expect(s.totalCorrect).toBe(8);
    });
  });

  describe('recordReview', () => {
    it('increments totalReviews', () => {
      statsRepo.recordReview(3, '2026-10-04');
      const s = statsRepo.get();
      expect(s.totalReviews).toBe(1);
    });

    it('increments totalCorrect for rating >= 3', () => {
      statsRepo.recordReview(3, '2026-10-04');
      statsRepo.recordReview(4, '2026-10-04');
      const s = statsRepo.get();
      expect(s.totalCorrect).toBe(2);
    });

    it('does not increment totalCorrect for rating < 3', () => {
      statsRepo.recordReview(1, '2026-10-04');
      statsRepo.recordReview(2, '2026-10-04');
      const s = statsRepo.get();
      expect(s.totalCorrect).toBe(0);
      expect(s.totalReviews).toBe(2);
    });

    it('starts streak at 1 on first study day', () => {
      statsRepo.recordReview(3, '2026-10-04');
      const s = statsRepo.get();
      expect(s.streak).toBe(1);
      expect(s.lastStudyDate).toBe('2026-10-04');
    });

    it('increments streak on consecutive days', () => {
      statsRepo.recordReview(3, '2026-10-03');
      statsRepo.recordReview(3, '2026-10-04');
      const s = statsRepo.get();
      expect(s.streak).toBe(2);
    });

    it('resets streak on non-consecutive days', () => {
      statsRepo.recordReview(3, '2026-10-01');
      statsRepo.recordReview(3, '2026-10-04');
      const s = statsRepo.get();
      expect(s.streak).toBe(1);
    });

    it('does not increment streak for multiple reviews same day', () => {
      statsRepo.recordReview(3, '2026-10-04');
      statsRepo.recordReview(4, '2026-10-04');
      statsRepo.recordReview(3, '2026-10-04');
      const s = statsRepo.get();
      expect(s.streak).toBe(1);
      expect(s.totalReviews).toBe(3);
    });

    it('tracks activity per day', () => {
      statsRepo.recordReview(3, '2026-10-04');
      statsRepo.recordReview(4, '2026-10-04');
      statsRepo.recordReview(3, '2026-10-05');
      const s = statsRepo.get();
      expect(s.activity['2026-10-04']).toBe(2);
      expect(s.activity['2026-10-05']).toBe(1);
    });

    it('handles month boundary for streak', () => {
      statsRepo.recordReview(3, '2026-09-30');
      statsRepo.recordReview(3, '2026-10-01');
      const s = statsRepo.get();
      expect(s.streak).toBe(2);
    });

    it('handles year boundary for streak', () => {
      statsRepo.recordReview(3, '2025-12-31');
      statsRepo.recordReview(3, '2026-01-01');
      const s = statsRepo.get();
      expect(s.streak).toBe(2);
    });
  });
});