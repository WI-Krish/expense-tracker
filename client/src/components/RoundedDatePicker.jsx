import React, { useState, useRef, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format YYYY-MM-DD to a nice readable string, e.g. "Nov 3, 2026"
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RoundedDatePicker({
  value = '',
  onChange,
  placeholder = 'Select date',
  allowClear = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value to set calendar view month and year
  const parseInitialDate = () => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return new Date(y, m, d);
      }
    }
    return new Date();
  };

  const [viewDate, setViewDate] = useState(parseInitialDate);

  // Sync viewDate when value changes externally
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
      }
    }
  }, [value]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    setViewDate(today);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Generate calendar days
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = today.getDate();

  // Check if a day is the selected date
  const isSelected = (day) => {
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length !== 3) return false;
    return (
      parseInt(parts[0], 10) === year &&
      parseInt(parts[1], 10) - 1 === month &&
      parseInt(parts[2], 10) === day
    );
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-datepicker-container ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Clickable Rounded Bar */}
      <div
        className={`form-control rounded-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          width: '100%',
          backgroundColor: 'var(--surface)',
          userSelect: 'none'
        }}
      >
        <span style={{ fontWeight: 500, color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>

        {/* Calendar Vector Icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginLeft: '8px' }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {/* Floating Rounded Calendar Dropdown Popover */}
      {isOpen && (
        <div
          className="rounded-datepicker-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '280px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            padding: '16px',
            zIndex: 1050,
            animation: 'dropdownFadeIn 0.15s ease-out'
          }}
        >
          {/* Calendar Header: Month, Year & Arrows */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Previous Month"
            >
              ‹
            </button>

            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {MONTH_NAMES[month]} {year}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Next Month"
            >
              ›
            </button>
          </div>

          {/* Weekday Names Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            marginBottom: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}>
            {DAY_LABELS.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            textAlign: 'center'
          }}>
            {/* Previous month padding days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const prevDay = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  style={{
                    height: '32px',
                    lineHeight: '32px',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    userSelect: 'none'
                  }}
                >
                  {prevDay}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const isToday = isCurrentMonth && currentDay === day;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: '32px',
                    width: '32px',
                    margin: '0 auto',
                    padding: 0,
                    borderRadius: '9px',
                    border: isToday && !selected ? '1px solid var(--border-focus)' : 'none',
                    backgroundColor: selected ? 'var(--primary)' : 'transparent',
                    color: selected ? 'var(--primary-text)' : 'var(--text-primary)',
                    fontWeight: selected || isToday ? 600 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={handleSetToday}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                fontSize: '0.785rem',
                fontWeight: 600,
                color: '#2563eb',
                cursor: 'pointer'
              }}
            >
              Today
            </button>

            {allowClear && value && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  fontSize: '0.785rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
