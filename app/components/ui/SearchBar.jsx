'use client'

import React, { useState } from 'react';

const SearchBar = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  className = '',
  size = 'medium',
  disabled = false,
  showButton = false,
  buttonText = 'Search',
  autoFocus = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) onChange(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(internalValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showButton) handleSubmit(e);
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">

        {/* Left icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={internalValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={`block w-full pl-10 bg-white text-gray-900 
            placeholder-gray-400 
            border border-gray-200 rounded-xl 
            shadow-sm hover:shadow 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${showButton ? 'pr-28' : 'pr-4'}
          `}
        />

        {/* Right Search Button */}
        {showButton && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              type="submit"
              disabled={disabled}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium 
                bg-black text-white
                hover:bg-gray-800 
                transition-all duration-150
                shadow-sm hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                ${size === 'small' ? 'text-xs px-3 py-1.5' : ''}
              `}
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
