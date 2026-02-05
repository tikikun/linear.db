import { getDb } from './db.js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'linear.db');
export function initializeDatabase() {
    const db = getDb();
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    // Read schema file from parent directory
    const schemaPath = path.join(__dirname, '..', '..', 'linear_schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');
    // Execute each statement separately
    const statements = schemaSql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    for (const statement of statements) {
        try {
            db.exec(statement);
        }
        catch (e) {
            // Ignore errors for existing tables/indices
        }
    }
}
export function getDbPath() {
    return DB_PATH;
}
//# sourceMappingURL=schema.js.map