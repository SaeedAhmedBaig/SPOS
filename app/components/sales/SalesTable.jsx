'use client'

import { useState, useMemo } from 'react'
import { Eye, MoreHorizontal, User, CreditCard } from 'lucide-react'

// Types
const ORDER_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
}

const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  CASH: 'Cash',
  MOBILE_PAY: 'Mobile Pay'
}

// Type definitions (in real app, these would be in separate types file)
/**
 * @typedef {Object} Product
 * @property {string} name
 * @property {number} quantity
 * @property {number} price
 */

/**
 * @typedef {Object} Sale
 * @property {string} id
 * @property {string} customer
 * @property {string} customerEmail
 * @property {number} items
 * @property {number} total
 * @property {string} paymentMethod
 * @property {'completed' | 'pending' | 'refunded' | 'cancelled'} status
 * @property {string} date
 * @property {Product[]} products
 */

/**
 * @typedef {Object} SalesTableProps
 * @property {string} searchTerm
 * @property {string} selectedStatus
 * @property {string} dateRange
 * @property {Sale[]} [sales] - Sales data from API
 * @property {boolean} [loading] - Loading state
 * @property {string} [error] - Error message
 * @property {function} [onSaleSelect] - Callback when sale is selected
 * @property {function} [onViewDetails] - Callback when view details is clicked
 */

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

const getStatusConfig = (status) => {
  const statusConfig = {
    [ORDER_STATUS.COMPLETED]: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    [ORDER_STATUS.PENDING]: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    [ORDER_STATUS.REFUNDED]: {
      label: 'Refunded',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    [ORDER_STATUS.CANCELLED]: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  return statusConfig[status] || statusConfig[ORDER_STATUS.CANCELLED]
}

const getPaymentIcon = (method) => {
  const paymentIcons = {
    [PAYMENT_METHODS.CREDIT_CARD]: <CreditCard className="w-4 h-4" />,
    [PAYMENT_METHODS.CASH]: <span className="text-lg" role="img" aria-label="Cash">💵</span>,
    [PAYMENT_METHODS.MOBILE_PAY]: <span className="text-lg" role="img" aria-label="Mobile Pay">📱</span>
  }
  
  return paymentIcons[method] || <CreditCard className="w-4 h-4" />
}

// Sub-components for better organization
const TableHeader = ({ selectedCount, totalCount, onSelectAll, isAllSelected }) => (
  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2 focus:ring-offset-2"
          aria-label={isAllSelected ? 'Deselect all sales' : 'Select all sales'}
        />
        <span className="text-sm text-gray-600">
          {selectedCount > 0 
            ? `${selectedCount} ${selectedCount === 1 ? 'sale' : 'sales'} selected` 
            : `${totalCount} ${totalCount === 1 ? 'sale' : 'sales'}`
          }
        </span>
      </div>
    </div>
  </div>
)

const SaleRow = ({ 
  sale, 
  isSelected, 
  onSelect, 
  onViewDetails,
  onMoreActions 
}) => {
  const statusConfig = getStatusConfig(sale.status)
  const { date, time } = formatDate(sale.date)
  
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(sale.id)}
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2 focus:ring-offset-2"
            aria-label={`Select order ${sale.id}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {sale.id}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {sale.customer}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {sale.customerEmail}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {sale.items} {sale.items === 1 ? 'item' : 'items'}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {formatCurrency(sale.total)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {getPaymentIcon(sale.paymentMethod)}
          <span className="text-sm text-gray-900">{sale.paymentMethod}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {date} at {time}
      </td>
      <td className="px-6 py-4">
        <span 
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => onViewDetails(sale)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            aria-label={`View details for order ${sale.id}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onMoreActions(sale)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            aria-label={`More actions for order ${sale.id}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

const LoadingState = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, index) => (
      <tr key={index} className="border-b border-gray-200">
        {[...Array(8)].map((_, cellIndex) => (
          <td key={cellIndex} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded"></div>
          </td>
        ))}
      </tr>
    ))}
  </div>
)

const EmptyState = () => (
  <tr>
    <td colSpan="8" className="px-6 py-12 text-center">
      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">No sales found</p>
      <p className="text-sm text-gray-400 mt-1">
        Try adjusting your search or filters
      </p>
    </td>
  </tr>
)

const ErrorState = ({ message }) => (
  <tr>
    <td colSpan="8" className="px-6 py-12 text-center">
      <div className="text-red-600">
        <CreditCard className="w-12 h-12 mx-auto mb-4" />
        <p>Failed to load sales data</p>
        <p className="text-sm text-red-500 mt-1">{message}</p>
      </div>
    </td>
  </tr>
)

// Main component
/**
 * SalesTable component for displaying and managing sales data
 * @param {SalesTableProps} props
 */
export default function SalesTable({ 
  searchTerm = '', 
  selectedStatus = 'all', 
  dateRange = 'all',
  sales = [],
  loading = false,
  error = null,
  onSaleSelect,
  onViewDetails,
  onMoreActions 
}) {
  const [selectedSales, setSelectedSales] = useState([])

  // Filter sales based on search, status, and date range
  const filteredSales = useMemo(() => {
    if (!sales || sales.length === 0) return []

    return sales.filter(sale => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        sale.id.toLowerCase().includes(searchLower) ||
        sale.customer.toLowerCase().includes(searchLower) ||
        sale.customerEmail.toLowerCase().includes(searchLower) ||
        sale.products?.some(product => 
          product.name.toLowerCase().includes(searchLower)
        ) ||
        false
      
      const matchesStatus = selectedStatus === 'all' || sale.status === selectedStatus
      
      // TODO: Implement proper date range filtering based on your dateRange format
      const matchesDateRange = dateRange === 'all' || true
      
      return matchesSearch && matchesStatus && matchesDateRange
    })
  }, [sales, searchTerm, selectedStatus, dateRange])

  const toggleSelectSale = (saleId) => {
    const newSelectedSales = selectedSales.includes(saleId)
      ? selectedSales.filter(id => id !== saleId)
      : [...selectedSales, saleId]
    
    setSelectedSales(newSelectedSales)
    onSaleSelect?.(newSelectedSales)
  }

  const toggleSelectAll = () => {
    const newSelectedSales = selectedSales.length === filteredSales.length
      ? []
      : filteredSales.map(s => s.id)
    
    setSelectedSales(newSelectedSales)
    onSaleSelect?.(newSelectedSales)
  }

  const handleViewDetails = (sale) => {
    onViewDetails?.(sale)
  }

  const handleMoreActions = (sale) => {
    onMoreActions?.(sale)
  }

  const isAllSelected = filteredSales.length > 0 && selectedSales.length === filteredSales.length

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <TableHeader
        selectedCount={selectedSales.length}
        totalCount={filteredSales.length}
        onSelectAll={toggleSelectAll}
        isAllSelected={isAllSelected}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : filteredSales.length === 0 ? (
              <EmptyState />
            ) : (
              filteredSales.map((sale) => (
                <SaleRow
                  key={sale.id}
                  sale={sale}
                  isSelected={selectedSales.includes(sale.id)}
                  onSelect={toggleSelectSale}
                  onViewDetails={handleViewDetails}
                  onMoreActions={handleMoreActions}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}