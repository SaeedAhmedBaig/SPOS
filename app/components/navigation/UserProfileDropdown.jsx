// app/components/navigation/UserProfileDropdown.jsx

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  ChevronDown,
  Shield,
  Bell,
  Loader2
} from 'lucide-react'

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dropdownRef = useRef(null)

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching user data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (response.ok) {
        window.location.href = '/auth/login'
      } else {
        throw new Error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
      // Fallback redirect
      window.location.href = '/auth/login'
    }
  }

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      href: '/profile',
      description: 'Manage your account'
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      description: 'System preferences'
    },
    {
      label: 'Billing',
      icon: CreditCard,
      href: '/billing',
      description: 'Subscription & payments'
    },
    {
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      description: 'Alert preferences'
    },
  ]

  // Add admin menu item if user is admin
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    menuItems.push({
      label: 'Admin',
      icon: Shield,
      href: '/admin',
      description: 'Administrator tools'
    })
  }

  // Generate initials from user name
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <>
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-white">
                {user ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 px-4 text-center">
              <div className="text-red-600 text-sm">
                Failed to load user data
              </div>
            </div>
          ) : (
            <>
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email || 'No email'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 capitalize">
                        {user?.role || 'user'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-2 pb-1">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 rounded-md"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                    <LogOut className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default UserProfileDropdown