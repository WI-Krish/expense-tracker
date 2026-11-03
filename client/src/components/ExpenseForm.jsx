import React, { useState, useEffect } from 'react';
import RoundedSelect from './RoundedSelect';
import RoundedDatePicker from './RoundedDatePicker';

const CATEGORIES = [
  { value: 'Food', label: 'Food', icon: '🍔' },
  { value: 'Transport', label: 'Transport', icon: '🚗' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'Bills', label: 'Bills', icon: '📄' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'Health', label: 'Health', icon: '💊' },
  { value: 'Other', label: 'Other', icon: '📦' }
];

export default function ExpenseForm({ onSubmit, initialData, onCancel, currencySymbol = '₹' }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
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
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setErrors({});
    setStatusMessage(null);
  }, [initialData]);

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
        note: note.trim()
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

  return (
    <div className="card" style={{ height: '100%', minHeight: '460px', marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
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
        {/* Title Field */}
        <div className="input-group">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Morning Coffee, Uber ride"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <div className="error">{errors.title}</div>}
        </div>

        {/* Amount & Date side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="input-group">
            <label>Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {errors.amount && <div className="error">{errors.amount}</div>}
          </div>

          <div className="input-group">
            <label>Date</label>
            <RoundedDatePicker
              value={date}
              onChange={(val) => setDate(val)}
            />
            {errors.date && <div className="error">{errors.date}</div>}
          </div>
        </div>

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
              style={{ height: '42px', borderRadius: '10px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
