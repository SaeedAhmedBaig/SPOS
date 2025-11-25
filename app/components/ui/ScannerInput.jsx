'use client'

import React, { useState, useRef } from 'react'

const ScannerInput = ({
  value = '',
  onChange,
  onScan,
  placeholder = 'Scan barcode or enter manually',
  disabled = false,
  className = '',
  size = 'medium',
  showScannerButton = true,
}) => {
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef(null)

  const handleChange = (e) => {
    onChange?.(e.target.value)
  }

  const handleScannerClick = () => {
    setIsScanning(true)

    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Simulated scan (remove in production)
    setTimeout(() => {
      if (isScanning && onScan) {
        onScan('1234567890123')
      }
      setIsScanning(false)
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault()
      onScan?.(value.trim())
    }
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pr-12 border border-gray-300 rounded-lg bg-white
            placeholder-gray-500 text-gray-900 transition-all duration-200
            focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
            ${sizeClasses[size]}
          `.trim()}
        />

        {showScannerButton && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              type="button"
              onClick={handleScannerClick}
              disabled={disabled || isScanning}
              className={`
                inline-flex items-center px-3 py-1 border border-gray-300 text-sm
                font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                ${isScanning ? 'bg-gray-100' : ''}
              `}
            >
              {isScanning ? (
                <svg
                  className="animate-spin h-4 w-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 
                    1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="
                      M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01
                      M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1
                      0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1
                      1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z
                    "
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {isScanning && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 text-blue-600 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="
                  M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01
                  M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1
                  0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1
                  1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z
                "
              />
            </svg>
            <span>Ready to scan... Point barcode scanner at the target</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScannerInput
