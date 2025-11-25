'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, ArrowUpRight, CreditCard, Loader, AlertCircle } from 'lucide-react'

export default function RecentSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecentSales()
  }, [])

  const fetchRecentSales = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/sales/recent?limit=5')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recent sales: ${response.status}`)
      }
      
      const data = await response.json()
      setSales(data.sales || [])
    } catch (err) {
      console.error('Error fetching recent sales:', err)
      setError(err.message)
      // Fallback to empty array to prevent UI breakage
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
      case 'paid': 
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': 
      case 'processing': 
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'failed': 
      case 'cancelled': 
      case 'refunded': 
        return 'bg-red-100 text-red-700 border-red-200'
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount || 0)
  }

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }

  const handleViewAll = () => {
    // Navigate to sales page
    window.location.href = '/sales'
  }

  const handleRetry = () => {
    fetchRecentSales()
  }

  const handleSaleAction = (saleId, action) => {
    // Implement sale actions (view details, refund, etc.)
    console.log(`Action ${action} on sale ${saleId}`)
    // For now, navigate to sale details
    window.location.href = `/sales/${saleId}`
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between w-full p-6 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <p className="text-sm text-gray-600 mt-1">Failed to load sales data</p>
          </div>
        </div>
        <div className="w-full p-6 text-center">
          <div className="text-red-600 mb-3">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-700 mb-4">Unable to load recent sales</p>
          <button
            onClick={handleRetry}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between w-full p-6 border-b border-gray-100">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          <p className="text-sm text-gray-600 mt-1">Latest transactions from your store</p>
        </div>
        {!loading && (
          <button 
            onClick={handleViewAll}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 flex-shrink-0 transition-colors"
          >
            View all
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="w-full divide-y divide-gray-100">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-full p-6 animate-pulse">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : sales.length > 0 ? (
          sales.map((sale) => (
            <div 
              key={sale.id} 
              className="w-full p-6 hover:bg-gray-50 transition-colors group cursor-pointer"
              onClick={() => handleSaleAction(sale.id, 'view')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sale.customer?.name || sale.customerName || 'Walk-in Customer'}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                      <span className="truncate">#{sale.invoiceNumber || sale.orderNumber || sale.id}</span>
                      <span className="text-gray-400">•</span>
                      <span>{sale.itemsCount || sale.items?.length || 0} items</span>
                      <span className="text-gray-400">•</span>
                      <span>{formatRelativeTime(sale.createdAt || sale.date)}</span>
                      {sale.paymentMethod && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="capitalize">{sale.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(sale.totalAmount || sale.amount)}
                  </p>
                  <button 
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaleAction(sale.id, 'more')
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No recent sales</p>
            <p className="text-sm text-gray-600 mt-1">Sales will appear here as they come in</p>
          </div>
        )}
      </div>
    </div>
  )
}