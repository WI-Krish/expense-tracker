import React, { useEffect, useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import Filters from './components/Filters';
import TrashModal from './components/TrashModal';
import './index.css';

const currencySymbol = '₹';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [trash, setTrash] = useState([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [filters, setFilters] = useState({ category: 'All', from: '', to: '', search: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyLimit, setMonthlyLimit] = useState(() => {
    const saved = localStorage.getItem('monthly_limit');
    return saved ? Number(saved) : 10000;
  });

  const updateMonthlyLimit = (newLimit) => {
    const val = Number(newLimit) || 10000;
    setMonthlyLimit(val);
    localStorage.setItem('monthly_limit', val.toString());
  };

  // Load all active expenses from backend
  const loadExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setExpenses(data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load recently deleted trash items from backend
  const loadTrash = async () => {
    try {
      const res = await fetch('/api/trash');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrash(data);
      }
    } catch (err) {
      console.error('Error fetching trash:', err);
    }
  };

  useEffect(() => {
    loadExpenses();
    loadTrash();
  }, []);

  // CRUD handlers
  const addExpense = async (data) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await loadExpenses();
        // Reset filters so the newly added expense is visible immediately at the top of the table
        setFilters({ category: 'All', from: '', to: '', search: '' });
        return { success: true };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { error: errJson.message || `Server returned error (${res.status})` };
      }
    } catch (err) {
      console.error('Failed to add expense:', err);
      return { error: 'Backend server is not responding. Please make sure the server is running.' };
    }
  };

  const updateExpense = async (id, data) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await loadExpenses();
        setEditingId(null);
        return { success: true };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { error: errJson.message || `Server returned error (${res.status})` };
      }
    } catch (err) {
      console.error('Failed to update expense:', err);
      return { error: 'Backend server is not responding.' };
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadExpenses();
        loadTrash();
        if (editingId === id) setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const restoreExpense = async (id) => {
    try {
      const res = await fetch(`/api/trash/${id}/restore`, {
        method: 'POST'
      });
      if (res.ok) {
        loadExpenses();
        loadTrash();
      }
    } catch (err) {
      console.error('Failed to restore expense:', err);
    }
  };

  const permanentlyDelete = async (id) => {
    if (!window.confirm('Permanently delete this expense? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/trash/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadTrash();
      }
    } catch (err) {
      console.error('Failed to permanently delete expense:', err);
    }
  };

  const emptyTrash = async () => {
    if (!window.confirm('Are you sure you want to empty the trash? All deleted items will be lost permanently.')) return;

    try {
      const res = await fetch('/api/trash', {
        method: 'DELETE'
      });
      if (res.ok) {
        loadTrash();
      }
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  };

  // Filtering
  const filtered = expenses
    .filter((e) => {
      if (filters.category !== 'All' && e.category !== filters.category) return false;
      if (filters.from && e.date < filters.from) return false;
      if (filters.to && e.date > filters.to) return false;
      if (filters.search && !e.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id || '').localeCompare(a.id || ''));

  const startEdit = (id) => {
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => setEditingId(null);
  const editingExpense = expenses.find((e) => e.id === editingId);

  return (
    <div className="container">
      {/* Minimalist Top Navigation Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0 24px 0',
        marginBottom: '16px',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            fontWeight: 700
          }}>
            {currencySymbol}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Expense Tracker
            </h1>
          </div>
        </div>
      </header>

      {/* Main Dashboard View */}
      <div>
        {/* Summary Metric Cards - Permanent steady total overview */}
        <Summary
          expenses={expenses}
          currencySymbol={currencySymbol}
          monthlyLimit={monthlyLimit}
          onUpdateMonthlyLimit={updateMonthlyLimit}
        />

        {/* 60% - 40% Layout: New Expense (60%) & Search/Filters (40%) */}
        <div
          className="split-60-40-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
            gap: '24px',
            alignItems: 'stretch',
            marginBottom: '24px'
          }}
        >
          {/* 60% Column 1: New / Edit Expense Form */}
          <div>
            <ExpenseForm
              onSubmit={editingId ? (data) => updateExpense(editingId, data) : addExpense}
              initialData={editingExpense}
              onCancel={cancelEdit}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* 40% Column 2: Search & Filters */}
          <div>
            <Filters filters={filters} setFilters={setFilters} />
          </div>
        </div>

        {/* Full Width 100%: Transaction History Table */}
        <div style={{ width: '100%' }}>
          <ExpenseList
            expenses={filtered}
            onEdit={startEdit}
            onDelete={deleteExpense}
            currencySymbol={currencySymbol}
            trashCount={trash.length}
            onOpenTrash={() => setIsTrashOpen(false || true)}
          />
        </div>
      </div>

      {/* Trash / Recently Deleted Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        trash={trash}
        onRestore={restoreExpense}
        onPermanentDelete={permanentlyDelete}
        onEmptyTrash={emptyTrash}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
