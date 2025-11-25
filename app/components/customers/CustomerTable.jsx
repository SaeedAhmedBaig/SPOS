'use client'

import { useState } from 'react'
import { Edit, MoreHorizontal, User, Mail, Phone, Trash2, Loader2 } from 'lucide-react'

export default function CustomerTable({ 
  customers = [], 
  loading = false,
  selectedCustomers = new Set(),
  onEditCustomer,
  onDeleteCustomer,
  onSelectCustomer,
  onSelectAll,
  pagination,
  onPageChange
}) {
  const [localLoading, setLocalLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Add defensive programming to handle missing customer properties
  const safeCustomers = customers.map(customer => ({
    id: customer.id || '',
    name: customer.name || 'Unknown Customer',
    email: customer.email || '',
    phone: customer.phone || '',
    totalOrders: customer.totalOrders || 0,
    totalSpent: customer.totalSpent || 0,
    lastOrder: customer.lastOrder || '',
    status: customer.status || 'inactive',
    ...customer
  }))

  const toggleSelectCustomer = (customerId) => {
    if (onSelectCustomer) {
      onSelectCustomer(customerId);
    }
  }

  const toggleSelectAll = (checked) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'premium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active'
      case 'premium': return 'Premium'
      case 'inactive': return 'Inactive'
      default: return status
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  const handleDeleteClick = async (customerId) => {
    if (!onDeleteCustomer) return
    
    setDeletingId(customerId)
    setLocalLoading(true)
    try {
      await onDeleteCustomer(customerId)
    } finally {
      setLocalLoading(false)
      setDeletingId(null)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedCustomers.size === safeCustomers.length && safeCustomers.length > 0}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              disabled={safeCustomers.length === 0 || localLoading}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black disabled:opacity-50"
            />
            <span className="text-sm text-gray-600">
              {selectedCustomers.size > 0 
                ? `${selectedCustomers.size} selected` 
                : `${safeCustomers.length} customers`
              }
            </span>
          </div>
          
          {/* Pagination Info */}
          {pagination && (
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {/* Checkbox column */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Order
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
            {safeCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.has(customer.id)}
                    onChange={() => toggleSelectCustomer(customer.id)}
                    disabled={localLoading}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black disabled:opacity-50"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {customer.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer.phone || 'No phone'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {customer.totalOrders}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(customer.totalSpent)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(customer.lastOrder)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                    {getStatusLabel(customer.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEditCustomer && onEditCustomer(customer)}
                      disabled={localLoading}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Edit customer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(customer.id)}
                      disabled={localLoading}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete customer"
                    >
                      {deletingId === customer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {safeCustomers.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No customers found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || localLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || localLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}