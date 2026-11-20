// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'expenses.json');
const TRASH_FILE = path.join(__dirname, 'trash.json');
const USERS_FILE = path.join(__dirname, 'users.json');


// Ensure data file exists with default sample data if empty
if (!fs.existsSync(DATA_FILE) || fs.readFileSync(DATA_FILE, 'utf-8').trim() === '' || fs.readFileSync(DATA_FILE, 'utf-8').trim() === '[]') {
  const initialExpenses = [
    {
      id: '1',
      title: 'Groceries',
      amount: 45.5,
      category: 'Food',
      date: '2026-11-01',
      note: 'Weekly essentials'
    },
    {
      id: '2',
      title: 'Subway Pass',
      amount: 25.0,
      category: 'Transport',
      date: '2026-11-02',
      note: 'Commuter recharge'
    },
    {
      id: '3',
      title: 'Internet Service',
      amount: 60.0,
      category: 'Bills',
      date: '2026-11-02',
      note: 'Monthly fiber broadband'
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialExpenses, null, 2));
}

// Ensure trash file exists
if (!fs.existsSync(TRASH_FILE)) {
  fs.writeFileSync(TRASH_FILE, JSON.stringify([], null, 2));
}

// Helpers to load and save expenses
function loadExpenses() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function saveExpenses(expenses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));
}

// Helpers to load and save trash
function loadTrash() {
  try {
    const raw = fs.readFileSync(TRASH_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function saveTrash(trash) {
  fs.writeFileSync(TRASH_FILE, JSON.stringify(trash, null, 2));
}

// =====================================================================
// Authentication & Password Encryption Utilities (PBKDF2-SHA512 with Salt)
// =====================================================================

// Active session tokens map: token -> { userId, email, expiresAt }
const sessions = new Map();

function encryptClientPassword(password) {
  if (!password) return '';
  const CLIENT_PEPPER = 'expense_tracker_secure_client_pepper_v1';
  let h = crypto.createHash('sha256').update(password + CLIENT_PEPPER).digest('hex');
  for (let i = 0; i < 50; i++) {
    h = crypto.createHash('sha256').update(h + CLIENT_PEPPER).digest('hex');
  }
  return h;
}

function hashPassword(password) {
  // Generate cryptographically secure random 16-byte salt
  const salt = crypto.randomBytes(16).toString('hex');
  // Hash password using 100,000 iterations of PBKDF2 with SHA-512
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedCombined) {
  try {
    const parts = storedCombined.split(':');
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    // Direct match (for passwords hashed from client-encrypted string or matching string)
    if (crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(verifyHash, 'hex'))) {
      return true;
    }
    // Backward compatibility: if user was registered before client pre-hashing
    const clientHashed = encryptClientPassword(password);
    const verifyHash2 = crypto.pbkdf2Sync(clientHashed, salt, 100000, 64, 'sha512').toString('hex');
    if (crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(verifyHash2, 'hex'))) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // Seed default demo user with client-encrypted password 'demo123'
      const demoUser = {
        id: 'user_demo_1',
        name: 'Demo User',
        email: 'demo@example.com',
        passwordHash: hashPassword(encryptClientPassword('demo123')),
        createdAt: new Date().toISOString()
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify([demoUser], null, 2));
      return [demoUser];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// =====================================================================
// Route Indexing: Root and API Status
// =====================================================================

// Root route - returns server status and directory of available routes
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Expense Tracker Server is live and operational',
    version: '1.0.0',
    endpoints: {
      server_root: 'GET /',
      api_index: 'GET /api',
      auth_register: 'POST /api/auth/register',
      auth_login: 'POST /api/auth/login',
      auth_me: 'GET /api/auth/me',
      expenses: 'GET /api/expenses',
      add_expense: 'POST /api/expenses',
      update_expense: 'PUT /api/expenses/:id',
      delete_expense: 'DELETE /api/expenses/:id',
      trash: 'GET /api/trash',
      restore_trash: 'POST /api/trash/:id/restore',
      empty_trash: 'DELETE /api/trash'
    }
  });
});

// API Index / Health Check
app.get(['/api', '/api/status', '/api/health'], (req, res) => {
  res.json({
    status: 'online',
    message: 'Expense Tracker API is live',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      expenses: '/api/expenses',
      trash: '/api/trash'
    }
  });
});

// =====================================================================
// Authentication Routes (with Salted PBKDF2 Encrypted Passwords)
// =====================================================================

// POST Register
app.post(['/api/auth/register', '/auth/register'], (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Encrypt password using Salted PBKDF2-SHA512
    const passwordHash = hashPassword(password);
    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Issue secure session token
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
      userId: newUser.id,
      email: newUser.email,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// POST Login
app.post(['/api/auth/login', '/auth/login'], (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = loadUsers();
    const identifier = email.trim().toLowerCase();

    // Support login by email or name/username
    const user = users.find(u => u.email.toLowerCase() === identifier || u.name.toLowerCase() === identifier);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify encrypted password with timing-safe comparison
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Issue secure session token
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// GET Current User Profile
app.get(['/api/auth/me', '/auth/me'], (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || !sessions.has(token)) {
      return res.status(401).json({ message: 'Unauthorized or session expired' });
    }

    const session = sessions.get(token);
    if (session.expiresAt && session.expiresAt < Date.now()) {
      sessions.delete(token);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    const users = loadUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =====================================================================
// Expense CRUD Routes (supports /api/expenses and /expenses)
// =====================================================================

// GET all expenses
app.get(['/api/expenses', '/expenses'], (req, res) => {
  const expenses = loadExpenses();
  res.json(expenses);
});

// GET single expense
app.get(['/api/expenses/:id', '/expenses/:id'], (req, res) => {
  const expenses = loadExpenses();
  const expense = expenses.find(e => e.id === req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

// POST create expense
app.post(['/api/expenses', '/expenses'], (req, res) => {
  const expenses = loadExpenses();
  const { title, amount, category, date, note, currency } = req.body || {};

  if (!title || !amount || !date) {
    return res.status(400).json({ message: 'Title, amount, and date are required' });
  }

  const newExpense = {
    id: Date.now().toString(),
    title: title.trim(),
    amount: Math.round(Number(amount) * 100) / 100,
    category: category || 'Other',
    date,
    note: (note || '').trim(),
    currency: currency || 'INR'
  };

  expenses.push(newExpense);
  saveExpenses(expenses);
  res.status(201).json(newExpense);
});

// PUT update expense
app.put(['/api/expenses/:id', '/expenses/:id'], (req, res) => {
  const expenses = loadExpenses();
  const idx = expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Expense not found' });

  const { title, amount, category, date, note, currency } = req.body || {};
  expenses[idx] = {
    ...expenses[idx],
    title: title !== undefined ? title.trim() : expenses[idx].title,
    amount: amount !== undefined ? Math.round(Number(amount) * 100) / 100 : expenses[idx].amount,
    category: category !== undefined ? category : expenses[idx].category,
    date: date !== undefined ? date : expenses[idx].date,
    note: note !== undefined ? note.trim() : expenses[idx].note,
    currency: currency !== undefined ? currency : (expenses[idx].currency || 'INR')
  };

  saveExpenses(expenses);
  res.json(expenses[idx]);
});

// DELETE expense -> Moves to Trash
app.delete(['/api/expenses/:id', '/expenses/:id'], (req, res) => {
  const expenses = loadExpenses();
  const idx = expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Expense not found' });

  const removed = expenses.splice(idx, 1)[0];
  saveExpenses(expenses);

  // Add to trash with timestamp
  const trash = loadTrash();
  const trashItem = {
    ...removed,
    deletedAt: new Date().toISOString()
  };
  trash.unshift(trashItem);
  saveTrash(trash);

  res.json({ message: 'Moved to trash successfully', expense: trashItem });
});

// =====================================================================
// Trash / Recently Deleted Routes
// =====================================================================

// GET all items in trash
app.get(['/api/trash', '/trash'], (req, res) => {
  const trash = loadTrash();
  res.json(trash);
});

// POST restore item from trash
app.post(['/api/trash/:id/restore', '/trash/:id/restore'], (req, res) => {
  const trash = loadTrash();
  const idx = trash.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Item not found in trash' });

  const restored = trash.splice(idx, 1)[0];
  delete restored.deletedAt;
  saveTrash(trash);

  const expenses = loadExpenses();
  expenses.push(restored);
  saveExpenses(expenses);

  res.json({ message: 'Expense restored successfully', expense: restored });
});

// DELETE permanently delete single item from trash
app.delete(['/api/trash/:id', '/trash/:id'], (req, res) => {
  const trash = loadTrash();
  const idx = trash.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Item not found in trash' });

  const permanentlyDeleted = trash.splice(idx, 1)[0];
  saveTrash(trash);

  res.json({ message: 'Item permanently deleted', expense: permanentlyDeleted });
});

// DELETE empty entire trash
app.delete(['/api/trash', '/trash'], (req, res) => {
  saveTrash([]);
  res.json({ message: 'Trash emptied successfully' });
});

// =====================================================================
// Catch-all 404 Handler for undefined routes
// =====================================================================
app.all('*', (req, res) => {
  res.status(404).json({
    message: `Route '${req.originalUrl}' not found. Please refer to available endpoints.`,
    availableEndpoints: ['GET /', 'GET /api', 'GET /api/expenses', 'GET /api/trash']
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
