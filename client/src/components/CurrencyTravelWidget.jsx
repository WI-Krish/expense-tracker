import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CURRENCIES_LIST, POPULAR_CURRENCY_CODES, getCurrencyInfo } from '../utils/currencies';

export default function CurrencyTravelWidget({
  fromCurrency = 'INR',
  toCurrency = 'AED',
  onSwap,
  onSelectCurrency
}) {
  const [pickerTarget, setPickerTarget] = useState(null); // 'from' | 'to' | null
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  const fromInfo = getCurrencyInfo(fromCurrency);
  const toInfo = getCurrencyInfo(toCurrency);

  // Close modal on outside click or Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && pickerTarget) {
        setPickerTarget(null);
      }
    }

    if (pickerTarget) {
      window.addEventListener('keydown', handleKeyDown);
      const timer = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [pickerTarget]);

  useEffect(() => {
    if (pickerTarget) setSearchQuery('');
  }, [pickerTarget]);

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CURRENCIES_LIST;
    return CURRENCIES_LIST.filter((curr) => {
      return (
        curr.code.toLowerCase().includes(q) ||
        curr.name.toLowerCase().includes(q) ||
        curr.country.toLowerCase().includes(q) ||
        curr.symbol.toLowerCase().includes(q) ||
        (curr.keywords || '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const handlePickCurrency = (code) => {
    if (onSelectCurrency && pickerTarget) {
      onSelectCurrency(pickerTarget, code);
    }
    setPickerTarget(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Travel-style Dual Currency Split Pill Widget */}
      <div
        className="currency-travel-widget"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          height: '46px',
          position: 'relative',
          userSelect: 'none'
        }}
      >
        {/* Left Side: FROM Currency (Active View) */}
        <div
          onClick={() => setPickerTarget('from')}
          style={{
            padding: '5px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '11px 0 0 11px',
            backgroundColor: 'var(--surface-hover)',
            transition: 'background-color 0.15s ease',
            minWidth: '115px'
          }}
          title="Active Currency: Click to change FROM currency"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '4px'
          }}>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              From (Active)
            </span>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>✎</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '1px'
          }}>
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{fromInfo.flag}</span>
            <span style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap'
            }}>
              {fromInfo.code}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              ({fromInfo.symbol})
            </span>
          </div>
        </div>

        {/* Center Circular 1-Click Swap Button with Divider */}
        <div style={{ position: 'relative', width: '1px', height: '28px', backgroundColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSwap) onSwap();
            }}
            className="currency-swap-circular-btn"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
              padding: 0,
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
            title="1-Click Swap Currencies & Convert View"
            aria-label="Swap Currencies"
          >
            {/* Travel-style Dual Opposing Arrows SVG */}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="20" y1="7" x2="4" y2="7" />
              <polyline points="10 3 4 7 10 11" />
              <line x1="4" y1="17" x2="20" y2="17" />
              <polyline points="14 13 20 17 14 21" />
            </svg>
          </button>
        </div>

        {/* Right Side: TO Currency (Target Conversion) */}
        <div
          onClick={() => setPickerTarget('to')}
          style={{
            padding: '5px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '0 11px 11px 0',
            backgroundColor: 'transparent',
            transition: 'background-color 0.15s ease',
            minWidth: '115px'
          }}
          title="Target Currency: Click to change TO currency"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '4px'
          }}>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              To
            </span>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>✎</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '1px'
          }}>
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{toInfo.flag}</span>
            <span style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap'
            }}>
              {toInfo.code}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              ({toInfo.symbol})
            </span>
          </div>
        </div>
      </div>

      {/* Searchable Currency Picker Modal */}
      {pickerTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setPickerTarget(null)}
        >
          <div
            ref={modalRef}
            className="card"
            style={{
              width: '100%',
              maxWidth: '380px',
              maxHeight: '80vh',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              animation: 'dropdownFadeIn 0.15s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🌍</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Select {pickerTarget === 'from' ? 'Base (From)' : 'Target (To)'} Currency
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPickerTarget(null)}
                className="btn-secondary"
                style={{ width: '28px', height: '28px', padding: 0, borderRadius: '6px' }}
              >
                ✕
              </button>
            </div>

            {/* Popular Currencies Bar */}
            <div style={{
              padding: '10px 16px 8px 16px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--surface-hover)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {POPULAR_CURRENCY_CODES.slice(0, 5).map((code) => {
                const info = getCurrencyInfo(code);
                const isCurrent = (pickerTarget === 'from' ? fromCurrency : toCurrency) === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handlePickCurrency(code)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: isCurrent ? 'var(--primary)' : 'var(--surface)',
                      color: isCurrent ? 'var(--primary-text)' : 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <span>{info.flag}</span> {code}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ padding: '12px 16px 6px 16px' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search country (Dubai, India...) or currency (AED, USD)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px' }}
                autoComplete="off"
              />
            </div>

            {/* Currency Options List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '6px 16px 18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {filteredCurrencies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No currency found for "{searchQuery}"
                </div>
              ) : (
                filteredCurrencies.map((c) => {
                  const isCurrent = (pickerTarget === 'from' ? fromCurrency : toCurrency) === c.code;
                  return (
                    <div
                      key={c.code}
                      onClick={() => handlePickCurrency(c.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isCurrent ? 'var(--surface-hover)' : 'transparent',
                        border: `1px solid ${isCurrent ? 'var(--primary)' : 'transparent'}`,
                        transition: 'background-color 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '1.3rem' }}>{c.flag}</span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {c.code} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({c.symbol})</span>
                          </div>
                          <div style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {c.country.split(',')[0]}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
