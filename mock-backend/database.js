const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
// In the future, this can be easily migrated to Supabase by replacing 
// these sqlite3.Database calls with @supabase/supabase-js client calls.
// Supabase equivalent: const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const dbPath = path.resolve(__dirname, 'quickcover.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // We create a single-row state table to hold the global simulation state
    // In a real Supabase schema, this would be a 'workers' table where each 
    // row is a worker's current state (e.g., worker_id, is_trip_active, etc.)
    db.run(`CREATE TABLE IF NOT EXISTS state (
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

    // Insert the default row if it doesn't exist
    db.run(`INSERT OR IGNORE INTO state (id, isTripActive, claimStatus, weeklyEarnings, weeklyProtected, currentMicroFee, currentRiskLevel) 
            VALUES (1, 0, 'none', 3200, 0, 2.0, 'Low')`);

    // We create a trips table to track historical trips
    db.run(`CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT, -- 'completed', 'disrupted'
      earnings REAL,
      protectedAmount REAL,
      timestamp TEXT
    )`);
  });
}

// Helper wrappers for Promisified SQLite queries to act more like Modern ORMs/Supabase
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

module.exports = {
  db,
  dbGet,
  dbRun
};
