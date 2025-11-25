'use client'

import { Menu, Bell, HelpCircle } from 'lucide-react'

export default function TopNavbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          {/* Breadcrumb or Page Title */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>QPOS</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Dashboard</span>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          
          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center ml-2">
            <span className="text-xs font-medium text-gray-600">JD</span>
          </div>
        </div>
      </div>
    </header>
  )
}