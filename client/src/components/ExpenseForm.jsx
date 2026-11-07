import React, { useState, useEffect } from 'react';
import RoundedSelect from './RoundedSelect';
import RoundedDatePicker from './RoundedDatePicker';
import { getCurrencyInfo, CURRENCIES_LIST } from '../utils/currencies';

const CATEGORIES = [
  { value: 'Food', label: 'Food', icon: '🍔' },
  { value: 'Transport', label: 'Transport', icon: '🚗' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'Bills', label: 'Bills', icon: '📄' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'Health', label: 'Health', icon: '💊' },
  { value: 'Other', label: 'Other', icon: '📦' }
];

export default function ExpenseForm({
  onSubmit,
  initialData,
  onCancel,
  currency = 'INR',
  currencySymbol = '₹',
  fromCurrency = 'INR',
  toCurrency = 'AED'
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [expenseCurrency, setExpenseCurrency] = useState(currency || 'INR');
  const [showOtherCurrencies, setShowOtherCurrencies] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setCategory(initialData.category || 'Food');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setNote(initialData.note || '');
      setExpenseCurrency(initialData.currency || currency || 'INR');
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setExpenseCurrency(currency || 'INR');
    }
    setErrors({});
    setStatusMessage(null);
  }, [initialData, currency]);

  const validate = () => {
    const newErrors = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    const amt = Number(amount);
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amt) || amt <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0';
    }

    if (!category) {
      newErrors.category = 'Please choose a category';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await onSubmit({
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        date,
        note: note.trim(),
        currency: expenseCurrency || currency || 'INR'
      });

      if (res && res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setStatusMessage({
          type: 'success',
          text: initialData ? '✓ Changes saved successfully!' : '✓ Expense added successfully!'
        });
        if (!initialData) {
          setTitle('');
          setAmount('');
          setCategory('Food');
          setDate(new Date().toISOString().split('T')[0]);
          setNote('');
          setErrors({});
        }
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error submitting expense: ' + (err.message || 'Unknown error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = Boolean(initialData);
  const currentExpenseCurrInfo = getCurrencyInfo(expenseCurrency);
  const fromInfo = getCurrencyInfo(fromCurrency);
  const toInfo = getCurrencyInfo(toCurrency);

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem' }}>
          {isEdit ? '✏️ Edit Expense' : '＋ New Expense'}
        </h2>
        {isEdit && (
          <span style={{ fontSize: '0.785rem', background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
            Editing #{initialData.id}
          </span>
        )}
      </div>

      {/* Visual Feedback Message */}
      {statusMessage && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '14px',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}
        >
          <span>{statusMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Row 1: Title and Amount with Currency Picker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Title Field */}
          <div className="input-group">
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Morning Coffee, Dubai Metro, Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <div className="error">{errors.title}</div>}
          </div>

          {/* Amount Field with Dual-Travel Currency Switcher */}
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>
                Amount ({currentExpenseCurrInfo.symbol})
              </label>

              {/* Quick Currency Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Spend in:</span>
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--surface-hover)',
                  padding: '2px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  {/* From Currency Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpenseCurrency(fromCurrency);
                      setShowOtherCurrencies(false);
                    }}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: expenseCurrency === fromCurrency && !showOtherCurrencies ? 'var(--primary)' : 'transparent',
                      color: expenseCurrency === fromCurrency && !showOtherCurrencies ? 'var(--primary-text)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Record in ${fromInfo.name} (${fromCurrency})`}
                  >
                    <span>{fromInfo.flag}</span> <span>{fromCurrency}</span>
                  </button>

                  {/* To Currency Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpenseCurrency(toCurrency);
                      setShowOtherCurrencies(false);
                    }}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: expenseCurrency === toCurrency && !showOtherCurrencies ? 'var(--primary)' : 'transparent',
                      color: expenseCurrency === toCurrency && !showOtherCurrencies ? 'var(--primary-text)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Record in ${toInfo.name} (${toCurrency})`}
                  >
                    <span>{toInfo.flag}</span> <span>{toCurrency}</span>
                  </button>

                  {/* Other Currency Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowOtherCurrencies(!showOtherCurrencies)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: (expenseCurrency !== fromCurrency && expenseCurrency !== toCurrency) || showOtherCurrencies ? 'var(--primary)' : 'transparent',
                      color: (expenseCurrency !== fromCurrency && expenseCurrency !== toCurrency) || showOtherCurrencies ? 'var(--primary-text)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Select another currency"
                  >
                    {expenseCurrency !== fromCurrency && expenseCurrency !== toCurrency ? (
                      <span>{currentExpenseCurrInfo.flag} {expenseCurrency}</span>
                    ) : (
                      <span>▼ More</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Other Currencies Compact Dropdown */}
            {showOtherCurrencies && (
              <div style={{ marginBottom: '8px' }}>
                <select
                  value={expenseCurrency}
                  onChange={(e) => {
                    setExpenseCurrency(e.target.value);
                    setShowOtherCurrencies(false);
                  }}
                  className="form-control"
                  style={{
                    fontSize: '0.8rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    borderColor: 'var(--primary)'
                  }}
                >
                  <option value="" disabled>Select currency...</option>
                  {CURRENCIES_LIST.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount input with visible currency prefix */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                {currentExpenseCurrInfo.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ paddingLeft: currentExpenseCurrInfo.symbol.length > 2 ? '48px' : '36px' }}
              />
            </div>
            {errors.amount && <div className="error">{errors.amount}</div>}
          </div>
        </div>

        {/* Row 2: Category and Date */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Category Selector Custom Rounded Dropdown */}
          <div className="input-group">
            <label>Category</label>
            <RoundedSelect
              value={category}
              onChange={(val) => setCategory(val)}
              options={CATEGORIES}
            />
            {errors.category && <div className="error">{errors.category}</div>}
          </div>

          {/* Date Picker */}
          <div className="input-group">
            <label>Date</label>
            <RoundedDatePicker
              value={date}
              onChange={(val) => setDate(val)}
            />
            {errors.date && <div className="error">{errors.date}</div>}
          </div>
        </div>

        {/* Optional Note */}
        <div className="input-group">
          <label>Note <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span></label>
          <textarea
            rows="2"
            className="form-control"
            placeholder="Add any additional details..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: '10px',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Expense')}
          </button>
          {isEdit && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              style={{ height: '42px', borderRadius: '10px', minWidth: '100px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
