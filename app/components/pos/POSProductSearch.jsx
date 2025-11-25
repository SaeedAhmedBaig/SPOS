'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, Barcode, X, Loader, Camera, Scan } from 'lucide-react'

export default function POSProductSearch({ onProductSelect, onSearch, onCategoryChange, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [barcodeMode, setBarcodeMode] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const searchInputRef = useRef(null)
  const barcodeInputRef = useRef(null)
  const debounceRef = useRef(null)

  // Focus search input on mount and when barcode mode is disabled
  useEffect(() => {
    if (!barcodeMode) {
      searchInputRef.current?.focus()
    } else {
      barcodeInputRef.current?.focus()
    }
  }, [barcodeMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl+K or Cmd+K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setBarcodeMode(false)
        searchInputRef.current?.focus()
      }
      // Escape to clear search or close results
      if (event.key === 'Escape') {
        if (showResults) {
          setShowResults(false)
        } else if (searchTerm) {
          setSearchTerm('')
          setSearchResults([])
        }
      }
      // F2 to toggle barcode mode
      if (event.key === 'F2') {
        event.preventDefault()
        setBarcodeMode(!barcodeMode)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [searchTerm, showResults, barcodeMode])

  // Debounced search
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      setIsSearching(true)
      setError(null)

      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data.products || [])
      setShowResults(true)
      
      // Notify parent component about search
      onSearch?.(query)
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [onSearch])

  // Handle search input changes with debounce
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setError(null)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }

  // Handle product selection
  const handleProductSelect = (product) => {
    onProductSelect(product)
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
    setError(null)
    searchInputRef.current?.focus()
  }

  // Handle barcode input
  const handleBarcodeInput = (value) => {
    setBarcodeInput(value)
    
    // Auto-submit when barcode is complete (typically 12-13 digits)
    if (value.length >= 12) {
      handleBarcodeSubmit(value)
    }
  }

  // Handle barcode submission
  const handleBarcodeSubmit = async (barcode = barcodeInput) => {
    if (!barcode.trim()) return

    try {
      setScanning(true)
      setError(null)

      const response = await fetch(`/api/products/barcode/${barcode}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found for this barcode')
        }
        throw new Error(`Barcode search failed: ${response.status}`)
      }

      const product = await response.json()
      
      if (product) {
        handleProductSelect(product)
        setBarcodeInput('')
      } else {
        throw new Error('Product not found')
      }
    } catch (err) {
      console.error('Barcode search error:', err)
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
    setError(null)
    searchInputRef.current?.focus()
  }

  // Toggle barcode mode
  const toggleBarcodeMode = () => {
    setBarcodeMode(!barcodeMode)
    setBarcodeInput('')
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
    setError(null)
  }

  // Simulate barcode scan (for demo purposes)
  const simulateBarcodeScan = () => {
    const demoBarcodes = [
      '123456789012',
      '234567890123',
      '345678901234',
      '456789012345'
    ]
    const randomBarcode = demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)]
    setBarcodeInput(randomBarcode)
    handleBarcodeSubmit(randomBarcode)
  }

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="w-full space-y-2">
      {/* Search/Barcode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleBarcodeMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            barcodeMode
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {barcodeMode ? (
            <>
              <X className="w-4 h-4" />
              Cancel Scan
            </>
          ) : (
            <>
              <Barcode className="w-4 h-4" />
              Scan Barcode
            </>
          )}
        </button>

        {barcodeMode && (
          <button
            onClick={simulateBarcodeScan}
            disabled={scanning}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg border border-green-500 text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Scan className="w-4 h-4" />
            Simulate Scan
          </button>
        )}

        <div className="flex-1"></div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-gray-500 hidden sm:block">
          <kbd className="px-2 py-1 bg-gray-100 rounded border">F2</kbd> {barcodeMode ? 'Search' : 'Scan'} • 
          <kbd className="px-2 py-1 bg-gray-100 rounded border mx-1">Esc</kbd> Clear • 
          <kbd className="px-2 py-1 bg-gray-100 rounded border ml-1">Ctrl+K</kbd> Search
        </div>
      </div>

      {/* Search Input */}
      {!barcodeMode ? (
        <div className="relative" ref={searchInputRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchTerm && setShowResults(true)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-700"
            disabled={loading}
          />

          {/* Loading Indicator */}
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Clear Button */}
          {searchTerm && !isSearching && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Product Image */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <span>SKU: {product.sku}</span>
                        {product.barcode && (
                          <>
                            <span>•</span>
                            <span>Barcode: {product.barcode}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price and Stock */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        ${product.price}
                      </p>
                      <p className={`text-xs ${
                        product.stock > 10 
                          ? 'text-green-600' 
                          : product.stock > 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {product.stock || 0} in stock
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">No products found</p>
              <p className="text-sm text-gray-600">Try a different search term</p>
            </div>
          )}
        </div>
      ) : (
        /* Barcode Input */
        <div className="relative" ref={barcodeInputRef}>
          <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or enter manually..."
            value={barcodeInput}
            onChange={(e) => handleBarcodeInput(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-700 text-center font-mono"
            disabled={scanning}
          />

          {/* Scanning Indicator */}
          {scanning && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Clear Button */}
          {barcodeInput && !scanning && (
            <button
              onClick={() => setBarcodeInput('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <X className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Categories (if provided) */}
      {onCategoryChange && (
        <div className="flex flex-wrap gap-2">
          {['Electronics', 'Accessories', 'Computers', 'Phones'].map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}