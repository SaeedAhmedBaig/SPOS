'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Package, Search, Filter, Loader, AlertCircle, RefreshCw } from 'lucide-react'
import ProductImage from '../ui/ProductImage'

export default function POSProductGrid({ products, onProductSelect, loading = false }) {
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [categories, setCategories] = useState([])
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [error, setError] = useState(null)

  // Filter and sort products
  useEffect(() => {
    if (!products || !Array.isArray(products)) {
      setFilteredProducts([])
      return
    }

    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.includes(query) ||
        product.category?.name?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category?.id === selectedCategory || 
        product.category?.name === selectedCategory
      )
    }

    // Out of stock filter
    if (!showOutOfStock) {
      filtered = filtered.filter(product => 
        product.stock === undefined || product.stock > 0
      )
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'price-low':
          return (a.price || 0) - (b.price || 0)
        case 'price-high':
          return (b.price || 0) - (a.price || 0)
        case 'stock':
          return (b.stock || 0) - (a.stock || 0)
        case 'sku':
          return (a.sku || '').localeCompare(b.sku || '')
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, sortBy, showOutOfStock])

  // Extract categories from products
  useEffect(() => {
    if (products && Array.isArray(products)) {
      const uniqueCategories = []
      const categoryMap = new Map()
      
      products.forEach(product => {
        if (product.category) {
          const categoryId = product.category.id || product.category
          const categoryName = product.category.name || product.category
          
          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, true)
            uniqueCategories.push({
              id: categoryId,
              name: categoryName
            })
          }
        }
      })
      
      setCategories(uniqueCategories)
    }
  }, [products])

  const handleProductSelect = useCallback((product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      setError(`"${product.name}" is out of stock`)
      return
    }
    
    if (product.status === 'inactive') {
      setError(`"${product.name}" is not available for sale`)
      return
    }

    onProductSelect(product)
  }, [onProductSelect])

  const getStockStatus = (stock) => {
    if (stock === undefined || stock === null) return 'unknown'
    if (stock === 0) return 'out-of-stock'
    if (stock <= 5) return 'low'
    if (stock <= 15) return 'medium'
    return 'high'
  }

  const getStockColor = (status) => {
    switch (status) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-orange-100 text-orange-800'
      case 'out-of-stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockText = (stock, status) => {
    if (status === 'unknown') return 'Stock N/A'
    if (status === 'out-of-stock') return 'Out of stock'
    return `${stock} left`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('name')
    setShowOutOfStock(false)
    setError(null)
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load products</h3>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Filters Bar */}
      <div className="border-b border-gray-200 bg-white p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-700"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock">Stock Level</option>
            <option value="sku">SKU</option>
          </select>

          {/* Out of Stock Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showOutOfStock}
              onChange={(e) => setShowOutOfStock(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show out of stock
          </label>

          {/* Active Filters Badge */}
          {(searchQuery || selectedCategory || sortBy !== 'name' || showOutOfStock) && (
            <button
              onClick={handleClearFilters}
              className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>
            {loading ? 'Loading products...' : `${filteredProducts.length} products found`}
          </span>
          {searchQuery && (
            <span className="text-gray-500">
              Search: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock)
              const isOutOfStock = stockStatus === 'out-of-stock'
              const isInactive = product.status === 'inactive'
              const isDisabled = isOutOfStock || isInactive

              return (
                <button
                  key={product.id}
                  onClick={() => !isDisabled && handleProductSelect(product)}
                  disabled={isDisabled}
                  className={`bg-white rounded-xl border p-4 text-left transition-all duration-200 group relative ${
                    isDisabled
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-105 cursor-pointer'
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                      showIcon={true}
                    />
                    
                    {/* Quick Add Button */}
                    {!isDisabled && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Status Badge */}
                    {isOutOfStock && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}
                    {isInactive && (
                      <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                        Inactive
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col h-full">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        SKU: {product.sku}
                      </p>
                      {product.barcode && (
                        <p className="text-xs text-gray-500 truncate">
                          Barcode: {product.barcode}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStockColor(stockStatus)}`}>
                        {getStockText(product.stock, stockStatus)}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Package className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-700 mb-4 text-center">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filters' 
                : 'No products available in your inventory'
              }
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={handleClearFilters}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}