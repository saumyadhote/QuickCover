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
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    family: 4,
  });
}

// ---- SQLite (local dev) ------------------------------------------------
let sqliteDb;
if (!usePostgres) {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, 'quickcover.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

// -----------------------------------------------------------------------
// Unified helpers
// -----------------------------------------------------------------------

// dbGet  — returns one row
const dbGet = (sql, params = []) => {
  if (usePostgres) {
    // pg uses $1,$2… placeholders — caller must pass pg-style SQL
    return pool.query(sql, params).then(r => r.rows[0]);
  }
  // SQLite uses ? placeholders; convert pg-style $1,$2 → ? and strip quoted identifiers
  const sqliteSql = sql.replace(/\$\d+/g, '?').replace(/"(\w+)"/g, '$1');
  return new Promise((resolve, reject) => {
    sqliteDb.get(sqliteSql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
};

// dbRun  — INSERT / UPDATE / DELETE
const dbRun = (sql, params = []) => {
  if (usePostgres) {
    return pool.query(sql, params);
  }
  // SQLite uses ? placeholders; convert pg-style $1,$2 → ? and strip quoted identifiers
  const sqliteSql = sql.replace(/\$\d+/g, '?').replace(/"(\w+)"/g, '$1');
  return new Promise((resolve, reject) => {
    sqliteDb.run(sqliteSql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
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
          timestamp TEXT
        )
      `);
    } finally {
      client.release();
    }
  } else {
    // SQLite — promise-wrap the serialize block
    await new Promise((resolve, reject) => {
      sqliteDb.serialize(() => {
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          phone TEXT,
          driverId TEXT NOT NULL UNIQUE,
          platform TEXT DEFAULT 'blinkit',
          createdAt TEXT NOT NULL
        )`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS state (
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
          currentRiskLevel TEXT DEFAULT 'Low'
        )`);
        sqliteDb.run(`INSERT OR IGNORE INTO state (id) VALUES (1)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          status TEXT,
          earnings REAL,
          protectedAmount REAL,
          timestamp TEXT
        )`, resolve);
      });
    });
  }

  console.log(`Database initialised (${usePostgres ? 'PostgreSQL' : 'SQLite local dev'})`);
}

// Graceful pool shutdown (PostgreSQL only)
const closeDatabase = () => (pool ? pool.end() : Promise.resolve());

module.exports = { dbGet, dbRun, initializeDatabase, closeDatabase };
