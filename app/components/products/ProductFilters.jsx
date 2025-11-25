'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  X, 
  SlidersHorizontal,
  Plus,
  Loader,
  AlertCircle
} from 'lucide-react'

export default function ProductFilters({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  onExport,
  onImport,
  onAddProduct,
  loading = false,
  categories = [],
  totalProducts = 0,
  filteredCount = 0
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: { min: '', max: '' },
    stockStatus: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState(null)

  // Default categories if none provided
  const defaultCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'computers', label: 'Computers' },
    { value: 'audio', label: 'Audio' },
    { value: 'wearables', label: 'Wearables' },
    { value: 'accessories', label: 'Accessories' },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  // Apply advanced filters with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showAdvancedFilters) {
        // Notify parent component about advanced filters
        // In a real app, you would pass these to the parent
        console.log('Advanced filters:', advancedFilters)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [advancedFilters, showAdvancedFilters])

  const handleExport = useCallback(async () => {
    try {
      setExportLoading(true)
      setError(null)
      await onExport?.(advancedFilters)
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message || 'Failed to export products')
    } finally {
      setExportLoading(false)
    }
  }, [onExport, advancedFilters])

  const handleImport = useCallback(async () => {
    try {
      setImportLoading(true)
      setError(null)
      await onImport?.()
    } catch (err) {
      console.error('Import error:', err)
      setError(err.message || 'Failed to import products')
    } finally {
      setImportLoading(false)
    }
  }, [onImport])

  const handleAddProduct = useCallback(() => {
    onAddProduct?.()
  }, [onAddProduct])

  const handleClearFilters = useCallback(() => {
    onSearchChange?.('')
    onCategoryChange?.('all')
    setAdvancedFilters({
      priceRange: { min: '', max: '' },
      stockStatus: '',
      status: '',
      sortBy: 'name',
      sortOrder: 'asc'
    })
    setShowAdvancedFilters(false)
    setError(null)
  }, [onSearchChange, onCategoryChange])

  const handleAdvancedFilterChange = (filter, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filter]: value
    }))
  }

  const handlePriceRangeChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value
      }
    }))
  }

  const hasActiveFilters = searchTerm || 
    (selectedCategory && selectedCategory !== 'all') || 
    advancedFilters.priceRange.min || 
    advancedFilters.priceRange.max || 
    advancedFilters.stockStatus || 
    advancedFilters.status

  const getFilterSummary = () => {
    const activeFilters = []
    
    if (searchTerm) activeFilters.push(`Search: "${searchTerm}"`)
    if (selectedCategory && selectedCategory !== 'all') {
      const category = displayCategories.find(cat => cat.value === selectedCategory)
      activeFilters.push(`Category: ${category?.label}`)
    }
    if (advancedFilters.priceRange.min || advancedFilters.priceRange.max) {
      activeFilters.push('Price range')
    }
    if (advancedFilters.stockStatus) {
      activeFilters.push('Stock filter')
    }
    if (advancedFilters.status) {
      activeFilters.push('Status filter')
    }

    return activeFilters
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Main Filters Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700"
              disabled={loading}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 min-w-40"
              disabled={loading}
            >
              {displayCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Advanced Filters Toggle */}
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                showAdvancedFilters
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Add Product */}
            <button 
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>

            {/* Import/Export */}
            <button 
              onClick={handleImport}
              disabled={importLoading || loading}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors"
            >
              {importLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Import</span>
            </button>

            <button 
              onClick={handleExport}
              disabled={exportLoading || loading}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors"
            >
              {exportLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Results Count and Active Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
          <div className="text-sm text-gray-700">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Loading products...
              </div>
            ) : (
              <>
                Showing <span className="font-semibold">{filteredCount}</span> of{' '}
                <span className="font-semibold">{totalProducts}</span> products
              </>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-700">Active filters:</span>
              {getFilterSummary().map((filter, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {filter}
                </span>
              ))}
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={advancedFilters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={advancedFilters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select
                value={advancedFilters.stockStatus}
                onChange={(e) => handleAdvancedFilterChange('stockStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
              >
                <option value="">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Product Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Status
              </label>
              <select
                value={advancedFilters.status}
                onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={advancedFilters.sortBy}
                onChange={(e) => handleAdvancedFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
                <option value="created">Date Added</option>
                <option value="updated">Last Updated</option>
              </select>
            </div>
          </div>

          {/* Sort Order */}
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="asc"
                checked={advancedFilters.sortOrder === 'asc'}
                onChange={(e) => handleAdvancedFilterChange('sortOrder', e.target.value)}
                className="text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">Ascending</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="desc"
                checked={advancedFilters.sortOrder === 'desc'}
                onChange={(e) => handleAdvancedFilterChange('sortOrder', e.target.value)}
                className="text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">Descending</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}