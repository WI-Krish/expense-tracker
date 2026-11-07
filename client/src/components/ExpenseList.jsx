import React, { useState } from 'react';
import Filters from './Filters';
import { getCurrencyInfo } from '../utils/currencies';

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Other: '📦'
};

export default function ExpenseList({
  expenses = [],
  allExpenses = [],
  filters = { category: 'All', from: '', to: '', search: '' },
  setFilters,
  onEdit,
  onDelete,
  currencySymbol = '₹',
  currencyCode = 'INR',
  trashCount = 0,
  onOpenTrash
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Boolean(
    filters &&
    (filters.category !== 'All' ||
      filters.from !== '' ||
      filters.to !== '' ||
      (filters.search && filters.search.trim() !== ''))
  );

  const activeCount = [
    filters?.category !== 'All',
    Boolean(filters?.from),
    Boolean(filters?.to),
    Boolean(filters?.search && filters.search.trim() !== '')
  ].filter(Boolean).length;

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '360px' }}>
      {/* Card Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            TRANSACTIONS HISTORY ({expenses.length})
          </h3>
          {hasActiveFilters && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text-secondary)',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid var(--border)'
            }}>
              Filtered from {allExpenses.length}
            </span>
          )}
        </div>

        {/* Right side: Search & Filter toggle button + Trash / Recently Deleted */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Dropdown toggle for Search & Filter */}
          {setFilters && (
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={isFilterOpen || hasActiveFilters ? 'btn-primary' : 'btn-outline'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isFilterOpen ? 'Hide Search & Filter' : 'Open Search & Filter'}
            >
              <span>🔍</span>
              <span>Search & Filter</span>
              {activeCount > 0 && (
                <span
                  style={{
                    backgroundColor: isFilterOpen ? 'var(--primary-text)' : 'var(--primary)',
                    color: isFilterOpen ? 'var(--primary)' : 'var(--primary-text)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    marginLeft: '2px'
                  }}
                >
                  {activeCount}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.7rem',
                  display: 'inline-block',
                  transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  marginLeft: '2px'
                }}
              >
                ▼
              </span>
            </button>
          )}

          {/* Recently Deleted button */}
          {onOpenTrash && (
            <button
              type="button"
              onClick={onOpenTrash}
              className="btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)',
                backgroundColor: trashCount > 0 ? 'var(--danger-light)' : 'var(--surface)',
                borderColor: trashCount > 0 ? 'var(--danger)' : 'var(--border)',
                color: trashCount > 0 ? 'var(--danger)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="View Recently Deleted Expenses"
            >
              <span style={{ fontSize: '0.9rem' }}>🗑️</span>
              <span>Recently Deleted</span>
              {trashCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    marginLeft: '2px'
                  }}
                >
                  {trashCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Embedded Dropdown Card: Search & Filter with Real-time Suggestions */}
      {isFilterOpen && setFilters && (
        <Filters
          filters={filters}
          setFilters={setFilters}
          allExpenses={allExpenses}
          totalCount={allExpenses.length}
          filteredCount={expenses.length}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

      {/* Collapsed Filter Quick Bar (shows if filter panel is closed but filters are active) */}
      {!isFilterOpen && hasActiveFilters && (
        <div style={{
          padding: '8px 20px',
          backgroundColor: 'var(--surface-hover)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Filters active:</span>
            {filters.search && (
              <span className="badge-pill" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
                Title: "{filters.search}"
              </span>
            )}
            {filters.category !== 'All' && (
              <span className={`badge-pill badge-${filters.category}`} style={{ fontSize: '0.75rem' }}>
                {CATEGORY_ICONS[filters.category] || '🏷️'} {filters.category}
              </span>
            )}
            {filters.from && (
              <span className="badge-pill" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
                From: {filters.from}
              </span>
            )}
            {filters.to && (
              <span className="badge-pill" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
                To: {filters.to}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.785rem',
                cursor: 'pointer'
              }}
            >
              Modify filters ✎
            </button>
            <button
              type="button"
              onClick={() => setFilters({ category: 'All', from: '', to: '', search: '' })}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                fontWeight: 600,
                fontSize: '0.785rem',
                cursor: 'pointer'
              }}
            >
              Reset ↺
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Expense</th>
              <th style={{ width: '20%' }}>Category</th>
              <th style={{ width: '15%' }}>Date</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🧾</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    No expenses found
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    {hasActiveFilters
                      ? 'No transactions match your current search or filters. Try adjusting your search query or dates.'
                      : 'You have not added any expenses yet.'}
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => setFilters({ category: 'All', from: '', to: '', search: '' })}
                      className="btn-outline"
                      style={{ marginTop: '12px', fontSize: '0.8rem', padding: '6px 14px' }}
                    >
                      ↺ Clear All Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id}>
                  {/* Title & Note */}
                  <td>
                    <div className="expense-title">{exp.title}</div>
                    {exp.note && <div className="expense-note">{exp.note}</div>}
                  </td>

                  {/* Category Badge */}
                  <td>
                    <span className={`badge-pill badge-${exp.category || 'Other'}`}>
                      <span>{CATEGORY_ICONS[exp.category] || '🏷️'}</span>
                      <span>{exp.category || 'Other'}</span>
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {exp.date}
                  </td>

                  {/* Amount */}
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount-cell">
                      {currencySymbol} {Number(exp.convertedAmount !== undefined ? exp.convertedAmount : exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {exp.originalCurrency && exp.originalCurrency !== currencyCode && (
                      <div style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                        marginTop: '2px'
                      }}>
                        orig: {getCurrencyInfo(exp.originalCurrency).symbol} {Number(exp.originalAmount || exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({exp.originalCurrency})
                      </div>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        className="btn-edit-subtle"
                        title="Edit expense"
                        onClick={() => onEdit(exp.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger-subtle"
                        title="Delete expense"
                        onClick={() => onDelete(exp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
