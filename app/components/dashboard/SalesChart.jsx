'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, MoreHorizontal, TrendingDown, Loader, AlertCircle, Calendar } from 'lucide-react'

export default function SalesChart() {
  const [salesData, setSalesData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d, 1y

  useEffect(() => {
    fetchSalesData()
  }, [timeRange])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics/sales?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sales data: ${response.status}`)
      }
      
      const data = await response.json()
      setSalesData(data.chartData || [])
      setSummary(data.summary || {})
    } catch (err) {
      console.error('Error fetching sales data:', err)
      setError(err.message)
      // Fallback to empty data to prevent UI breakage
      setSalesData([])
      setSummary({})
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return formatCurrency(amount)
  }

  const getMaxValue = (data) => {
    if (!data.length) return 100
    return Math.max(...data.map(d => d.sales || d.revenue || 0)) * 1.1 // 10% padding
  }

  const getTimeRangeLabel = (range) => {
    const labels = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '1y': 'Last 12 months'
    }
    return labels[range] || 'Last 7 days'
  }

  const getGrowthColor = (growth) => {
    if (!growth) return 'text-gray-600'
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (growth) => {
    if (!growth) return null
    return growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  const formatGrowth = (growth) => {
    if (growth === undefined || growth === null) return 'N/A'
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`
  }

  const handleRetry = () => {
    fetchSalesData()
  }

  const timeRangeOptions = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' }
  ]

  const maxSales = getMaxValue(salesData)

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sales Overview</h3>
            <p className="text-sm text-gray-600">Failed to load sales data</p>
          </div>
        </div>
        <div className="w-full text-center py-8">
          <div className="text-red-600 mb-3">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-700 mb-4">Unable to load sales overview</p>
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
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Sales Overview</h3>
          <p className="text-sm text-gray-600">
            {loading ? 'Loading sales data...' : getTimeRangeLabel(timeRange)}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {!loading && summary.growth !== undefined && (
            <div className={`flex items-center gap-2 text-sm ${getGrowthColor(summary.growth)}`}>
              {getGrowthIcon(summary.growth)}
              <span>{formatGrowth(summary.growth)}</span>
            </div>
          )}
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === option.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full relative">
        {loading ? (
          // Chart loading skeleton
          <div className="w-full flex items-end justify-between gap-2 h-40 mt-8">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-3/4 bg-gray-200 rounded-t animate-pulse"
                  style={{ height: `${Math.random() * 70 + 30}%` }}
                />
                <div className="h-3 bg-gray-200 rounded w-8 mt-2 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : salesData.length > 0 ? (
          <div className="w-full flex items-end justify-between gap-2 h-40 mt-8">
            {salesData.map((day, index) => {
              const salesValue = day.sales || day.revenue || 0
              const height = Math.max((salesValue / maxSales) * 100, 8) // Minimum 8% height
              const isToday = day.isCurrentPeriod
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className={`w-3/4 rounded-t transition-all duration-300 group-hover:opacity-80 ${
                        isToday 
                          ? 'bg-gradient-to-t from-blue-600 to-blue-500' 
                          : 'bg-gradient-to-t from-blue-500 to-blue-400'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <div className={`text-xs mt-2 ${
                      isToday ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {day.label || day.day || day.date}
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    <div className="font-medium">{formatCurrency(salesValue)}</div>
                    <div className="text-gray-300">
                      {day.date ? new Date(day.date).toLocaleDateString() : day.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Empty state
          <div className="w-full h-40 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No sales data</p>
              <p className="text-sm text-gray-600 mt-1">Sales data will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="w-full flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        <div className="text-center flex-1">
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? (
              <div className="h-7 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
            ) : (
              formatCompactCurrency(summary.totalRevenue || summary.totalSales)
            )}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? (
              <div className="h-7 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
            ) : (
              (summary.totalOrders || 0).toLocaleString()
            )}
          </p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? (
              <div className="h-7 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
            ) : (
              formatCurrency(summary.averageOrderValue)
            )}
          </p>
          <p className="text-sm text-gray-600">Average Order</p>
        </div>
      </div>

      {/* Last Updated */}
      {!loading && summary.lastUpdated && (
        <div className="w-full text-center mt-4">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(summary.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}