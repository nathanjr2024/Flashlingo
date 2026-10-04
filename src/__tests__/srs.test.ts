/**
 * SRS Module - Unit Tests
 * Tests for pure SRS algorithm functions.
 */

import {
  isDue,
  calculateNextReview,
  applyRating,
  getDueWords,
  shuffle,
  createWord,
} from '../domain/srs/algorithm';
import { Word, DEFAULT_EASE_FACTOR, MIN_EASE_FACTOR, MAX_EASE_FACTOR } from '../domain/srs/types';

const TODAY = '2026-10-04';

function makeWord(overrides: Partial<Word> = {}): Word {
  return {
    id: 'test-1',
    word: 'test',
    translation: 'teste',
    phonetic: '/tɛst/',
    pos: 'noun',
    example: 'This is a test.',
    examplePt: 'Isto é um teste.',
    tag: 'Geral',
    level: 0,
    nextReview: null,
    lastReview: null,
    totalReviews: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    createdAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isDue', () => {
  it('returns true for new words (nextReview is null)', () => {
    const word = makeWord({ nextReview: null });
    expect(isDue(word, TODAY)).toBe(true);
  });

  it('returns true when nextReview equals today', () => {
    const word = makeWord({ nextReview: TODAY });
    expect(isDue(word, TODAY)).toBe(true);
  });

  it('returns true when nextReview is before today', () => {
    const word = makeWord({ nextReview: '2026-10-03' });
    expect(isDue(word, TODAY)).toBe(true);
  });

  it('returns false when nextReview is after today', () => {
    const word = makeWord({ nextReview: '2026-10-05' });
    expect(isDue(word, TODAY)).toBe(false);
  });
});

describe('calculateNextReview', () => {
  it('returns next day for level 0', () => {
    expect(calculateNextReview(0, DEFAULT_EASE_FACTOR, TODAY)).toBe('2026-10-05');
  });

  it('returns +1 day for level 1 with default ease', () => {
    expect(calculateNextReview(1, DEFAULT_EASE_FACTOR, TODAY)).toBe('2026-10-05');
  });

  it('returns +3 days for level 2 with default ease', () => {
    expect(calculateNextReview(2, DEFAULT_EASE_FACTOR, TODAY)).toBe('2026-10-07');
  });

  it('returns +7 days for level 3 with default ease', () => {
    expect(calculateNextReview(3, DEFAULT_EASE_FACTOR, TODAY)).toBe('2026-10-11');
  });

  it('applies ease factor multiplier for levels >= 1', () => {
    // ease 3.0 / default 2.5 = 1.2x → 3 days * 1.2 = 3.6 → rounds to 4
    expect(calculateNextReview(2, 3.0, TODAY)).toBe('2026-10-08');
  });

  it('handles month boundaries correctly', () => {
    expect(calculateNextReview(1, DEFAULT_EASE_FACTOR, '2026-10-31')).toBe('2026-11-01');
  });

  it('handles year boundaries correctly', () => {
    expect(calculateNextReview(1, DEFAULT_EASE_FACTOR, '2026-12-31')).toBe('2027-01-01');
  });
});

describe('applyRating', () => {
  describe('Again (rating 1)', () => {
    it('resets level to 0', () => {
      const word = makeWord({ level: 3 });
      const result = applyRating(word, 1, TODAY);
      expect(result.level).toBe(0);
    });

    it('decreases ease factor by 0.2', () => {
      const word = makeWord({ level: 2, easeFactor: 2.5 });
      const result = applyRating(word, 1, TODAY);
      expect(result.easeFactor).toBe(2.3);
    });

    it('clamps ease factor at minimum 1.3', () => {
      const word = makeWord({ level: 1, easeFactor: 1.3 });
      const result = applyRating(word, 1, TODAY);
      expect(result.easeFactor).toBe(MIN_EASE_FACTOR);
    });

    it('increments totalReviews', () => {
      const word = makeWord({ totalReviews: 5 });
      const result = applyRating(word, 1, TODAY);
      expect(result.totalReviews).toBe(6);
    });

    it('sets lastReview to today', () => {
      const word = makeWord();
      const result = applyRating(word, 1, TODAY);
      expect(result.lastReview).toBe(TODAY);
    });
  });

  describe('Hard (rating 2)', () => {
    it('keeps level at minimum 1', () => {
      const word = makeWord({ level: 0 });
      const result = applyRating(word, 2, TODAY);
      expect(result.level).toBe(1);
    });

    it('does not decrease level below current if already >= 1', () => {
      const word = makeWord({ level: 3 });
      const result = applyRating(word, 2, TODAY);
      expect(result.level).toBe(3);
    });

    it('decreases ease factor by 0.15', () => {
      const word = makeWord({ level: 2, easeFactor: 2.5 });
      const result = applyRating(word, 2, TODAY);
      expect(result.easeFactor).toBe(2.35);
    });
  });

  describe('Good (rating 3)', () => {
    it('advances level by 1', () => {
      const word = makeWord({ level: 2 });
      const result = applyRating(word, 3, TODAY);
      expect(result.level).toBe(3);
    });

    it('caps level at max 6', () => {
      const word = makeWord({ level: 6 });
      const result = applyRating(word, 3, TODAY);
      expect(result.level).toBe(6);
    });

    it('forces level 1 from level 0', () => {
      const word = makeWord({ level: 0 });
      const result = applyRating(word, 3, TODAY);
      expect(result.level).toBe(1);
    });

    it('does not change ease factor', () => {
      const word = makeWord({ level: 2, easeFactor: 2.5 });
      const result = applyRating(word, 3, TODAY);
      expect(result.easeFactor).toBe(2.5);
    });
  });

  describe('Easy (rating 4)', () => {
    it('advances level by 2', () => {
      const word = makeWord({ level: 1 });
      const result = applyRating(word, 4, TODAY);
      expect(result.level).toBe(3);
    });

    it('caps level at max 6', () => {
      const word = makeWord({ level: 5 });
      const result = applyRating(word, 4, TODAY);
      expect(result.level).toBe(6);
    });

    it('increases ease factor by 0.1', () => {
      const word = makeWord({ level: 2, easeFactor: 2.5 });
      const result = applyRating(word, 4, TODAY);
      expect(result.easeFactor).toBe(2.6);
    });

    it('clamps ease factor at maximum 3.0', () => {
      const word = makeWord({ level: 2, easeFactor: 3.0 });
      const result = applyRating(word, 4, TODAY);
      expect(result.easeFactor).toBe(MAX_EASE_FACTOR);
    });
  });

  it('does not mutate the original word', () => {
    const word = makeWord({ level: 2, easeFactor: 2.5, totalReviews: 3 });
    const original = { ...word };
    applyRating(word, 3, TODAY);
    expect(word).toEqual(original);
  });
});

describe('getDueWords', () => {
  it('returns only due words', () => {
    const words = [
      makeWord({ id: '1', nextReview: null }),
      makeWord({ id: '2', nextReview: '2026-10-03' }),
      makeWord({ id: '3', nextReview: '2026-10-05' }),
      makeWord({ id: '4', nextReview: TODAY }),
    ];
    const due = getDueWords(words, TODAY);
    expect(due.map((w) => w.id)).toEqual(['1', '2', '4']);
  });

  it('returns empty array when no words are due', () => {
    const words = [
      makeWord({ id: '1', nextReview: '2026-10-05' }),
      makeWord({ id: '2', nextReview: '2026-10-06' }),
    ];
    expect(getDueWords(words, TODAY)).toEqual([]);
  });
});

describe('shuffle', () => {
  it('returns same elements in potentially different order', () => {
    const items = [1, 2, 3, 4, 5];
    let callCount = 0;
    const fakeRandom = () => {
      callCount++;
      return 0.5; // deterministic
    };
    const result = shuffle(items, fakeRandom);
    expect(result.sort()).toEqual(items.sort());
    expect(callCount).toBeGreaterThan(0);
  });

  it('does not mutate the original array', () => {
    const items = [1, 2, 3];
    const original = [...items];
    shuffle(items, () => 0.5);
    expect(items).toEqual(original);
  });

  it('returns single-element array unchanged', () => {
    const result = shuffle([42], () => 0.5);
    expect(result).toEqual([42]);
  });

  it('returns empty array for empty input', () => {
    expect(shuffle([], () => 0.5)).toEqual([]);
  });
});

describe('createWord', () => {
  it('creates a word with default SRS values', () => {
    const word = createWord('uuid-1', {
      word: 'hello',
      translation: 'olá',
      createdAt: '2026-10-04T00:00:00.000Z',
    });
    expect(word.id).toBe('uuid-1');
    expect(word.word).toBe('hello');
    expect(word.translation).toBe('olá');
    expect(word.level).toBe(0);
    expect(word.nextReview).toBeNull();
    expect(word.lastReview).toBeNull();
    expect(word.totalReviews).toBe(0);
    expect(word.easeFactor).toBe(DEFAULT_EASE_FACTOR);
    expect(word.tag).toBe('Geral');
    expect(word.pos).toBe('noun');
  });

  it('uses provided optional fields', () => {
    const word = createWord('uuid-2', {
      word: 'run',
      translation: 'correr',
      phonetic: '/rʌn/',
      pos: 'verb',
      example: 'I run every day.',
      examplePt: 'Eu corro todo dia.',
      tag: 'Phrasal Verbs',
      createdAt: '2026-10-04T00:00:00.000Z',
    });
    expect(word.phonetic).toBe('/rʌn/');
    expect(word.pos).toBe('verb');
    expect(word.example).toBe('I run every day.');
    expect(word.tag).toBe('Phrasal Verbs');
  });
});