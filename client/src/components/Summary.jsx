import React, { useState, useEffect } from 'react';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#0284c7',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Other: '#64748b'
};

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Other: '📦'
};

/**
 * Summary component – displays clean minimalist metric cards and stable category breakdown.
 */
export default function Summary({
  expenses = [],
  currencySymbol = '₹',
  currencyCode = 'INR',
  monthlyLimit = 10000,
  onUpdateMonthlyLimit
}) {
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(monthlyLimit ? Math.round(monthlyLimit).toString() : '10000');

  useEffect(() => {
    setTempLimit(monthlyLimit ? Math.round(monthlyLimit).toString() : '10000');
  }, [monthlyLimit]);

  const getAmount = (e) => Number(e.convertedAmount !== undefined ? e.convertedAmount : e.amount) || 0;

  const total = expenses.reduce((sum, e) => sum + getAmount(e), 0);
  const count = expenses.length;

  // Monthly Limit calculations based on current YYYY-MM
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthExpenses = expenses.filter((e) => (e.date || '').startsWith(currentMonthKey));
  const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + getAmount(e), 0);
  const remaining = Math.max(0, monthlyLimit - currentMonthTotal);
  const percentUsed = monthlyLimit > 0 ? Math.round((currentMonthTotal / monthlyLimit) * 100) : 0;
  const isOverLimit = currentMonthTotal > monthlyLimit;
  const isWarning = !isOverLimit && percentUsed >= 75;

  const handleSaveLimit = () => {
    const parsed = parseFloat(tempLimit);
    if (!isNaN(parsed) && parsed > 0) {
      if (onUpdateMonthlyLimit) {
        onUpdateMonthlyLimit(parsed);
      }
      setIsEditingLimit(false);
    }
  };

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + getAmount(e);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None';

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Spending</div>
          <div className="metric-value">
            {currencySymbol} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="metric-subtitle">Across {count} recorded expense{count === 1 ? '' : 's'}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Transactions</div>
          <div className="metric-value">{count}</div>
          <div className="metric-subtitle">Active expense entries</div>
        </div>

        {/* Monthly Limit Card (replaces Average Expense) */}
        <div
          className="metric-card"
          style={{
            borderColor: isOverLimit ? 'var(--danger)' : isWarning ? '#f59e0b' : 'var(--border)',
            backgroundColor: isOverLimit ? 'var(--danger-light)' : 'var(--surface)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label" style={{ margin: 0 }}>Monthly Limit</span>
            {!isEditingLimit ? (
              <button
                type="button"
                onClick={() => {
                  setTempLimit(monthlyLimit.toString());
                  setIsEditingLimit(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  color: '#4f46e5',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
                title="Change monthly spending limit"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
            ) : null}
          </div>

          {isEditingLimit ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: '4px 0' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '3px 6px 3px 20px',
                    fontSize: '0.875rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    boxSizing: 'border-box'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLimit();
                    if (e.key === 'Escape') setIsEditingLimit(false);
                  }}
                />
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveLimit}
                style={{ padding: '3px 8px', fontSize: '0.75rem', height: '28px', minWidth: '42px' }}
              >
                Save
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditingLimit(false)}
                style={{ padding: '3px 6px', fontSize: '0.75rem', height: '28px' }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span className="metric-value" style={{ fontSize: '1.4rem' }}>
                {currencySymbol} {Number(monthlyLimit).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: isOverLimit ? '#fee2e2' : isWarning ? '#fef3c7' : '#dcfce7',
                  color: isOverLimit ? '#b91c1c' : isWarning ? '#92400e' : '#15803d'
                }}
              >
                {isOverLimit ? 'Exceeded' : `${percentUsed}% used`}
              </span>
            </div>
          )}

          {/* Mini Progress Bar */}
          <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--surface-hover)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(percentUsed, 100)}%`,
                backgroundColor: isOverLimit ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
                transition: 'width 0.25s ease'
              }}
            />
          </div>

          <div className="metric-subtitle" style={{ fontSize: '0.74rem', margin: 0 }}>
            {isOverLimit ? (
              <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                Over budget by {currencySymbol} {(currentMonthTotal - monthlyLimit).toFixed(2)}
              </span>
            ) : (
              <span>
                Spent {currencySymbol} {currentMonthTotal.toFixed(0)} • <strong style={{ color: '#15803d' }}>{currencySymbol} {remaining.toFixed(0)} left</strong>
              </span>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Top Category</div>
          <div className="metric-value" style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{CATEGORY_ICONS[topCategory] || '🏷️'}</span>
            <span>{topCategory}</span>
          </div>
          <div className="metric-subtitle">
            {sortedCategories.length > 0
              ? `${currencySymbol} ${sortedCategories[0][1].toFixed(2)} (${Math.round((sortedCategories[0][1] / (total || 1)) * 100)}%)`
              : 'No expenses yet'}
          </div>
        </div>
      </div>

      {/* Visual Category Distribution */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '24px', minHeight: '124px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            SPENDING BY CATEGORY
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {sortedCategories.length} categor{sortedCategories.length === 1 ? 'y' : 'ies'}
          </span>
        </div>

        {sortedCategories.length > 0 ? (
          <>
            {/* Multi-segment distribution bar */}
            <div style={{
              height: '10px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              {sortedCategories.map(([cat, amt]) => {
                const pct = (amt / (total || 1)) * 100;
                return (
                  <div
                    key={cat}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CATEGORY_COLORS[cat] || '#64748b',
                      height: '100%',
                      transition: 'width 0.15s ease'
                    }}
                    title={`${cat}: ${currencySymbol} ${amt.toFixed(2)} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Category labels and percentages */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {sortedCategories.map(([cat, amt]) => {
                const pct = Math.round((amt / (total || 1)) * 100);
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: CATEGORY_COLORS[cat] || '#64748b'
                    }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{currencySymbol} {amt.toFixed(0)} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '10px 0' }}>
            No category distribution available for the current search filter.
          </div>
        )}
      </div>
    </div>
  );
}
