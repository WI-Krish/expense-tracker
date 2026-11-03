import React from 'react';

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
  expenses,
  onEdit,
  onDelete,
  currencySymbol = '₹',
  trashCount = 0,
  onOpenTrash
}) {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '360px' }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          TRANSACTIONS HISTORY ({expenses.length})
        </h3>

        {/* Right side: Trash / Recently Deleted button */}
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
              backgroundColor: trashCount > 0 ? '#fff1f2' : '#ffffff',
              borderColor: trashCount > 0 ? '#fecdd3' : 'var(--border)',
              color: trashCount > 0 ? '#e11d48' : 'var(--text-secondary)',
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
                    No transactions match your current search or filters.
                  </div>
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
                      {currencySymbol}{Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
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
