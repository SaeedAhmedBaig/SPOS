'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Package, UserPlus } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import ExportReportButton from './ExportReportButton'

export default function DailySummaryReport() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchDailySummary()
  }, [selectedDate])

  const fetchDailySummary = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ date: selectedDate })
      const response = await fetch(`/api/reports/daily-summary?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result || {})
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const summaryCards = [
    { title: "Total Sales", value: data.totalSales, prefix: "$", icon: <DollarSign className="w-6 h-6 text-green-600" />, iconBg: "bg-green-100" },
    { title: "Transactions", value: data.totalTransactions, icon: <CreditCard className="w-6 h-6 text-blue-600" />, iconBg: "bg-blue-100" },
    { title: "Items Sold", value: data.itemsSold, icon: <Package className="w-6 h-6 text-purple-600" />, iconBg: "bg-purple-100" },
    { title: "New Customers", value: data.newCustomers, icon: <UserPlus className="w-6 h-6 text-orange-600" />, iconBg: "bg-orange-100" },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daily Summary Report</h2>
            <p className="text-gray-700">Overview of daily business performance</p>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            <ExportReportButton
              reportType="daily-summary"
              filters={{ date: selectedDate }}
              data={data}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.prefix || ''}{card.value?.toLocaleString() || '0'}
                </p>
              </div>
              <div className={`p-3 ${card.iconBg} rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Hourly Sales Breakdown */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Hourly Sales Breakdown</h3>
        </div>
        <div className="p-6 space-y-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between space-x-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            ))
          ) : data.hourlyBreakdown?.length ? (
            data.hourlyBreakdown.map((hour, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 w-20">{hour.hour}:00</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(hour.sales / (data.totalSales || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16">${hour.sales?.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-700">No sales data for selected date</div>
          )}
        </div>
      </Card>
    </div>
  )
}
