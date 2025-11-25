'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, CreditCard, Smartphone, DollarSign, Wallet, Loader, CheckCircle, AlertCircle, Printer } from 'lucide-react'

export default function POSPaymentModal({ isOpen, onClose, cart, cartSummary, onSuccess, onError }) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountTendered, setAmountTendered] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('') // '', 'processing', 'success', 'error'
  const [transactionId, setTransactionId] = useState('')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [customerEmail, setCustomerEmail] = useState('')
  const [sendReceipt, setSendReceipt] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setPaymentMethod('cash')
    setAmountTendered('')
    setProcessing(false)
    setPaymentStatus('')
    setTransactionId('')
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    })
    setCustomerEmail('')
    setSendReceipt(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const calculateChange = () => {
    if (paymentMethod === 'cash' && amountTendered) {
      const tendered = parseFloat(amountTendered)
      const change = tendered - (cartSummary?.total || 0)
      return change >= 0 ? change : 0
    }
    return 0
  }

  const handleAmountTenderedChange = (value) => {
    setAmountTendered(value)
    // Auto-calculate exact amount if user types the total
    if (value && Math.abs(parseFloat(value) - (cartSummary?.total || 0)) < 0.01) {
      setAmountTendered((cartSummary?.total || 0).toFixed(2))
    }
  }

  const handleCardInputChange = (field, value) => {
    let formattedValue = value
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19)
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)
    }
    
    // Format CVV (numbers only, max 4)
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const validateForm = () => {
    if (paymentMethod === 'cash') {
      if (!amountTendered || parseFloat(amountTendered) < (cartSummary?.total || 0)) {
        onError?.('Amount tendered must be greater than or equal to total')
        return false
      }
    }
    
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        onError?.('Please enter a valid 16-digit card number')
        return false
      }
      if (!cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
        onError?.('Please enter a valid expiry date (MM/YY)')
        return false
      }
      if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
        onError?.('Please enter a valid CVV')
        return false
      }
      if (!cardDetails.cardholderName.trim()) {
        onError?.('Please enter cardholder name')
        return false
      }
    }

    if (sendReceipt && !customerEmail.match(/^\S+@\S+\.\S+$/)) {
      onError?.('Please enter a valid email for receipt')
      return false
    }

    return true
  }

  const processPayment = async () => {
    try {
      setProcessing(true)
      setPaymentStatus('processing')
      
      const paymentData = {
        cart,
        cartSummary,
        paymentMethod,
        amountTendered: paymentMethod === 'cash' ? parseFloat(amountTendered) : undefined,
        cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
        customerEmail: sendReceipt ? customerEmail : undefined,
        sendReceipt
      }

      const response = await fetch('/api/pos/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Payment failed: ${response.status}`)
      }

      const result = await response.json()
      
      setTransactionId(result.transactionId)
      setPaymentStatus('success')
      
      // Call success callback after a brief delay to show success state
      setTimeout(() => {
        onSuccess?.(result)
      }, 2000)
      
    } catch (error) {
      console.error('Payment processing error:', error)
      setPaymentStatus('error')
      onError?.(error.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    await processPayment()
  }

  const handlePrintReceipt = () => {
    // Implement receipt printing
    window.print()
  }

  const handleQuickAmount = (amount) => {
    if (paymentMethod === 'cash') {
      setAmountTendered(amount.toString())
    }
  }

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500' },
    { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'bg-purple-500' },
    { id: 'digital', name: 'Digital Wallet', icon: Wallet, color: 'bg-orange-500' },
  ]

  const quickAmounts = [5, 10, 20, 50, 100]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {paymentStatus === 'success' ? 'Payment Successful' : 'Process Payment'}
          </h2>
          {!processing && (
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={processing}
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Payment Status */}
        {paymentStatus === 'processing' && (
          <div className="p-6 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center gap-3 text-blue-700">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="font-medium">Processing payment...</span>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <div>
                <span className="font-medium">Payment successful!</span>
                {transactionId && (
                  <p className="text-sm text-green-600">Transaction: {transactionId}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Payment failed</span>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {paymentStatus !== 'success' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({cartSummary?.itemCount || cart?.length || 0})</span>
                  <span className="font-medium">{formatCurrency(cartSummary?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(cartSummary?.tax || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-300 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(cartSummary?.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      disabled={processing}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        paymentMethod === method.id
                          ? `border-${method.color.split('-')[1]}-500 bg-${method.color.split('-')[1]}-50`
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === method.id ? `text-${method.color.split('-')[1]}-600` : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        paymentMethod === method.id ? `text-${method.color.split('-')[1]}-700` : 'text-gray-700'
                      }`}>
                        {method.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cash Payment */}
            {paymentMethod === 'cash' && (
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Tendered
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amountTendered}
                  onChange={(e) => handleAmountTenderedChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  disabled={processing}
                />
                
                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      disabled={processing}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(cartSummary?.total || 0)}
                    disabled={processing}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    Exact
                  </button>
                </div>

                {amountTendered && (
                  <p className="mt-2 text-lg font-semibold text-green-600">
                    Change: {formatCurrency(calculateChange())}
                  </p>
                )}
              </div>
            )}

            {/* Card Payment */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234 5678 9012 3456"
                    required
                    disabled={processing}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="MM/YY"
                      required
                      disabled={processing}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123"
                      required
                      disabled={processing}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardholderName"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    required
                    disabled={processing}
                  />
                </div>
              </div>
            )}

            {/* Receipt Options */}
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={sendReceipt}
                  onChange={(e) => setSendReceipt(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={processing}
                />
                <span className="text-sm font-medium text-gray-700">Send receipt via email</span>
              </label>
              
              {sendReceipt && (
                <div className="mt-3">
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="customer@example.com"
                    disabled={processing}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Complete Payment (${formatCurrency(cartSummary?.total || 0)})`
                )}
              </button>
            </div>
          </form>
        )}

        {/* Success Actions */}
        {paymentStatus === 'success' && (
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}