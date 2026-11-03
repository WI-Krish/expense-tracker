import React, { useEffect } from 'react';

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Other: '📦'
};

export default function TrashModal({
  isOpen,
  onClose,
  trash = [],
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  currencySymbol = '₹'
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalTrashAmount = trash.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const formatDeletedDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          margin: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem'
              }}
            >
              🗑️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Recently Deleted
                </h3>
                <span
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid var(--border)'
                  }}
                >
                  {trash.length} {trash.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Restore items back to active expenses or delete them permanently.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {trash.length > 0 && (
              <button
                type="button"
                className="btn-danger-subtle"
                onClick={onEmptyTrash}
                style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}
                title="Permanently remove all items from trash"
              >
                Empty Trash
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: 'var(--text-secondary)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'background 0.15s ease'
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content - List */}
        <div
          style={{
            padding: '16px 24px',
            overflowY: 'auto',
            flex: 1,
            maxHeight: 'calc(85vh - 130px)',
            backgroundColor: '#fafbfc'
          }}
        >
          {trash.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗑️</div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Trash is empty
              </div>
              <div style={{ fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto' }}>
                When you delete expenses, they will be kept here safely so you can restore them anytime.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {trash.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      <span className={`badge-pill badge-${item.category || 'Other'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                        <span>{CATEGORY_ICONS[item.category] || '🏷️'}</span>
                        <span>{item.category || 'Other'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                      {item.note && (
                        <span style={{ fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{item.note}"
                        </span>
                      )}
                      <span>Date: {item.date}</span>
                      {item.deletedAt && (
                        <span style={{ color: '#ef4444' }}>
                          Deleted: {formatDeletedDate(item.deletedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Amount */}
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {currencySymbol}{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      onClick={() => onRestore(item.id)}
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Restore to active transactions"
                    >
                      <span>↺</span>
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onPermanentDelete(item.id)}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Permanently remove"
                    >
                      <span>✕</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {trash.length > 0 ? (
              <span>
                Total in Trash: <strong>{currencySymbol}{totalTrashAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
            ) : (
              <span>0 deleted items</span>
            )}
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
