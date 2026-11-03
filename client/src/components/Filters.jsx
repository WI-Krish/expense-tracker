import React from 'react';
import RoundedSelect from './RoundedSelect';
import RoundedDatePicker from './RoundedDatePicker';

const CATEGORIES = [
  { value: 'All', label: 'All Categories', icon: '🌐' },
  { value: 'Food', label: 'Food', icon: '🍔' },
  { value: 'Transport', label: 'Transport', icon: '🚗' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'Bills', label: 'Bills', icon: '📄' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'Health', label: 'Health', icon: '💊' },
  { value: 'Other', label: 'Other', icon: '📦' }
];

export default function Filters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (val) => {
    setFilters((prev) => ({ ...prev, category: val }));
  };

  const hasActiveFilters =
    filters.category !== 'All' || filters.from !== '' || filters.to !== '' || filters.search.trim() !== '';

  const clearAll = () => {
    setFilters({ category: 'All', from: '', to: '', search: '' });
  };

  const activeCount = [
    filters.category !== 'All',
    filters.from !== '',
    filters.to !== '',
    filters.search.trim() !== ''
  ].filter(Boolean).length;

  return (
    <div className="card" style={{ height: '100%', minHeight: '460px', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', minHeight: '28px' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>
            🔍 Search & Filter
          </h2>
          <span style={{
            fontSize: '0.785rem',
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 600,
            visibility: hasActiveFilters ? 'visible' : 'hidden'
          }}>
            {activeCount} Active Filter{activeCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Search Input */}
        <div className="input-group">
          <label>Search Title</label>
          <input
            type="text"
            name="search"
            className="form-control"
            placeholder="Search by expense title or description..."
            value={filters.search}
            onChange={handleChange}
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="input-group">
          <label>Filter by Category</label>
          <RoundedSelect
            value={filters.category}
            onChange={handleCategoryChange}
            options={CATEGORIES}
          />
        </div>

        {/* From Date */}
        <div className="input-group">
          <label>From Date</label>
          <RoundedDatePicker
            value={filters.from}
            onChange={(val) => setFilters((prev) => ({ ...prev, from: val }))}
            placeholder="Select start date"
            allowClear
          />
        </div>

        {/* To Date placed directly under From Date */}
        <div className="input-group">
          <label>To Date</label>
          <RoundedDatePicker
            value={filters.to}
            onChange={(val) => setFilters((prev) => ({ ...prev, to: val }))}
            placeholder="Select end date"
            allowClear
          />
        </div>
      </div>

      {/* Reset Action */}
      <div style={{ marginTop: '12px' }}>
        <button
          type="button"
          className="btn-outline"
          onClick={clearAll}
          disabled={!hasActiveFilters}
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            opacity: hasActiveFilters ? 1 : 0.45,
            cursor: hasActiveFilters ? 'pointer' : 'default'
          }}
        >
          {hasActiveFilters ? '↺ Reset All Filters' : 'No Filters Applied'}
        </button>
      </div>
    </div>
  );
}
