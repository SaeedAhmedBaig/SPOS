'use client'

import { useState } from 'react'
import SalesReport from './SalesReport'
import DailySummaryReport from './DailySummaryReport'
import InventoryReport from './InventoryReport'
import PurchaseReport from './PurchaseReport'
import CustomerReport from './CustomerReport'
import SupplierReport from './SupplierReport'

const TABS = [
  { id: 'sales', label: 'Sales Report', component: SalesReport },
  { id: 'daily', label: 'Daily Summary', component: DailySummaryReport },
  { id: 'inventory', label: 'Inventory Report', component: InventoryReport },
  { id: 'purchase', label: 'Purchase Report', component: PurchaseReport },
  { id: 'customer', label: 'Customer Report', component: CustomerReport },
  { id: 'supplier', label: 'Supplier Report', component: SupplierReport },
]

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState('sales')

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white shadow-sm">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-auto p-6">
        {ActiveComponent ? <ActiveComponent /> : <div>No report selected</div>}
      </div>
    </div>
  )
}
