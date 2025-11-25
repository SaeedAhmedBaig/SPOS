'use client'

import { Search, Filter, Calendar, Download } from 'lucide-react'
import { useState } from 'react'

// Constants (JSX version — no "as const")
export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' }
]

export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' }
]

export default function SalesFilters({
  searchTerm = '',
  onSearchChange,
  selectedStatus = 'all',
  onStatusChange,
  dateRange = 'all',
  onDateRangeChange,
  onExport,
  loading = false,
  disabled = false,
  searchPlaceholder = "Search sales by order ID, customer, or product..."
}) {
  const [isCustomDateRangeOpen, setIsCustomDateRangeOpen] = useState(false)

  // Handle date range change
  const handleDateRangeChange = (value) => {
    if (value === 'custom') {
      setIsCustomDateRangeOpen(true)
      console.log('Custom date range selected - implement date picker')
      return
    }

    setIsCustomDateRangeOpen(false)
    onDateRangeChange(value)
  }

  // Handle export
  const handleExport = async () => {
    if (onExport) {
      try {
        await onExport()
      } catch (error) {
        console.error('Export failed:', error)
      }
    } else {
      console.warn('Export functionality not implemented')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none
              focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-colors duration-200"
            aria-label="Search sales"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={disabled}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
              focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              min-w-[140px] transition-colors duration-200"
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            disabled={disabled}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
              focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              min-w-[140px] transition-colors duration-200"
            aria-label="Filter by date range"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={disabled || loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg
              hover:bg-gray-50 text-gray-900 bg-white disabled:bg-gray-100
              disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label={loading ? 'Exporting sales data...' : 'Export sales data'}
          >
            <Download className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Exporting...' : 'Export'}
          </button>
        </div>

      </div>

      {/* Custom Date Range Picker */}
      {isCustomDateRangeOpen && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                disabled={disabled}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                disabled={disabled}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setIsCustomDateRangeOpen(false)}
              className="mt-6 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800
                transition-colors focus:outline-none focus:ring-2 focus:ring-black
                focus:ring-offset-2"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
