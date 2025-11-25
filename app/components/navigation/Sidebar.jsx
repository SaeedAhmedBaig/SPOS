'use client'

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck,
  BarChart3,
  CreditCard,
  Settings,
  ChevronLeft,
  Plus,
  Search,
  Warehouse // Added for Inventory
} from 'lucide-react'
import Image from 'next/image'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, path: '/pos' },
  { id: 'products', label: 'Products', icon: Package, path: '/products' },
  { id: 'inventory', label: 'Inventory', icon: Warehouse, path: '/inventory' }, // Added Inventory
  { id: 'customers', label: 'Customers', icon: Users, path: '/customers' },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, path: '/suppliers' },
  { id: 'sales', label: 'Sales', icon: CreditCard, path: '/sales' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
]

const settingsItems = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Header */}
      <div className="flex items-center h-14 px-3 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            {/* Your Logo */}
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/images/logo/logo.svg"
                alt="QuickPOS"
                width={32}
                height={32}
                className="w-8 h-8"
                onError={(e) => {
                  // Fallback if logo doesn't exist
                  e.target.style.display = 'none'
                  const fallback = e.target.nextSibling
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              {/* Fallback logo - shown if SVG doesn't exist */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hidden">
                <span className="text-white font-bold text-sm">QP</span>
              </div>
            </div>
            <span className="font-semibold text-gray-900">QuickPOS</span>
          </div>
        )}
        
        {/* Collapsed State Logo */}
        {isCollapsed && (
          <div className="w-8 h-8 flex items-center justify-center mx-auto">
            <Image
              src="/images/logo/logo.svg"
              alt="QuickPOS"
              width={24}
              height={24}
              className="w-6 h-6"
              onError={(e) => {
                e.target.style.display = 'none'
                const fallback = e.target.nextSibling
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            {/* Fallback logo for collapsed state */}
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center hidden">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
          </div>
        )}
        
        {/* Collapse Toggle */}
        <button 
          onClick={onToggleCollapse}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-3 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            New Sale
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded hover:border-gray-300 focus:border-black focus:ring-0 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === 'dashboard' // You'll want to update this based on current route
          
          return (
            <a
              key={item.id}
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors group
                ${isActive 
                  ? 'bg-gray-100 text-gray-900 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && item.label}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </a>
          )
        })}
      </nav>

      {/* Settings Section */}
      <div className="p-3 border-t border-gray-100">
        {settingsItems.map((item) => {
          const Icon = item.icon
          
          return (
            <a
              key={item.id}
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors group
                text-gray-600 hover:text-gray-900 hover:bg-gray-50
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && item.label}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </a>
          )
        })}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-100">
        <div className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">JD</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}