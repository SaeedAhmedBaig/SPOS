'use client'

import { X, Printer, Download, User, CreditCard, Calendar, Package } from 'lucide-react'
import { useEffect, useRef, useMemo } from 'react'

// Types
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
 * @typedef {Object} SalesDetailsProps
 * @property {boolean} isOpen
 * @property {function} onClose
 * @property {Sale} sale
 * @property {function} [onPrint] - Custom print handler
 * @property {function} [onDownload] - Download as PDF/CSV
 * @property {number} [taxRate] - Tax rate percentage
 */

// Constants
const DEFAULT_TAX_RATE = 0.08 // 8%

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
    full: date.toLocaleString(),
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

const getStatusConfig = (status) => {
  const statusConfig = {
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    refunded: {
      label: 'Refunded',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  return statusConfig[status] || statusConfig.cancelled
}

const getPaymentIcon = (method) => {
  const paymentIcons = {
    'Credit Card': <CreditCard className="w-4 h-4" />,
    'Cash': <span className="text-lg" role="img" aria-label="Cash">💵</span>,
    'Mobile Pay': <span className="text-lg" role="img" aria-label="Mobile Pay">📱</span>,
    'PayPal': <span className="text-lg" role="img" aria-label="PayPal">🔵</span>
  }
  
  return paymentIcons[method] || <CreditCard className="w-4 h-4" />
}

// Sub-components
const ModalHeader = ({ sale, onClose, onPrint, onDownload }) => {
  const formattedDate = formatDate(sale.date)
  
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Order Details - {sale.id}</h2>
        <p className="text-gray-600 mt-1 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formattedDate.full}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          aria-label="Download invoice"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          aria-label="Print invoice"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

const CustomerInfoSection = ({ sale }) => {
  const statusConfig = getStatusConfig(sale.status)
  const formattedDate = formatDate(sale.date)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Customer Information
        </h3>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700 text-sm">Name:</span>
            <p className="text-gray-900 mt-1">{sale.customer}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700 text-sm">Email:</span>
            <p className="text-gray-900 mt-1">{sale.customerEmail}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700 text-sm">Payment Method:</span>
            <div className="flex items-center gap-2 mt-1">
              {getPaymentIcon(sale.paymentMethod)}
              <span className="text-gray-900">{sale.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Information
        </h3>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700 text-sm">Order ID:</span>
            <p className="text-gray-900 mt-1 font-mono">{sale.id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700 text-sm">Date & Time:</span>
            <p className="text-gray-900 mt-1">{formattedDate.date} at {formattedDate.time}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700 text-sm">Status:</span>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const OrderItemsTable = ({ products }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product, index) => (
            <tr key={`${product.name}-${index}`} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-900">
                {product.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {product.quantity}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatCurrency(product.price)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                {formatCurrency(product.price * product.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const OrderSummary = ({ subtotal, tax, total, taxRate }) => (
  <div className="flex justify-end">
    <div className="w-80 space-y-3 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal:</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
        <span className="font-medium">{formatCurrency(tax)}</span>
      </div>
      <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
        <span className="text-gray-900">Total:</span>
        <span className="text-gray-900">{formatCurrency(total)}</span>
      </div>
    </div>
  </div>
)

/**
 * SalesDetails component for displaying comprehensive order information
 * @param {SalesDetailsProps} props
 */
export default function SalesDetails({ 
  isOpen, 
  onClose, 
  sale, 
  onPrint,
  onDownload,
  taxRate = DEFAULT_TAX_RATE 
}) {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  // Calculations with useMemo for performance
  const calculations = useMemo(() => {
    if (!sale) return null

    const subtotal = sale.products.reduce((total, product) => 
      total + (product.price * product.quantity), 0
    )
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total }
  }, [sale, taxRate])

  // Handle print functionality
  const handlePrint = () => {
    if (onPrint) {
      onPrint(sale)
    } else {
      // Default print behavior
      const printContent = modalRef.current?.innerHTML
      const originalContent = document.body.innerHTML
      
      document.body.innerHTML = printContent
      window.print()
      document.body.innerHTML = originalContent
      window.location.reload() // Restore the original page
    }
  }

  // Handle download functionality
  const handleDownload = () => {
    if (onDownload) {
      onDownload(sale)
    } else {
      // Default download behavior - create a simple text invoice
      const invoiceText = generateInvoiceText(sale, calculations)
      downloadAsText(invoiceText, `invoice-${sale.id}.txt`)
    }
  }

  // Generate invoice text for download
  const generateInvoiceText = (sale, calc) => {
    return `
INVOICE - ${sale.id}
Date: ${formatDate(sale.date).full}
Customer: ${sale.customer}
Email: ${sale.customerEmail}
Status: ${sale.status}
Payment Method: ${sale.paymentMethod}

ITEMS:
${sale.products.map(product => 
  `${product.name} x${product.quantity} - ${formatCurrency(product.price)} each = ${formatCurrency(product.price * product.quantity)}`
).join('\n')}

SUBTOTAL: ${formatCurrency(calc.subtotal)}
TAX (${(taxRate * 100).toFixed(1)}%): ${formatCurrency(calc.tax)}
TOTAL: ${formatCurrency(calc.total)}
    `.trim()
  }

  // Download as text file
  const downloadAsText = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Manage focus for accessibility
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      modalRef.current?.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !sale) return null

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <ModalHeader 
          sale={sale}
          onClose={onClose}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />

        {/* Content */}
        <div className="p-6 space-y-6">
          <CustomerInfoSection sale={sale} />
          
          <OrderItemsTable products={sale.products} />
          
          {calculations && (
            <OrderSummary 
              subtotal={calculations.subtotal}
              tax={calculations.tax}
              total={calculations.total}
              taxRate={taxRate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Loading state component for async data
export const SalesDetailsSkeleton = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="animate-pulse">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)