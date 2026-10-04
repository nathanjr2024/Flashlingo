/**
 * Database Connection - Drizzle ORM + op-sqlite
 * Initializes the SQLite database and provides the drizzle instance.
 */
import { openSync } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import * as schema from './schema';

const DB_NAME = 'flashlingo.db';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const sqlite = openSync({ name: DB_NAME });
    dbInstance = drizzle(sqlite, { schema });
    initializeTables(sqlite);
  }
  return dbInstance;
}

function initializeTables(sqlite: ReturnType<typeof openSync>) {
  sqlite.execute(`
    CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY,
      word TEXT NOT NULL UNIQUE,
      translation TEXT NOT NULL,
      phonetic TEXT DEFAULT '',
      pos TEXT DEFAULT 'noun',
      example TEXT DEFAULT '',
      example_pt TEXT DEFAULT '',
      tag TEXT DEFAULT 'Geral',
      level INTEGER DEFAULT 0 CHECK(level BETWEEN 0 AND 6),
      next_review TEXT,
      last_review TEXT,
      total_reviews INTEGER DEFAULT 0,
      ease_factor REAL DEFAULT 2.5 CHECK(ease_factor BETWEEN 1.3 AND 3.0),
      created_at TEXT NOT NULL
    )
  `);

  sqlite.execute(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      total_reviews INTEGER DEFAULT 0,
      total_correct INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_study_date TEXT,
      activity TEXT DEFAULT '{}'
    )
  `);

  // Ensure singleton stats row exists
  sqlite.execute(`INSERT OR IGNORE INTO stats (id) VALUES (1)`);
}

export { schema };