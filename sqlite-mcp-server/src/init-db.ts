import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'linear.db');

// Remove old database and WAL files
const walPath = DB_PATH + '-wal';
const shmPath = DB_PATH + '-shm';
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

console.log(`Initializing database at: ${DB_PATH}`);

const schemaPath = path.join(__dirname, '..', '..', 'linear_schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error(`Schema file not found at: ${schemaPath}`);
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Parse SQL - handle triggers with BEGIN...END;
function parseStatements(sql: string): string[] {
  const statements: string[] = [];
  let i = 0;

  while (i < sql.length) {
    // Skip leading whitespace
    while (i < sql.length && /\s/.test(sql[i])) i++;
    if (i >= sql.length) break;

    // Skip comment lines
    if (sql.substring(i).startsWith('--')) {
      const nl = sql.indexOf('\n', i);
      if (nl === -1) break;
      i = nl + 1;
      continue;
    }

    let stmt = '';

    // Check if this is a trigger
    if (sql.substring(i).toUpperCase().startsWith('CREATE TRIGGER')) {
      // Build up the trigger statement until we hit END;
      while (i < sql.length) {
        stmt += sql[i];
        if (sql.substring(i).startsWith('END;')) {
          i += 5; // Skip "END;"
          break;
        }
        i++;
      }
    } else {
      // Normal statement - end at semicolon
      while (i < sql.length && sql[i] !== ';') {
        stmt += sql[i];
        i++;
      }
      if (i < sql.length && sql[i] === ';') {
        stmt += ';';
        i++;
      }
    }

    stmt = stmt.trim();
    if (stmt && !stmt.startsWith('--') && stmt !== 'END;') {
      statements.push(stmt);
    }
  }

  return statements;
}

const statements = parseStatements(schemaSql);
console.log(`Parsed ${statements.length} statements`);

let successCount = 0;
let errorCount = 0;

for (const statement of statements) {
  try {
    db.exec(statement);
    successCount++;
  } catch (e: any) {
    console.error(`Error: ${e.message}`);
    errorCount++;
  }
}

db.close();

// Verify
const verifyDb = new Database(DB_PATH);
const tables = verifyDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
const views = verifyDb.prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").all();
const triggers = verifyDb.prepare("SELECT name FROM sqlite_master WHERE type='trigger' ORDER BY name").all();
verifyDb.close();

console.log(`\nDatabase initialized!`);
console.log(`Tables (${tables.length}): ${tables.map((t: any) => t.name).join(', ')}`);
console.log(`Views (${views.length}): ${views.map((v: any) => v.name).join(', ')}`);
console.log(`Triggers (${triggers.length}): ${triggers.map((t: any) => t.name).join(', ')}`);
console.log(`\nStatements executed: ${successCount}, Errors: ${errorCount}`);