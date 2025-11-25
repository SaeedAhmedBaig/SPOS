'use client'

import { useState, useEffect } from 'react'
import { X, Save, Building, AlertCircle, Loader2, Plus, Minus } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'inactive', label: 'Inactive' },
]

const PAYMENT_TERM_OPTIONS = [
  { value: 'Net 15', label: 'Net 15' },
  { value: 'Net 30', label: 'Net 30' },
  { value: 'Net 45', label: 'Net 45' },
  { value: 'Net 60', label: 'Net 60' },
  { value: 'Due on Receipt', label: 'Due on Receipt' },
]

const INITIAL_FORM_DATA = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  productsSupplied: [],
  paymentTerms: 'Net 30',
  notes: '',
  status: 'active'
}

// Validation schema
const validateForm = (formData) => {
  const errors = {}

  if (!formData.name?.trim()) {
    errors.name = 'Company name is required'
  } else if (formData.name.length < 2) {
    errors.name = 'Company name must be at least 2 characters'
  }

  if (!formData.contactPerson?.trim()) {
    errors.contactPerson = 'Contact person is required'
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

export default function SupplierModal({ isOpen, onClose, supplier, onSave }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState({})
  const [currentProduct, setCurrentProduct] = useState('')

  const isEditing = !!supplier

  // Reset form when modal opens/closes or supplier changes
  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          city: supplier.city || '',
          state: supplier.state || '',
          zipCode: supplier.zipCode || '',
          country: supplier.country || 'US',
          productsSupplied: Array.isArray(supplier.productsSupplied) ? supplier.productsSupplied : [],
          paymentTerms: supplier.paymentTerms || 'Net 30',
          notes: supplier.notes || '',
          status: supplier.status || 'active'
        })
      } else {
        setFormData(INITIAL_FORM_DATA)
      }
      setErrors({})
      setTouched({})
      setCurrentProduct('')
    }
  }, [isOpen, supplier])

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
      const supplierData = {
        ...formData,
        // Clean up empty strings for optional fields
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        country: formData.country || undefined,
        notes: formData.notes || undefined,
      }

      if (onSave) {
        await onSave(supplierData, isEditing ? supplier.id : null)
      }

      handleClose()
    } catch (error) {
      console.error('Error saving supplier:', error)
      setErrors({ submit: error.message || 'Failed to save supplier' })
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

  const handleAddProduct = () => {
    const product = currentProduct.trim()
    if (product && !formData.productsSupplied.includes(product)) {
      setFormData(prev => ({
        ...prev,
        productsSupplied: [...prev.productsSupplied, product]
      }))
      setCurrentProduct('')
    }
  }

  const handleRemoveProduct = (productToRemove) => {
    setFormData(prev => ({
      ...prev,
      productsSupplied: prev.productsSupplied.filter(product => product !== productToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddProduct()
    }
  }

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
    setTouched({})
    setCurrentProduct('')
    onClose()
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : ''
  }

  const formatPhoneNumber = (value) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form - Scrollable area */}
        <form id="supplier-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            {/* Global Error */}
            {errors.submit && (
              <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs">
                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Basic Information - Single column for better space usage */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 gap-1.5">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-0.5">
                    Company Name *
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
                    className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                      getFieldError('name') ? 'border-red-300 focus:ring-red-500' : ''
                    } ${isLoading ? 'opacity-50' : ''}`}
                    placeholder="Apple Inc."
                  />
                  {getFieldError('name') && (
                    <p className="text-red-600 text-xs mt-0.5">{getFieldError('name')}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-xs font-medium text-gray-700 mb-0.5">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={isLoading}
                    className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                      getFieldError('contactPerson') ? 'border-red-300 focus:ring-red-500' : ''
                    } ${isLoading ? 'opacity-50' : ''}`}
                    placeholder="John Supplier"
                  />
                  {getFieldError('contactPerson') && (
                    <p className="text-red-600 text-xs mt-0.5">{getFieldError('contactPerson')}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-0.5">
                      Email *
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
                      className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                        getFieldError('email') ? 'border-red-300 focus:ring-red-500' : ''
                      } ${isLoading ? 'opacity-50' : ''}`}
                      placeholder="supplier@company.com"
                    />
                    {getFieldError('email') && (
                      <p className="text-red-600 text-xs mt-0.5">{getFieldError('email')}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-0.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                        getFieldError('phone') ? 'border-red-300 focus:ring-red-500' : ''
                      } ${isLoading ? 'opacity-50' : ''}`}
                      placeholder="(555) 123-4567"
                    />
                    {getFieldError('phone') && (
                      <p className="text-red-600 text-xs mt-0.5">{getFieldError('phone')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Supplied */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-900">Products Supplied</h3>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={currentProduct}
                    onChange={(e) => setCurrentProduct(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    placeholder="Enter product name"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={isLoading || !currentProduct.trim()}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 min-h-[28px]">
                  {formData.productsSupplied.map((product, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {product}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {formData.productsSupplied.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No products added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-900">Address Information</h3>
              <div className="space-y-1.5">
                <div>
                  <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-0.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                      isLoading ? 'opacity-50' : ''
                    }`}
                    placeholder="123 Business Ave"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <div className="col-span-2">
                    <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-0.5">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                        isLoading ? 'opacity-50' : ''
                      }`}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-0.5">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                        isLoading ? 'opacity-50' : ''
                      }`}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-xs font-medium text-gray-700 mb-0.5">
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
                      className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                        getFieldError('zipCode') ? 'border-red-300 focus:ring-red-500' : ''
                      } ${isLoading ? 'opacity-50' : ''}`}
                      placeholder="10001"
                    />
                    {getFieldError('zipCode') && (
                      <p className="text-red-600 text-xs mt-0.5">{getFieldError('zipCode')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Terms */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="paymentTerms" className="block text-xs font-medium text-gray-700 mb-0.5">
                  Payment Terms
                </label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                >
                  {PAYMENT_TERM_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-0.5">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
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

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-medium text-gray-700 mb-0.5">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={1}
                disabled={isLoading}
                className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent text-xs ${
                  isLoading ? 'opacity-50' : ''
                }`}
                placeholder="Any additional notes about this supplier..."
              />
            </div>
          </div>
        </form>

        {/* Actions - Fixed at bottom */}
        <div className="flex items-center justify-end gap-2 p-2 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-3 py-1 text-gray-700 hover:text-gray-900 font-medium text-xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="supplier-form"
            disabled={isLoading}
            className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors font-medium flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                {isEditing ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}