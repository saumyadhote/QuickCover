const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('./database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'quickcover-dev-secret-change-in-prod';
const JWT_EXPIRES = '30d';

// Allowed zone IDs — one per supported city
const VALID_ZONES = ['ZONE_A', 'ZONE_B', 'ZONE_C'];

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, driverId, platform, zoneId } = req.body;

  if (!name || !email || !password || !driverId) {
    return res.status(400).json({ error: 'name, email, password, and driverId are required' });
  }

  // Default to ZONE_A (Bengaluru) if not provided or invalid
  const zone = VALID_ZONES.includes(zoneId) ? zoneId : 'ZONE_A';

  try {
    const existing = await dbGet('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const driverExists = await dbGet('SELECT id FROM users WHERE "driverId" = $1', [driverId]);
    if (driverExists) {
      return res.status(409).json({ error: 'This Driver ID is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await dbRun(
      `INSERT INTO users (name, email, "passwordHash", phone, "driverId", platform, "zoneId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, email, passwordHash, phone || null, driverId, platform || 'blinkit', zone, new Date().toISOString()]
    );

    const user = await dbGet('SELECT id, name, email, phone, "driverId", platform, "zoneId", "createdAt" FROM users WHERE email = $1', [email]);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await dbGet(
      'SELECT id, name, email, phone, "driverId", platform, "zoneId", "createdAt", "passwordHash" FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // passwordHash column — SQLite returns as-is, PostgreSQL returns lowercase key
    const hash = user.passwordHash || user.passwordhash;
    if (!hash) {
      console.error('Login error: passwordHash missing from user row', Object.keys(user));
      return res.status(500).json({ error: 'Login failed' });
    }

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const { passwordHash: _a, passwordhash: _b, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /auth/me  — verify token and return current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await dbGet(
      'SELECT id, name, email, phone, "driverId", platform, "zoneId", "createdAt" FROM users WHERE id = $1',
      [payload.userId]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
