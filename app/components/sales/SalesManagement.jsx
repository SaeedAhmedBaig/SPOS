'use client'

import { useState, useEffect, useMemo } from 'react'
import SalesTable from './SalesTable'
import SalesFilters from './SalesFilters'

// Types
/**
 * @typedef {Object} SalesStats
 * @property {number} totalRevenue
 * @property {number} todaySales
 * @property {number} totalOrders
 * @property {number} averageOrder
 * @property {number} returns
 * @property {number} pendingOrders
 * @property {number} completedOrders
 */

/**
 * @typedef {Object} SalesManagementProps
 * @property {boolean} [autoRefresh] - Enable automatic data refresh
 * @property {number} [refreshInterval] - Refresh interval in milliseconds
 * @property {function} [onDataLoad] - Callback when data loads
 * @property {function} [onError] - Callback when error occurs
 */

// Constants
const REFRESH_INTERVAL = 30000 // 30 seconds

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Sub-components for better organization
const PageHeader = ({ title, description, totalRevenue, loading = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className={`text-2xl font-bold text-gray-900 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '...' : formatCurrency(totalRevenue)}
        </p>
        <p className="text-sm text-gray-600">Total Revenue</p>
      </div>
    </div>
  </div>
)

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  loading = false,
  formatValue = (val) => val 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-gray-900 ${loading ? 'animate-pulse' : ''}`}>
            {loading ? '...' : formatValue(value)}
          </p>
        </div>
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

const QuickStats = ({ stats, loading = false }) => {
  const StatIcons = {
    TodaySales: (props) => (
      <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    TotalOrders: (props) => (
      <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    AverageOrder: (props) => (
      <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    Returns: (props) => (
      <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    )
  }

  const statsConfig = [
    {
      key: 'todaySales',
      title: "Today's Sales",
      value: stats?.todaySales || 0,
      icon: StatIcons.TodaySales,
      color: 'green',
      formatValue: formatCurrency
    },
    {
      key: 'totalOrders',
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: StatIcons.TotalOrders,
      color: 'blue',
      formatValue: (val) => val.toLocaleString()
    },
    {
      key: 'averageOrder',
      title: "Avg. Order",
      value: stats?.averageOrder || 0,
      icon: StatIcons.AverageOrder,
      color: 'purple',
      formatValue: formatCurrency
    },
    {
      key: 'returns',
      title: "Returns",
      value: stats?.returns || 0,
      icon: StatIcons.Returns,
      color: 'red',
      formatValue: (val) => val.toLocaleString()
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map(stat => (
        <StatCard
          key={stat.key}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          loading={loading}
          formatValue={stat.formatValue}
        />
      ))}
    </div>
  )
}

/**
 * SalesManagement component for comprehensive sales tracking and management
 * @param {SalesManagementProps} props
 */
export default function SalesManagement({ 
  autoRefresh = true,
  refreshInterval = REFRESH_INTERVAL,
  onDataLoad,
  onError 
}) {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [salesData, setSalesData] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Fetch sales data from API
  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (dateRange !== 'all') params.append('dateRange', dateRange)

      const response = await fetch(`/api/sales?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sales data: ${response.statusText}`)
      }

      const data = await response.json()
      
      setSalesData(data.sales || [])
      setStats(data.stats || {})
      setLastUpdated(new Date())
      
      onDataLoad?.(data)
    } catch (err) {
      const errorMessage = err.message || 'Failed to load sales data'
      setError(errorMessage)
      onError?.(err)
      console.error('Sales data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle export functionality
  const handleExport = async () => {
    try {
      setExportLoading(true)
      
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (dateRange !== 'all') params.append('dateRange', dateRange)

      const response = await fetch(`/api/sales/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to export sales data')
      console.error('Export error:', err)
    } finally {
      setExportLoading(false)
    }
  }

  // Handle sale selection
  const handleSaleSelect = (selectedIds) => {
    console.log('Selected sales:', selectedIds)
    // You can implement batch operations here
  }

  // Handle view details
  const handleViewDetails = (sale) => {
    console.log('View details:', sale)
    // Navigate to detail page or open modal
  }

  // Handle more actions
  const handleMoreActions = (sale) => {
    console.log('More actions:', sale)
    // Open context menu or dropdown with actions
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchSalesData()

    if (autoRefresh) {
      const interval = setInterval(fetchSalesData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSalesData()
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedStatus, dateRange])

  // Memoized derived data
  const displayStats = useMemo(() => {
    if (!stats) return null
    
    return {
      totalRevenue: stats.totalRevenue || 0,
      todaySales: stats.todaySales || 0,
      totalOrders: stats.totalOrders || 0,
      averageOrder: stats.averageOrder || 0,
      returns: stats.returns || 0
    }
  }, [stats])

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Sales Management"
        description="Manage and track all your sales transactions"
        totalRevenue={displayStats?.totalRevenue || 0}
        loading={loading}
      />

      {/* Last Updated Indicator */}
      {lastUpdated && (
        <div className="text-sm text-gray-500 -mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-800"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <QuickStats 
        stats={displayStats} 
        loading={loading && !salesData.length}
      />

      {/* Filters */}
      <SalesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        loading={exportLoading}
        disabled={loading}
      />

      {/* Sales Table */}
      <SalesTable
        sales={salesData}
        loading={loading}
        error={error}
        onSaleSelect={handleSaleSelect}
        onViewDetails={handleViewDetails}
        onMoreActions={handleMoreActions}
      />

      {/* Loading Overlay for initial load */}
      {loading && salesData.length === 0 && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sales data...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Additional hook for sales data management
export const useSalesData = (filters = {}) => {
  const [data, setData] = useState({
    sales: [],
    stats: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))
        
        const params = new URLSearchParams(filters)
        const response = await fetch(`/api/sales?${params.toString()}`)
        
        if (!response.ok) throw new Error('Failed to fetch')
        
        const result = await response.json()
        setData({
          sales: result.sales || [],
          stats: result.stats || {},
          loading: false,
          error: null
        })
      } catch (err) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }))
      }
    }

    fetchData()
  }, [filters])

  return data
}