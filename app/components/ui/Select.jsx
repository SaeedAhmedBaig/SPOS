import React, { useState, useRef, useEffect } from 'react';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  searchable = false,
  className = '',
  containerClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`space-y-2 ${containerClassName}`} ref={selectRef}>
      
      {label && (
        <label className="block text-sm font-medium text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* BUTTON */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-full cursor-pointer rounded-xl border border-gray-200 
            bg-white py-2.5 pl-3 pr-10 text-left text-[15px]
            shadow-sm hover:bg-gray-50 
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-gray-300
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
            ${error ? 'border-red-400 focus:ring-red-300' : ''}
            ${className}
          `}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-800'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* Chevron */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg 
              className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.24 3.98a.75.75 0 01-1.04 0L5.25 8.27a.75.75 0 01-.02-1.06z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
        </button>

        {/* DROPDOWN */}
        {isOpen && (
          <div className="
            absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl 
            border border-gray-200 bg-white py-1 shadow-lg
            ring-1 ring-black/5
          ">
            {/* SEARCH */}
            {searchable && (
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <input
                  type="text"
                  className="
                    w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 
                    text-sm text-gray-800 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-gray-300
                  "
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* NO OPTIONS */}
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-4 text-gray-500 text-sm text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    cursor-pointer px-3 py-2 rounded-lg mx-1
                    text-sm 
                    ${
                      option.value === value
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-800 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}

    </div>
  );
};

export default Select;
