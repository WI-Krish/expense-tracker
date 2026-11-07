import React, { useEffect, useState, useMemo } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import TrashModal from './components/TrashModal';
import CurrencyTravelWidget from './components/CurrencyTravelWidget';
import {
  convertCurrency,
  getCurrencyInfo,
  fetchLiveExchangeRates,
  DEFAULT_RATES_FROM_INR
} from './utils/currencies';
import './index.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://expense-tracker-5i3x.onrender.com').replace(/\/+$/, '');

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [trash, setTrash] = useState([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [filters, setFilters] = useState({ category: 'All', from: '', to: '', search: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Base monthly limit stored in INR
  const [monthlyLimit, setMonthlyLimit] = useState(() => {
    const saved = localStorage.getItem('monthly_limit');
    return saved ? Number(saved) : 10000;
  });

  // Dual Currency state (From: INR, To: AED by default)
  const [fromCurrency, setFromCurrency] = useState(() => {
    return localStorage.getItem('currency_from') || 'INR';
  });

  const [toCurrency, setToCurrency] = useState(() => {
    return localStorage.getItem('currency_to') || 'AED';
  });

  const [currentCurrency, setCurrentCurrency] = useState(() => {
    return localStorage.getItem('app_currency') || 'INR';
  });

  // Client-side currency map for each expense to ensure 100% persistence
  const [currencyMap, setCurrencyMap] = useState(() => {
    try {
      const saved = localStorage.getItem('expense_currencies_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveCurrencyForExpense = (id, curr) => {
    if (!id || !curr) return;
    setCurrencyMap((prev) => {
      const updated = { ...prev, [id]: curr };
      try {
        localStorage.setItem('expense_currencies_map', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [exchangeRates, setExchangeRates] = useState(() => {
    const cached = localStorage.getItem('cached_exchange_rates');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.rates) return parsed.rates;
      } catch {}
    }
    return DEFAULT_RATES_FROM_INR;
  });

  // Persist Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Persist Currencies & Fetch Live Rates
  useEffect(() => {
    localStorage.setItem('currency_from', fromCurrency);
  }, [fromCurrency]);

  useEffect(() => {
    localStorage.setItem('currency_to', toCurrency);
  }, [toCurrency]);

  useEffect(() => {
    localStorage.setItem('app_currency', currentCurrency);
  }, [currentCurrency]);

  useEffect(() => {
    fetchLiveExchangeRates().then((rates) => {
      if (rates) setExchangeRates(rates);
    });
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 1-Click Swap between From and To currencies
  const handleSwapCurrencies = () => {
    const oldFrom = fromCurrency;
    const oldTo = toCurrency;
    setFromCurrency(oldTo);
    setToCurrency(oldFrom);
    // Switch active viewing currency to the swapped target
    setCurrentCurrency((prev) => (prev === oldFrom ? oldTo : oldFrom));
  };

  const handleSelectTravelCurrency = (side, code) => {
    if (side === 'from') {
      if (code === toCurrency) {
        // Swap if same selected
        setToCurrency(fromCurrency);
      }
      setFromCurrency(code);
      setCurrentCurrency(code);
    } else {
      if (code === fromCurrency) {
        // Swap if same selected
        setFromCurrency(toCurrency);
        setCurrentCurrency(toCurrency);
      }
      setToCurrency(code);
    }
  };

  const handleSetActiveCurrency = (code) => {
    setCurrentCurrency(code);
  };

  const currencyInfo = getCurrencyInfo(currentCurrency);
  const currencySymbol = currencyInfo.symbol;

  // Monthly limit conversion
  const activeMonthlyLimit = convertCurrency(monthlyLimit, 'INR', currentCurrency, exchangeRates);

  const updateMonthlyLimitFromActive = (newValInActiveCurrency) => {
    const inINR = convertCurrency(newValInActiveCurrency, currentCurrency, 'INR', exchangeRates);
    const rounded = Math.round(inINR);
    setMonthlyLimit(rounded);
    localStorage.setItem('monthly_limit', rounded.toString());
  };

  // Load all active expenses from backend
  const loadExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/expenses`);
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
      const res = await fetch(`${API_BASE}/api/trash`);
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
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const created = await res.json().catch(() => null);
        if (created && created.id && data.currency) {
          saveCurrencyForExpense(created.id, data.currency);
        }
        await loadExpenses();
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
    if (id && data.currency) {
      saveCurrencyForExpense(id, data.currency);
    }
    try {
      const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
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
      const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
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
      const res = await fetch(`${API_BASE}/api/trash/${id}/restore`, {
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
      const res = await fetch(`${API_BASE}/api/trash/${id}`, {
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
      const res = await fetch(`${API_BASE}/api/trash`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadTrash();
      }
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  };

  // Convert expenses dynamically into the active view currency
  const convertedExpenses = useMemo(() => {
    return expenses.map((e) => {
      const origCurr = e.currency || currencyMap[e.id] || 'INR';
      const converted = convertCurrency(e.amount, origCurr, currentCurrency, exchangeRates);
      return {
        ...e,
        currency: origCurr,
        originalCurrency: origCurr,
        originalAmount: Number(e.amount),
        convertedAmount: converted
      };
    });
  }, [expenses, currentCurrency, exchangeRates, currencyMap]);

  // Filtering
  const filtered = useMemo(() => {
    return convertedExpenses
      .filter((e) => {
        if (filters.category !== 'All' && e.category !== filters.category) return false;
        if (filters.from && e.date < filters.from) return false;
        if (filters.to && e.date > filters.to) return false;
        if (filters.search && !e.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id || '').localeCompare(a.id || ''));
  }, [convertedExpenses, filters]);

  const startEdit = (id) => {
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => setEditingId(null);
  const rawEditingExpense = expenses.find((e) => e.id === editingId);
  const editingExpense = rawEditingExpense ? {
    ...rawEditingExpense,
    currency: rawEditingExpense.currency || currencyMap[rawEditingExpense.id] || 'INR'
  } : null;

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
        {/* Brand with Active Currency Symbol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            fontWeight: 700,
            transition: 'background-color 0.2s ease, color 0.2s ease'
          }}>
            {currencySymbol}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Expense Tracker
            </h1>
          </div>
        </div>

        {/* Right Header: Travel-Style Currency Switcher & Smaller Night Mode Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Travel-style Dual Currency Split Pill Widget */}
          <CurrencyTravelWidget
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            activeCurrency={currentCurrency}
            onSwap={handleSwapCurrencies}
            onSelectCurrency={handleSelectTravelCurrency}
            onSetActiveCurrency={handleSetActiveCurrency}
          />

          {/* Smaller, compact Night Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-secondary"
            style={{
              width: '44px',
              height: '44px',
              padding: 0,
              borderRadius: '12px',
              fontSize: '1.15rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Dashboard View */}
      <div>
        {/* Summary Metric Cards - Permanent steady total overview in active view currency */}
        <Summary
          expenses={convertedExpenses}
          currencySymbol={currencySymbol}
          currencyCode={currentCurrency}
          monthlyLimit={activeMonthlyLimit}
          onUpdateMonthlyLimit={updateMonthlyLimitFromActive}
        />

        {/* New / Edit Expense Form */}
        <ExpenseForm
          onSubmit={editingId ? (data) => updateExpense(editingId, data) : addExpense}
          initialData={editingExpense}
          onCancel={cancelEdit}
          currency={currentCurrency}
          currencySymbol={currencySymbol}
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
        />

        {/* Full Width 100%: Transaction History Table with Integrated Search & Filter Dropdown Card */}
        <div style={{ width: '100%' }}>
          <ExpenseList
            expenses={filtered}
            allExpenses={convertedExpenses}
            filters={filters}
            setFilters={setFilters}
            onEdit={startEdit}
            onDelete={deleteExpense}
            currencySymbol={currencySymbol}
            currencyCode={currentCurrency}
            trashCount={trash.length}
            onOpenTrash={() => setIsTrashOpen(true)}
          />
        </div>
      </div>

      {/* Trash / Recently Deleted Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        trash={trash.map((t) => ({
          ...t,
          currency: t.currency || currencyMap[t.id] || 'INR'
        }))}
        onRestore={restoreExpense}
        onPermanentDelete={permanentlyDelete}
        onEmptyTrash={emptyTrash}
        currencySymbol={currencySymbol}
        currencyCode={currentCurrency}
        exchangeRates={exchangeRates}
      />
    </div>
  );
}
