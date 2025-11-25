'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, AlertCircle, Loader2 } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'premium', label: 'Premium' },
  { value: 'inactive', label: 'Inactive' },
]

const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: '',
  status: 'active'
}

// Validation schema
const validateForm = (formData) => {
  const errors = {}

  if (!formData.name?.trim()) {
    errors.name = 'Full name is required'
  } else if (formData.name.length < 2) {
    errors.name = 'Full name must be at least 2 characters'
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email address is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
    errors.zipCode = 'Please enter a valid ZIP code'
  }

  return errors
}

export default function CustomerModal({ isOpen, onClose, customer, onSave }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const isEditing = !!customer

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          zipCode: customer.zipCode || '',
          notes: customer.notes || '',
          status: customer.status || 'active'
        })
      } else {
        setFormData(INITIAL_FORM_DATA)
      }
      setErrors({})
      setTouched({})
    }
  }, [isOpen, customer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)

    // Validate form
    const formErrors = validateForm(formData)
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    try {
      const customerData = {
        ...formData,
        // Clean up empty strings for optional fields
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        notes: formData.notes || undefined,
      }

      if (onSave) {
        await onSave(customerData, isEditing ? customer.id : null)
      }

      handleClose()
    } catch (error) {
      console.error('Error saving customer:', error)
      setErrors({ submit: error.message || 'Failed to save customer' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Validate individual field on blur
    const fieldErrors = validateForm({ [name]: formData[name] })
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name]
    }))
  }

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
    setTouched({})
    onClose()
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : ''
  }

  const formatPhoneNumber = (value) => {
    // Simple phone formatting for US numbers
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handlePhoneChange = (e) => {
    const { value } = e.target
    const formattedValue = formatPhoneNumber(value)
    setFormData(prev => ({
      ...prev,
      phone: formattedValue
    }))

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable area */}
        <form id="customer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Global Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      getFieldError('name') ? 'border-red-300 focus:ring-red-500' : ''
                    } ${isLoading ? 'opacity-50' : ''}`}
                    placeholder="John Smith"
                  />
                  {getFieldError('name') && (
                    <p className="text-red-600 text-xs mt-1">{getFieldError('name')}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      getFieldError('email') ? 'border-red-300 focus:ring-red-500' : ''
                    } ${isLoading ? 'opacity-50' : ''}`}
                    placeholder="john@example.com"
                  />
                  {getFieldError('email') && (
                    <p className="text-red-600 text-xs mt-1">{getFieldError('email')}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      getFieldError('phone') ? 'border-red-300 focus:ring-red-500' : ''
                    } ${isLoading ? 'opacity-50' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {getFieldError('phone') && (
                    <p className="text-red-600 text-xs mt-1">{getFieldError('phone')}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      isLoading ? 'opacity-50' : ''
                    }`}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Address Information</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      isLoading ? 'opacity-50' : ''
                    }`}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        isLoading ? 'opacity-50' : ''
                      }`}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        isLoading ? 'opacity-50' : ''
                      }`}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        getFieldError('zipCode') ? 'border-red-300 focus:ring-red-500' : ''
                      } ${isLoading ? 'opacity-50' : ''}`}
                      placeholder="10001"
                    />
                    {getFieldError('zipCode') && (
                      <p className="text-red-600 text-xs mt-1">{getFieldError('zipCode')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                disabled={isLoading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                  isLoading ? 'opacity-50' : ''
                }`}
                placeholder="Any additional notes about this customer..."
              />
            </div>
          </div>
        </form>

        {/* Actions - Fixed at bottom */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Customer' : 'Create Customer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}