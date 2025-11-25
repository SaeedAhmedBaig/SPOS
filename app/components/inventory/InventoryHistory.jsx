'use client'

import { useState, useEffect } from 'react'
import WarehouseSelect from './WarehouseSelect'

export default function InventoryHistory({ warehouses }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    warehouseId: '',
    productId: '',
    type: '',
    startDate: '',
    endDate: '',
    page: 1
  })
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 10

  useEffect(() => {
    fetchHistory()
  }, [filters])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page,
        limit: itemsPerPage,
        ...(filters.warehouseId && { warehouse: filters.warehouseId }),
        ...(filters.productId && { product: filters.productId }),
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/api/inventory/history?${params}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.items || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const getTypeColor = (type) => {
    const colors = {
      adjustment: 'bg-blue-100 text-blue-800',
      transfer: 'bg-purple-100 text-purple-800',
      sale: 'bg-green-100 text-green-800',
      purchase: 'bg-orange-100 text-orange-800',
      return: 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type) => {
    const labels = {
      adjustment: 'Adjustment',
      transfer: 'Transfer',
      sale: 'Sale',
      purchase: 'Purchase',
      return: 'Return'
    }
    return labels[type] || type
  }

  const getQuantityColor = (quantity, type) => {
    if (type === 'sale' || (type === 'adjustment' && quantity < 0)) {
      return 'text-red-600'
    }
    if (type === 'purchase' || (type === 'adjustment' && quantity > 0)) {
      return 'text-green-600'
    }
    return 'text-gray-900'
  }

  const formatQuantity = (quantity, type) => {
    const sign = quantity > 0 ? '+' : ''
    return `${sign}${quantity}`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Warehouse Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Warehouse
            </label>
            <WarehouseSelect
              value={filters.warehouseId}
              onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
              warehouses={warehouses}
              includeAll={true}
            />
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product ID
            </label>
            <input
              type="text"
              value={filters.productId}
              onChange={(e) => handleFilterChange('productId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700 text-sm"
              placeholder="Enter product ID"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-sm"
            >
              <option value="">All Types</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
              <option value="return">Return</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-sm"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-sm"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(filters.warehouseId || filters.productId || filters.type || filters.startDate || filters.endDate) && (
          <div className="flex items-center space-x-2 text-sm mt-3">
            <span className="text-gray-700">Active filters:</span>
            {filters.warehouseId && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                Warehouse: {warehouses.find(w => w.id === filters.warehouseId)?.name}
              </span>
            )}
            {filters.productId && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                Product: {filters.productId}
              </span>
            )}
            {filters.type && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                Type: {getTypeLabel(filters.type)}
              </span>
            )}
            {filters.startDate && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                From: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                To: {filters.endDate}
              </span>
            )}
            <button
              onClick={() => setFilters({
                warehouseId: '',
                productId: '',
                type: '',
                startDate: '',
                endDate: '',
                page: 1
              })}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : history.length > 0 ? (
              history.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.product?.name}</div>
                    <div className="text-sm text-gray-700">{record.product?.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                      {getTypeLabel(record.type)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getQuantityColor(record.quantity, record.type)}`}>
                    {formatQuantity(record.quantity, record.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.warehouse?.name || 'Main Warehouse'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.reference || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.user?.name || 'System'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-900 text-lg font-medium">No history found</div>
                  <div className="text-gray-700 mt-1">
                    {Object.values(filters).some(f => f) ? 'Try adjusting your filters' : 'Stock movements will appear here'}
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
            Page {filters.page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(filters.page - 1, 1))}
              disabled={filters.page === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handleFilterChange('page', Math.min(filters.page + 1, totalPages))}
              disabled={filters.page === totalPages}
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