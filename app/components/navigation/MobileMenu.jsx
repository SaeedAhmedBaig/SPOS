// app/components/navigation/MobileMenu.jsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck,
  BarChart3,
  CreditCard,
  Settings,
  Plus,
  Search,
  Warehouse,
  X,
  User,
  LogOut
} from 'lucide-react'

const MobileMenu = ({ isOpen, onClose }) => {
  const pathname = usePathname()
  
  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname])

  // Prevent body scroll when menu is open
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, path: '/pos' },
    { id: 'products', label: 'Products', icon: Package, path: '/products' },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, path: '/inventory' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/customers' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, path: '/suppliers' },
    { id: 'sales', label: 'Sales', icon: CreditCard, path: '/sales' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  ]

  const settingsItems = [
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QP</span>
            </div>
            <span className="font-semibold text-gray-900">QuickPOS</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Quick Actions - Same as Sidebar */}
        <div className="p-3 space-y-2 border-b border-gray-100">
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            New Sale
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 focus:border-black focus:ring-0 transition-colors"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Settings Section */}
        <div className="border-t border-gray-100 py-2">
          <div className="space-y-1 px-3">
            {settingsItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Profile</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>

            {/* Logout Button */}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileMenu