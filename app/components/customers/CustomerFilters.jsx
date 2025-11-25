'use client'

import { useState } from 'react'
import { Search, Filter, Download, Upload, Loader2 } from 'lucide-react'

const DEFAULT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'premium', label: 'Premium' },
]

export default function CustomerFilters({ 
  searchTerm = '', 
  onSearchChange, 
  selectedStatus = 'all', 
  onStatusChange,
  onImport,
  onExport,
  importLoading = false,
  exportLoading = false,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  totalCustomers = 0,
  filteredCount = 0,
  loading = false
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Debounced search to avoid too many API calls
  const handleSearchChange = (value) => {
    setLocalSearchTerm(value)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const newTimeout = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value)
      }
    }, 300) // 300ms debounce

    setSearchTimeout(newTimeout)
  }

  const handleImportClick = async () => {
    if (onImport) {
      try {
        await onImport()
      } catch (error) {
        console.error('Import failed:', error)
      }
    }
  }

  const handleExportClick = async () => {
    if (onExport) {
      try {
        await onExport()
      } catch (error) {
        console.error('Export failed:', error)
      }
    }
  }

  const handleStatusChange = (value) => {
    if (onStatusChange) {
      onStatusChange(value)
    }
  }

  const showFilterStats = totalCustomers > 0 && (searchTerm || selectedStatus !== 'all')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Search customers"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          
          {/* Search stats */}
          {showFilterStats && (
            <div className="mt-2 text-xs text-gray-500">
              Showing {filteredCount} of {totalCustomers} customers
              {(searchTerm || selectedStatus !== 'all') && (
                <button
                  onClick={() => {
                    setLocalSearchTerm('')
                    onSearchChange('')
                    onStatusChange('all')
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] transition-colors"
            aria-label="Filter by customer status"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Import Button */}
          <button 
            onClick={handleImportClick}
            disabled={importLoading || loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] justify-center"
            aria-label="Import customers"
          >
            {importLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {importLoading ? 'Importing...' : 'Import'}
            </span>
          </button>

          {/* Export Button */}
          <button 
            onClick={handleExportClick}
            disabled={exportLoading || loading || totalCustomers === 0}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] justify-center"
            aria-label="Export customers"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {exportLoading ? 'Exporting...' : 'Export'}
            </span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading customers...
        </div>
      )}
    </div>
  )
}