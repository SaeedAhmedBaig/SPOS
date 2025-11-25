'use client'

import { useState, useEffect } from 'react'
import WarehouseSelect from './WarehouseSelect'

export default function InventoryListTable({ onAdjustStock, warehouses, onRefresh }) {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState([])

  const itemsPerPage = 10

  useEffect(() => {
    fetchInventory()
    fetchCategories()
  }, [currentPage, selectedWarehouse, selectedCategory, stockStatus])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedWarehouse && { warehouse: selectedWarehouse }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(stockStatus && { status: stockStatus })
      })

      const response = await fetch(`/api/inventory?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInventory(data.items || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleWarehouseChange = (e) => {
    setSelectedWarehouse(e.target.value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (e) => {
    setStockStatus(e.target.value)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchInventory()
    onRefresh?.()
  }

  const getStockStatus = (stock, reorderLevel) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (stock <= reorderLevel) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700"
            />
          </div>

          {/* Warehouse Filter */}
          <div>
            <WarehouseSelect
              value={selectedWarehouse}
              onChange={handleWarehouseChange}
              warehouses={warehouses}
              includeAll={true}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={stockStatus}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
            >
              <option value="">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedWarehouse || selectedCategory || stockStatus) && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-700">Active filters:</span>
            {selectedWarehouse && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                Warehouse: {warehouses.find(w => w.id === selectedWarehouse)?.name}
              </span>
            )}
            {selectedCategory && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                Category: {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
            {stockStatus && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                Status: {stockStatus.replace('_', ' ')}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedWarehouse('')
                setSelectedCategory('')
                setStockStatus('')
              }}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="ml-4 space-y-2">
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : inventory.length > 0 ? (
              inventory.map((item) => {
                const stockStatus = getStockStatus(item.currentStock, item.reorderLevel)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-700">{item.category?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.warehouse?.name || 'Main Warehouse'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.currentStock}</div>
                      <div className="text-xs text-gray-700">Reorder at {item.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.cost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onAdjustStock(item)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Adjust
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        View History
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-gray-900 text-lg font-medium">No products found</div>
                  <div className="text-gray-700 mt-1">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add products to get started'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}