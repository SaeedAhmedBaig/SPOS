'use client'

import React, { useState, useRef, useEffect } from 'react';

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  presets = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'This month', months: 0 },
    { label: 'Last month', months: 1 },
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePresetClick = (preset) => {
    const end = new Date();
    const start = new Date();

    if (preset.days !== undefined) {
      start.setDate(end.getDate() - preset.days);
      if (preset.days === 1) {
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
      }
    } else if (preset.months !== undefined) {
      if (preset.months === 0) {
        start.setDate(1);
      } else {
        start.setMonth(end.getMonth() - 1, 1);
        end.setMonth(end.getMonth(), 0);
      }
    }

    const newStartDate = start.toISOString().split('T')[0];
    const newEndDate = end.toISOString().split('T')[0];
    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
    onChange({ startDate: newStartDate, endDate: newEndDate });
    setIsOpen(false);
  };

  const handleApply = () => {
    onChange({ startDate: tempStartDate, endDate: tempEndDate });
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStartDate('');
    setTempEndDate('');
    onChange({ startDate: '', endDate: '' });
    setIsOpen(false);
  };

  const displayValue = startDate && endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : 'Select date range';

  return (
    <div className={`relative ${containerClassName}`} ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex justify-between items-center px-3 py-2 border rounded-md text-sm
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500'}
          bg-white text-gray-900
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'hover:border-gray-400'}
          ${className}`}
      >
        <span className={`truncate ${!startDate ? 'text-gray-400' : ''}`}>{displayValue}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-lg p-4">
          {/* Presets */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Quick Select</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className="text-xs py-1 px-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 transition"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-800 transition"
            >
              Apply
            </button>
          </div>

          {helperText && !error && <p className="text-xs text-gray-400 mt-2">{helperText}</p>}
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
