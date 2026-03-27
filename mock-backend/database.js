require('dotenv').config();
const path = require('path');

// -----------------------------------------------------------------------
// Dual-mode database layer
//
//  • LOCAL DEV  (no DATABASE_URL): uses SQLite — zero setup required
//  • PRODUCTION (DATABASE_URL set): uses PostgreSQL (Supabase / Render)
// -----------------------------------------------------------------------

const usePostgres = Boolean(process.env.DATABASE_URL);

// ---- PostgreSQL (production) -------------------------------------------
let pool;
if (usePostgres) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
}

// ---- SQLite (local dev) ------------------------------------------------
let sqliteDb;
if (!usePostgres) {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(__dirname, 'quickcover.db');
  sqliteDb = new Database(dbPath);
}

// -----------------------------------------------------------------------
// Unified helpers
// -----------------------------------------------------------------------

// dbGet  — returns one row
const dbGet = (sql, params = []) => {
  if (usePostgres) {
    return pool.query(sql, params).then(r => r.rows[0]);
  }
  const sqliteSql = sql.replace(/\$\d+/g, '?').replace(/"(\w+)"/g, '$1');
  return Promise.resolve(sqliteDb.prepare(sqliteSql).get(params));
};

// dbRun  — INSERT / UPDATE / DELETE
const dbRun = (sql, params = []) => {
  if (usePostgres) {
    return pool.query(sql, params);
  }
  const sqliteSql = sql.replace(/\$\d+/g, '?').replace(/"(\w+)"/g, '$1');
  return Promise.resolve(sqliteDb.prepare(sqliteSql).run(params));
};

// -----------------------------------------------------------------------
// Schema initialisation
// -----------------------------------------------------------------------
async function initializeDatabase() {
  if (usePostgres) {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          "passwordHash" TEXT NOT NULL,
          phone TEXT,
          "driverId" TEXT NOT NULL UNIQUE,
          platform TEXT DEFAULT 'blinkit',
          "createdAt" TEXT NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS state (
          id INTEGER PRIMARY KEY DEFAULT 1,
          "isTripActive" BOOLEAN DEFAULT FALSE,
          "disruptionType" TEXT,
          "disruptionZone" TEXT,
          "disruptionSeverity" TEXT,
          "disruptionMessage" TEXT,
          "disruptionTimestamp" TEXT,
          "claimStatus" TEXT DEFAULT 'none',
          "weeklyEarnings" REAL DEFAULT 3200,
          "weeklyProtected" REAL DEFAULT 0,
          "currentMicroFee" REAL DEFAULT 2.0,
          "currentRiskLevel" TEXT DEFAULT 'Low',
          CONSTRAINT single_row CHECK (id = 1)
        )
      `);
      await client.query(`INSERT INTO state (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS trips (
          id SERIAL PRIMARY KEY,
          status TEXT,
          earnings REAL,
          "protectedAmount" REAL,
          timestamp TEXT,
          "hoursWorked" REAL DEFAULT NULL,
          "userId" INTEGER DEFAULT NULL
        )
      `);
      // Migrations: add columns to existing tables that predate them
      await client.query(`ALTER TABLE trips ADD COLUMN IF NOT EXISTS "hoursWorked" REAL DEFAULT NULL`);
      await client.query(`ALTER TABLE trips ADD COLUMN IF NOT EXISTS "userId" INTEGER DEFAULT NULL`);
      await client.query(`ALTER TABLE state ADD COLUMN IF NOT EXISTS "lastPayoutAmount" REAL DEFAULT 0`);
    } finally {
      client.release();
    }
  } else {
    // better-sqlite3 is synchronous — no promise wrapping needed
    sqliteDb.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      phone TEXT,
      driverId TEXT NOT NULL UNIQUE,
      platform TEXT DEFAULT 'blinkit',
      createdAt TEXT NOT NULL
    )`);
    sqliteDb.exec(`CREATE TABLE IF NOT EXISTS state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      isTripActive BOOLEAN DEFAULT 0,
      disruptionType TEXT,
      disruptionZone TEXT,
      disruptionSeverity TEXT,
      disruptionMessage TEXT,
      disruptionTimestamp TEXT,
      claimStatus TEXT DEFAULT 'none',
      weeklyEarnings REAL DEFAULT 3200,
      weeklyProtected REAL DEFAULT 0,
      currentMicroFee REAL DEFAULT 2.0,
      currentRiskLevel TEXT DEFAULT 'Low',
      lastPayoutAmount REAL DEFAULT 0
    )`);
    sqliteDb.prepare(`INSERT OR IGNORE INTO state (id) VALUES (1)`).run();
    sqliteDb.exec(`CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT,
      earnings REAL,
      protectedAmount REAL,
      timestamp TEXT,
      hoursWorked REAL DEFAULT NULL,
      userId INTEGER DEFAULT NULL
    )`);
    // Migrations: add columns to existing SQLite tables that predate them
    try { sqliteDb.exec(`ALTER TABLE trips ADD COLUMN hoursWorked REAL DEFAULT NULL`); } catch (_) { /* already exists */ }
    try { sqliteDb.exec(`ALTER TABLE trips ADD COLUMN userId INTEGER DEFAULT NULL`); } catch (_) { /* already exists */ }
    try { sqliteDb.exec(`ALTER TABLE state ADD COLUMN lastPayoutAmount REAL DEFAULT 0`); } catch (_) { /* already exists */ }
  }

  console.log(`Database initialised (${usePostgres ? 'PostgreSQL' : 'SQLite local dev'})`);
}

// Graceful pool shutdown (PostgreSQL only)
const closeDatabase = () => (pool ? pool.end() : Promise.resolve());

module.exports = { dbGet, dbRun, initializeDatabase, closeDatabase };
