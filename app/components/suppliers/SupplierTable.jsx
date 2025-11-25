'use client'

import { useState } from 'react'
import { Edit, MoreHorizontal, Building, Phone, Mail, Trash2, Loader2 } from 'lucide-react'

export default function SupplierTable({ 
  suppliers = [], 
  loading = false,
  selectedSuppliers = new Set(),
  onEditSupplier,
  onDeleteSupplier,
  onSelectSupplier,
  onSelectAll,
  pagination,
  onPageChange
}) {
  const [localLoading, setLocalLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Add defensive programming to handle missing supplier properties
  const safeSuppliers = suppliers.map(supplier => ({
    id: supplier.id || '',
    name: supplier.name || 'Unknown Supplier',
    contactPerson: supplier.contactPerson || '',
    email: supplier.email || '',
    phone: supplier.phone || '',
    productsSupplied: Array.isArray(supplier.productsSupplied) ? supplier.productsSupplied : [],
    totalOrders: supplier.totalOrders || 0,
    lastDelivery: supplier.lastDelivery || '',
    status: supplier.status || 'inactive',
    paymentTerms: supplier.paymentTerms || 'Net 30',
    address: supplier.address || '',
    city: supplier.city || '',
    state: supplier.state || '',
    zipCode: supplier.zipCode || '',
    country: supplier.country || '',
    ...supplier
  }))

  const toggleSelectSupplier = (supplierId) => {
    if (onSelectSupplier) {
      onSelectSupplier(supplierId);
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
      case 'preferred': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active'
      case 'preferred': return 'Preferred'
      case 'inactive': return 'Inactive'
      default: return status
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  const handleDeleteClick = async (supplierId) => {
    if (!onDeleteSupplier) return
    
    setDeletingId(supplierId)
    setLocalLoading(true)
    try {
      await onDeleteSupplier(supplierId)
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
          <p className="text-gray-500 mt-2">Loading suppliers...</p>
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
              checked={selectedSuppliers.size === safeSuppliers.length && safeSuppliers.length > 0}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              disabled={safeSuppliers.length === 0 || localLoading}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black disabled:opacity-50"
            />
            <span className="text-sm text-gray-600">
              {selectedSuppliers.size > 0 
                ? `${selectedSuppliers.size} selected` 
                : `${safeSuppliers.length} suppliers`
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
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products Supplied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Delivery
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Terms
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
            {safeSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.has(supplier.id)}
                    onChange={() => toggleSelectSupplier(supplier.id)}
                    disabled={localLoading}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black disabled:opacity-50"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {supplier.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {supplier.contactPerson || 'No contact'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{supplier.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{supplier.phone || 'No phone'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {supplier.productsSupplied.slice(0, 2).map((product, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-[80px]"
                        title={product}
                      >
                        {product}
                      </span>
                    ))}
                    {supplier.productsSupplied.length > 2 && (
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        title={supplier.productsSupplied.slice(2).join(', ')}
                      >
                        +{supplier.productsSupplied.length - 2} more
                      </span>
                    )}
                    {supplier.productsSupplied.length === 0 && (
                      <span className="text-xs text-gray-400 italic">No products</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {supplier.totalOrders}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(supplier.lastDelivery)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {supplier.paymentTerms}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(supplier.status)}`}>
                    {getStatusLabel(supplier.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEditSupplier && onEditSupplier(supplier)}
                      disabled={localLoading}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Edit supplier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(supplier.id)}
                      disabled={localLoading}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete supplier"
                    >
                      {deletingId === supplier.id ? (
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
      {safeSuppliers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No suppliers found</p>
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