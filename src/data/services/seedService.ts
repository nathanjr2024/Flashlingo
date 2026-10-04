/**
 * Seed Service - Demo Data
 * Seeds the database with 5 demo words on first app launch.
 */
import { WordRepository } from '../repositories/wordRepository';
import { createWord } from '../../domain/srs/algorithm';

const DEMO_WORDS = [
  {
    word: 'serendipity',
    translation: 'serendipidade, descoberta feliz por acaso',
    phonetic: '/ˌserənˈdɪpɪti/',
    pos: 'noun' as const,
    example: 'It was pure serendipity that we met.',
    examplePt: 'Foi pura serendipidade que nos encontramos.',
    tag: 'Geral',
  },
  {
    word: 'resilient',
    translation: 'resiliente, que se recupera bem',
    phonetic: '/rɪˈzɪliənt/',
    pos: 'adjective' as const,
    example: 'She is incredibly resilient.',
    examplePt: 'Ela é incrivelmente resiliente.',
    tag: 'Geral',
  },
  {
    word: 'procrastinate',
    translation: 'procrastinar, adiar tarefas',
    phonetic: '/prəˈkræstɪneɪt/',
    pos: 'verb' as const,
    example: 'Stop procrastinating and get it done.',
    examplePt: 'Pare de procrastinar e faça.',
    tag: 'Geral',
  },
  {
    word: 'ephemeral',
    translation: 'efêmero, que dura pouco',
    phonetic: '/ɪˈfemərəl/',
    pos: 'adjective' as const,
    example: 'Fame can be ephemeral.',
    examplePt: 'A fama pode ser efêmera.',
    tag: 'Geral',
  },
  {
    word: 'give up',
    translation: 'desistir, abrir mão',
    phonetic: '/ɡɪv ʌp/',
    pos: 'phrase' as const,
    example: "Don't give up on your dreams.",
    examplePt: 'Não desista dos seus sonhos.',
    tag: 'Phrasal Verbs',
  },
];

export class SeedService {
  /**
   * Seed the database with demo words if it's empty.
   */
  static seedIfEmpty(): void {
    const wordRepo = new WordRepository();
    if (wordRepo.count() > 0) return;

    const now = new Date().toISOString();
    DEMO_WORDS.forEach((demo, index) => {
      const id = `seed-${index}-${Date.now()}`;
      const word = createWord(id, {
        ...demo,
        createdAt: now,
      });
      wordRepo.insert(word);
    });
  }
}