'use client'

import { useState } from 'react'
import WarehouseSelect from './WarehouseSelect'

export default function StockAdjustmentForm({ product, warehouses, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    adjustmentType: 'increase',
    quantity: '',
    reason: '',
    notes: '',
    warehouseId: product?.warehouseId || warehouses[0]?.id || '',
    costPrice: product?.cost || '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        productId: product?.id,
        ...formData,
        quantity: parseInt(formData.quantity),
        costPrice: parseFloat(formData.costPrice) || product?.cost,
        date: new Date(formData.date).toISOString()
      }

      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        throw new Error('Failed to adjust stock')
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      alert('Failed to adjust stock. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const adjustmentReasons = [
    'stock_received',
    'damaged_goods',
    'customer_return',
    'theft_loss',
    'stock_count_adjustment',
    'promotional_display',
    'sample_usage',
    'expired_goods',
    'other'
  ]

  const getReasonLabel = (reason) => {
    const labels = {
      stock_received: 'Stock Received',
      damaged_goods: 'Damaged Goods',
      customer_return: 'Customer Return',
      theft_loss: 'Theft/Loss',
      stock_count_adjustment: 'Stock Count Adjustment',
      promotional_display: 'Promotional Display',
      sample_usage: 'Sample Usage',
      expired_goods: 'Expired Goods',
      other: 'Other'
    }
    return labels[reason] || reason
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Adjust Stock
          </h2>
          {product && (
            <p className="text-gray-700 text-sm mt-1">
              {product.name} • {product.sku}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Adjustment Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Warehouse
            </label>
            <WarehouseSelect
              value={formData.warehouseId}
              onChange={(e) => handleChange('warehouseId', e.target.value)}
              warehouses={warehouses}
            />
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Adjustment Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="increase"
                  checked={formData.adjustmentType === 'increase'}
                  onChange={(e) => handleChange('adjustmentType', e.target.value)}
                  className="mr-2 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-900">Increase Stock</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="decrease"
                  checked={formData.adjustmentType === 'decrease'}
                  onChange={(e) => handleChange('adjustmentType', e.target.value)}
                  className="mr-2 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-900">Decrease Stock</span>
              </label>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700"
              placeholder="Enter quantity"
              min="1"
              required
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Cost Price {!product && '(Optional)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => handleChange('costPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700"
              placeholder="Enter cost price"
              min="0"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Reason
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
              required
            >
              <option value="">Select a reason</option>
              {adjustmentReasons.map(reason => (
                <option key={reason} value={reason}>
                  {getReasonLabel(reason)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Current Stock Display */}
          {product && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-700">
                Current Stock: <span className="font-medium">{product.currentStock}</span>
              </div>
              <div className="text-sm text-gray-700">
                After adjustment: <span className="font-medium">
                  {product.currentStock + (formData.adjustmentType === 'increase' ? parseInt(formData.quantity || 0) : -parseInt(formData.quantity || 0))}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Adjustment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}