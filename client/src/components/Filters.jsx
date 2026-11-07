import React, { useState, useRef, useEffect, useMemo } from 'react';
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

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Other: '📦'
};

export default function Filters({
  filters,
  setFilters,
  allExpenses = [],
  totalCount = 0,
  filteredCount = 0,
  onClose
}) {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsContainerRef = useRef(null);

  // Build a unique dictionary of past titles and their corresponding category
  const titleCategoryMap = useMemo(() => {
    const map = new Map();
    (allExpenses || []).forEach((exp) => {
      if (!exp.title) return;
      const cleanTitle = exp.title.trim();
      if (!cleanTitle) return;
      const lower = cleanTitle.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, {
          title: cleanTitle,
          category: exp.category || 'Other',
          count: 1,
          lastDate: exp.date || ''
        });
      } else {
        const item = map.get(lower);
        item.count += 1;
        if (exp.date && exp.date >= item.lastDate) {
          item.category = exp.category || item.category;
          item.lastDate = exp.date;
        }
      }
    });
    return Array.from(map.values());
  }, [allExpenses]);

  // Compute suggestions strictly according to the searching word (only when user types!)
  const suggestions = useMemo(() => {
    const query = (filters.search || '').trim().toLowerCase();
    // Do NOT show any already suggested or written options when empty or just opened
    if (!query) {
      return [];
    }

    const results = [];

    // 1. Suggest category filter if searching word matches category name
    CATEGORIES.forEach((cat) => {
      if (cat.value !== 'All' && cat.label.toLowerCase().includes(query)) {
        results.push({
          type: 'category',
          category: cat.value,
          label: cat.label,
          icon: cat.icon
        });
      }
    });

    // 2. Suggest previously added titles matching the searching word (by title or category)
    const matchingTitles = titleCategoryMap.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      return matchTitle || matchCat;
    });

    matchingTitles.sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(query);
      const bStarts = b.title.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return b.count - a.count;
    });

    matchingTitles.slice(0, 6).forEach((item) => {
      results.push({
        type: 'title',
        title: item.title,
        category: item.category,
        count: item.count
      });
    });

    return results;
  }, [titleCategoryMap, filters.search]);

  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When user selects a suggestion: apply according to selected item
  const handleSelectSuggestion = (item) => {
    if (item.type === 'category') {
      setFilters((prev) => ({
        ...prev,
        category: item.category,
        search: ''
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        search: item.title,
        category: item.category
      }));
    }
    setIsSuggestionsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isSuggestionsOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, search: val }));
    // Open suggestions only when user has typed something
    setIsSuggestionsOpen(val.trim().length > 0);
    setHighlightedIndex(-1);
  };

  const handleCategoryChange = (val) => {
    setFilters((prev) => ({ ...prev, category: val }));
  };

  const clearFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'category' ? 'All' : ''
    }));
  };

  const clearAll = () => {
    setFilters({ category: 'All', from: '', to: '', search: '' });
    setIsSuggestionsOpen(false);
  };

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.from !== '' ||
    filters.to !== '' ||
    (filters.search && filters.search.trim() !== '');

  return (
    <div className="filter-dropdown-card">
      {/* Filter Card Top Heading */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>🔍</span>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Search & Filter Transactions
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ({filteredCount} of {totalCount} matching)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="btn-outline"
              style={{
                fontSize: '0.785rem',
                padding: '4px 10px',
                borderRadius: '6px'
              }}
            >
              ↺ Reset All
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{
                fontSize: '0.785rem',
                padding: '4px 10px',
                borderRadius: '6px'
              }}
              title="Close filter panel"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Grid: Search, Category, From Date, To Date */}
      <div className="filter-grid-layout">
        {/* Search Title with Auto-Suggestions according to searching word */}
        <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
          <label>Search Title or Category</label>
          <div style={{ position: 'relative' }}>
            <input
              ref={searchInputRef}
              type="text"
              name="search"
              className="form-control"
              placeholder="Type to search (e.g. Coffee, Food)..."
              value={filters.search}
              onChange={handleSearchChange}
              onFocus={() => {
                if ((filters.search || '').trim().length > 0) {
                  setIsSuggestionsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  clearFilter('search');
                  setIsSuggestionsOpen(false);
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '2px 4px'
                }}
                title="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown - ONLY shown when user types */}
          {isSuggestionsOpen && suggestions.length > 0 && (
            <div
              ref={suggestionsContainerRef}
              className="search-suggestions-dropdown"
              role="listbox"
            >
              <div style={{
                padding: '4px 8px 6px 8px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border)',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>MATCHING SUGGESTIONS</span>
                <span>Click to filter</span>
              </div>
              {suggestions.map((item, idx) => {
                const isHighlighted = idx === highlightedIndex;
                const isCategorySuggestion = item.type === 'category';

                return (
                  <div
                    key={isCategorySuggestion ? `cat-${item.category}` : `title-${item.title}-${item.category}`}
                    role="option"
                    aria-selected={isHighlighted}
                    className={`search-suggestion-item ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.9rem' }}>
                        {isCategorySuggestion ? '🏷️' : '🔍'}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {isCategorySuggestion ? `Category: ${item.label}` : item.title}
                      </span>
                    </div>

                    {/* Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <span
                        className={`badge-pill badge-${item.category || 'Other'}`}
                        style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        <span>{CATEGORY_ICONS[item.category] || '🏷️'}</span>
                        <span>{item.category}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Filter by Category</label>
          <RoundedSelect
            value={filters.category}
            onChange={handleCategoryChange}
            options={CATEGORIES}
          />
        </div>

        {/* From Date */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>From Date</label>
          <RoundedDatePicker
            value={filters.from}
            onChange={(val) => setFilters((prev) => ({ ...prev, from: val }))}
            placeholder="Start date"
            allowClear
          />
        </div>

        {/* To Date */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>To Date</label>
          <RoundedDatePicker
            value={filters.to}
            onChange={(val) => setFilters((prev) => ({ ...prev, to: val }))}
            placeholder="End date"
            allowClear
          />
        </div>
      </div>

      {/* Active Filter Pills Bar (Only shown when filters are active) */}
      {hasActiveFilters && (
        <div style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active:
          </span>

          {filters.search && (
            <span className="filter-pill-tag">
              <span>Title: "<strong>{filters.search}</strong>"</span>
              <button type="button" onClick={() => clearFilter('search')} title="Remove title filter">×</button>
            </span>
          )}

          {filters.category !== 'All' && (
            <span className="filter-pill-tag">
              <span>Category: <strong>{filters.category} {CATEGORY_ICONS[filters.category]}</strong></span>
              <button type="button" onClick={() => clearFilter('category')} title="Reset category to All">×</button>
            </span>
          )}

          {filters.from && (
            <span className="filter-pill-tag">
              <span>From: <strong>{filters.from}</strong></span>
              <button type="button" onClick={() => clearFilter('from')} title="Remove start date">×</button>
            </span>
          )}

          {filters.to && (
            <span className="filter-pill-tag">
              <span>To: <strong>{filters.to}</strong></span>
              <button type="button" onClick={() => clearFilter('to')} title="Remove end date">×</button>
            </span>
          )}

          <button
            type="button"
            onClick={clearAll}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 6px',
              color: 'var(--danger)',
              fontSize: '0.785rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
