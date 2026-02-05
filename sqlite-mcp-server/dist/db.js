import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'linear.db');
let db = null;
export function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
    }
    return db;
}
export function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}
// Helper to generate UUIDs
export function generateId(prefix = '') {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}-${uuid.slice(0, 8)}` : uuid;
}
// Helper to get current ISO timestamp
export function now() {
    return new Date().toISOString();
}
// Helper to convert row to JSON-safe object
export function toJson(row) {
    return JSON.parse(JSON.stringify(row));
}
// Query helpers
export function queryOne(sql, params = []) {
    const stmt = getDb().prepare(sql);
    return stmt.get(...params);
}
export function queryAll(sql, params = []) {
    const stmt = getDb().prepare(sql);
    return stmt.all(...params);
}
// Aliases for convenience
export const getOne = queryOne;
export const query = queryAll;
export function execute(sql, params = []) {
    const stmt = getDb().prepare(sql);
    return stmt.run(...params);
}
// Alias for convenience
export const run = execute;
export function transaction(fn) {
    return getDb().transaction(fn)();
}
//# sourceMappingURL=db.js.map