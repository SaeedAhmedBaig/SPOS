'use client'

import { useState } from 'react'
import SalesReport from './SalesReport'
import DailySummaryReport from './DailySummaryReport'
import InventoryReport from './InventoryReport'
import PurchaseReport from './PurchaseReport'
import CustomerReport from './CustomerReport'
import SupplierReport from './SupplierReport'
import ProfitLossReport from './ProfitLossReport'

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState('sales')

  const tabs = [
    { id: 'sales', name: 'Sales Report' },
    { id: 'daily-summary', name: 'Daily Summary' },
    { id: 'inventory', name: 'Inventory Report' },
    { id: 'purchase', name: 'Purchase Report' },
    { id: 'customer', name: 'Customer Report' },
    { id: 'supplier', name: 'Supplier Report' },
    { id: 'profit-loss', name: 'Profit & Loss' }
  ]

  const renderReport = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesReport />
      case 'daily-summary':
        return <DailySummaryReport />
      case 'inventory':
        return <InventoryReport />
      case 'purchase':
        return <PurchaseReport />
      case 'customer':
        return <CustomerReport />
      case 'supplier':
        return <SupplierReport />
      case 'profit-loss':
        return <ProfitLossReport />
      default:
        return <SalesReport />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-700 mt-1">Analyze your business performance and insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-4 md:space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      <div className="min-h-[24rem]">
        {renderReport()}
      </div>
    </div>
  )
}
