import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'linear.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Helper to generate UUIDs
export function generateId(prefix: string = ''): string {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}-${uuid.slice(0, 8)}` : uuid;
}

// Helper to get current ISO timestamp
export function now(): string {
  return new Date().toISOString();
}

// Helper to convert row to JSON-safe object
export function toJson(row: any): any {
  return JSON.parse(JSON.stringify(row));
}

// Query helpers
export function queryOne<T>(sql: string, params: any[] = []): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get(...params) as T | undefined;
}

export function queryAll<T>(sql: string, params: any[] = []): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all(...params) as T[];
}

export function execute(sql: string, params: any[] = []): Database.RunResult {
  const stmt = getDb().prepare(sql);
  return stmt.run(...params);
}

export function transaction<T>(fn: () => T): T {
  return getDb().transaction(fn)();
}