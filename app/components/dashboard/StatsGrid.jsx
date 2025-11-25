'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Package, CreditCard, TrendingDown, Loader, AlertCircle } from 'lucide-react'

export default function StatsGrid() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchStats()
    
    // Set up interval to refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
      }
      
      const data = await response.json()
      transformStatsData(data)
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err.message)
      // Fallback to empty stats to prevent UI breakage
      setStats([])
    } finally {
      setLoading(false)
    }
  }

  const transformStatsData = (apiData) => {
    const transformedStats = [
      {
        id: 'totalRevenue',
        label: 'Total Revenue',
        value: apiData.totalRevenue?.current || 0,
        previousValue: apiData.totalRevenue?.previous || 0,
        change: apiData.totalRevenue?.change || 0,
        icon: TrendingUp,
        color: 'bg-green-50 text-green-600',
        format: 'currency'
      },
      {
        id: 'customers',
        label: 'Customers',
        value: apiData.customers?.current || 0,
        previousValue: apiData.customers?.previous || 0,
        change: apiData.customers?.change || 0,
        icon: Users,
        color: 'bg-blue-50 text-blue-600',
        format: 'number'
      },
      {
        id: 'products',
        label: 'Products',
        value: apiData.products?.current || 0,
        previousValue: apiData.products?.previous || 0,
        change: apiData.products?.change || 0,
        icon: Package,
        color: 'bg-purple-50 text-purple-600',
        format: 'number'
      },
      {
        id: 'todaySales',
        label: 'Today Sales',
        value: apiData.todaySales?.current || 0,
        previousValue: apiData.todaySales?.previous || 0,
        change: apiData.todaySales?.change || 0,
        icon: CreditCard,
        color: 'bg-orange-50 text-orange-600',
        format: 'currency'
      }
    ]
    
    setStats(transformedStats)
  }

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value || 0)
    }
    
    // For numbers, add commas
    return new Intl.NumberFormat('en-US').format(value || 0)
  }

  const formatChange = (change) => {
    if (change === 0) return '0%'
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'bg-green-50 text-green-700'
    if (change < 0) return 'bg-red-50 text-red-700'
    return 'bg-gray-50 text-gray-700'
  }

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return null
  }

  const getChangeText = (change, label) => {
    if (change > 0) return `+${change.toFixed(1)}% from last month`
    if (change < 0) return `${change.toFixed(1)}% from last month`
    return `No change from last month`
  }

  const handleRetry = () => {
    fetchStats()
  }

  if (error) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-full bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-16"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0"></div>
            </div>
          </div>
        ))}
        <div className="col-span-full text-center py-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-700 mb-2">Failed to load dashboard stats</p>
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
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {loading ? (
        // Loading skeleton
        Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-full bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
                <div className="h-6 bg-gray-200 rounded mb-3 w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0"></div>
            </div>
          </div>
        ))
      ) : stats.length > 0 ? (
        stats.map((stat) => {
          const Icon = stat.icon
          
          return (
            <div 
              key={stat.id}
              className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors group cursor-pointer"
              onClick={() => {
                // Navigate to relevant page based on stat type
                const pages = {
                  totalRevenue: '/reports',
                  customers: '/customers',
                  products: '/products',
                  todaySales: '/sales'
                }
                window.location.href = pages[stat.id] || '/dashboard'
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mb-2">
                    {formatValue(stat.value, stat.format)}
                  </p>
                  <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${getChangeColor(stat.change)}`}>
                    {getTrendIcon(stat.change)}
                    <span>{formatChange(stat.change)}</span>
                    <span className="hidden sm:inline">from last month</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-opacity-80 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              
              {/* Progress bar for visual indication */}
              {stat.previousValue > 0 && (
                <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      stat.change > 0 ? 'bg-green-500' : 
                      stat.change < 0 ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ 
                      width: `${Math.min(Math.abs(stat.change) * 2, 100)}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          )
        })
      ) : (
        // Empty state
        Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-full bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
                <div className="h-6 bg-gray-200 rounded mb-3 w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0"></div>
            </div>
          </div>
        ))
      )}

      {/* Last Updated Indicator */}
      {!loading && lastUpdated && (
        <div className="col-span-full text-center">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}