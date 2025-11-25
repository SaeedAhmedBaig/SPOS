'use client'

import { Menu, HelpCircle } from 'lucide-react'
import UserProfileDropdown from './UserProfileDropdown'
import NotificationsDropdown from './NotificationsDropdown'

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
        
        {/* Right Section - POSITION PRESERVED */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          
          {/* Notifications Dropdown */}
          <NotificationsDropdown />
          
          {/* User Profile Dropdown */}
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  )
}