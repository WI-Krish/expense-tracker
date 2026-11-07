// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'expenses.json');
const TRASH_FILE = path.join(__dirname, 'trash.json');


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
      expenses: '/api/expenses',
      trash: '/api/trash'
    }
  });
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
