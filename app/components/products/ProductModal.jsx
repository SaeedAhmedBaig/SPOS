'use client'

import { useState, useEffect } from 'react'
import { X, Save, Package, Upload, AlertCircle, Loader2 } from 'lucide-react'
import ProductImage from '../ui/ProductImage'

// These would typically come from a shared constants file or API
const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'computers', label: 'Computers' },
  { value: 'audio', label: 'Audio' },
  { value: 'wearables', label: 'Wearables' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
]

const INITIAL_FORM_DATA = {
  name: '',
  sku: '',
  barcode: '',
  category: 'electronics',
  price: '',
  cost: '',
  stock: '',
  description: '',
  status: 'active',
  image: ''
}

// Validation schema
const validateForm = (formData) => {
  const errors = {}

  if (!formData.name?.trim()) {
    errors.name = 'Product name is required'
  } else if (formData.name.length < 2) {
    errors.name = 'Product name must be at least 2 characters'
  }

  if (!formData.sku?.trim()) {
    errors.sku = 'SKU is required'
  }

  if (!formData.price || parseFloat(formData.price) < 0) {
    errors.price = 'Valid price is required'
  }

  if (!formData.cost || parseFloat(formData.cost) < 0) {
    errors.cost = 'Valid cost is required'
  }

  if (parseFloat(formData.cost) > parseFloat(formData.price)) {
    errors.cost = 'Cost cannot be greater than price'
  }

  if (!formData.stock || parseInt(formData.stock) < 0) {
    errors.stock = 'Valid stock quantity is required'
  }

  return errors
}

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [touched, setTouched] = useState({})

  const isEditing = !!product

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          category: product.category || 'electronics',
          price: product.price?.toString() || '',
          cost: product.cost?.toString() || '',
          stock: product.stock?.toString() || '',
          description: product.description || '',
          status: product.status || 'active',
          image: product.image || ''
        })
        setImagePreview(product.image || '')
      } else {
        setFormData(INITIAL_FORM_DATA)
        setImagePreview('')
      }
      setErrors({})
      setTouched({})
    }
  }, [isOpen, product])

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
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        // Ensure we don't send empty strings for optional fields
        barcode: formData.barcode || undefined,
        description: formData.description || undefined,
      }

      if (onSave) {
        await onSave(productData, isEditing ? product.id : null)
      }

      handleClose()
    } catch (error) {
      console.error('Error saving product:', error)
      setErrors({ submit: error.message || 'Failed to save product' })
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please upload a JPEG, PNG, or WebP image' }))
      return
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 10MB' }))
      return
    }

    setIsUploading(true)
    setErrors(prev => ({ ...prev, image: '' }))

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)

      // In a real app, you would upload to your backend here
      // For now, we'll simulate upload and store the file
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Set the image in form data (in real app, this would be the URL from your CDN)
      setFormData(prev => ({
        ...prev,
        image: previewUrl // Temporary URL, replace with actual CDN URL in production
      }))

    } catch (error) {
      console.error('Error uploading image:', error)
      setErrors(prev => ({ ...prev, image: 'Failed to upload image' }))
      setImagePreview('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
    setTouched({})
    setImagePreview('')
    onClose()
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Global Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Product Image & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Image Upload */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="space-y-2">
                  <div className={`border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors ${
                    isUploading ? 'opacity-50' : ''
                  }`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      {imagePreview ? (
                        <div className="relative">
                          <ProductImage
                            src={imagePreview}
                            alt="Product preview"
                            width={80}
                            height={80}
                            className="w-20 h-20 mx-auto mb-2 rounded-lg object-cover"
                          />
                          {isUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, WebP up to 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.image && (
                    <p className="text-red-600 text-xs">{errors.image}</p>
                  )}
                  {isUploading && (
                    <p className="text-blue-600 text-xs text-center">Uploading...</p>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
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
                    className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                      getFieldError('name') ? 'border-red-300 focus:ring-red-500' : ''
                    } ${isLoading ? 'opacity-50' : ''}`}
                    placeholder="Enter product name"
                  />
                  {getFieldError('name') && (
                    <p className="text-red-600 text-xs mt-1">{getFieldError('name')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      disabled={isLoading || isEditing} // SKU shouldn't be editable after creation
                      className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                        getFieldError('sku') ? 'border-red-300 focus:ring-red-500' : ''
                      } ${isLoading ? 'opacity-50' : ''}`}
                      placeholder="e.g., IP14P-256"
                    />
                    {getFieldError('sku') && (
                      <p className="text-red-600 text-xs mt-1">{getFieldError('sku')}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                        isLoading ? 'opacity-50' : ''
                      }`}
                      placeholder="123456789012"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                >
                  {CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
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
                  className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
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

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                  className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                    getFieldError('price') ? 'border-red-300 focus:ring-red-500' : ''
                  } ${isLoading ? 'opacity-50' : ''}`}
                  placeholder="0.00"
                />
                {getFieldError('price') && (
                  <p className="text-red-600 text-xs mt-1">{getFieldError('price')}</p>
                )}
              </div>
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price *
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                  className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                    getFieldError('cost') ? 'border-red-300 focus:ring-red-500' : ''
                  } ${isLoading ? 'opacity-50' : ''}`}
                  placeholder="0.00"
                />
                {getFieldError('cost') && (
                  <p className="text-red-600 text-xs mt-1">{getFieldError('cost')}</p>
                )}
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  disabled={isLoading}
                  className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                    getFieldError('stock') ? 'border-red-300 focus:ring-red-500' : ''
                  } ${isLoading ? 'opacity-50' : ''}`}
                  placeholder="0"
                />
                {getFieldError('stock') && (
                  <p className="text-red-600 text-xs mt-1">{getFieldError('stock')}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                disabled={isLoading}
                className={`input focus:ring-2 focus:ring-black focus:border-transparent ${
                  isLoading ? 'opacity-50' : ''
                }`}
                placeholder="Enter product description..."
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
            form="product-form"
            disabled={isLoading || isUploading}
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
                {isEditing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}