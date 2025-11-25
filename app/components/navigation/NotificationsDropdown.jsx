// app/components/navigation/NotificationsDropdown.jsx

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  ShoppingCart,
  Package,
  Users,
  Loader2,
  RefreshCw
} from 'lucide-react'

// Notification types
const NotificationType = {
  SALE: 'sale',
  INVENTORY: 'inventory', 
  CUSTOMER: 'customer',
  SYSTEM: 'system',
  SECURITY: 'security'
}

// Mock API (replace with real API calls)
const notificationsApi = {
  getNotifications: async (page = 1, limit = 20) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      notifications: [
        {
          id: 'notif_1',
          type: NotificationType.SALE,
          title: 'New Sale Completed',
          message: 'Sale #ORD-0012 for $245.50 was completed by John Doe',
          time: '2 min ago',
          read: false,
          actionUrl: '/sales/ORD-0012',
          metadata: { amount: 245.50, orderId: 'ORD-0012' },
          createdAt: new Date().toISOString()
        },
      ],
      total: 15,
      unreadCount: 3,
      hasMore: true
    };
  },
  markAsRead: async (notificationId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  markAllAsRead: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  deleteNotification: async (notificationId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
}

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      loadNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      
      const response = await notificationsApi.getNotifications()
      setNotifications(response.notifications)
      setUnreadCount(response.unreadCount)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      const notification = notifications.find(n => n.id === id)
      const wasUnread = notification && !notification.read
      await notificationsApi.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      [NotificationType.SALE]: ShoppingCart,
      [NotificationType.INVENTORY]: Package,
      [NotificationType.CUSTOMER]: Users,
      [NotificationType.SYSTEM]: Info,
      [NotificationType.SECURITY]: AlertCircle
    }
    return icons[type] || Bell
  }

  const getNotificationColor = (type) => {
    const colors = {
      [NotificationType.SALE]: 'text-green-600',
      [NotificationType.INVENTORY]: 'text-orange-600',
      [NotificationType.CUSTOMER]: 'text-blue-600',
      [NotificationType.SYSTEM]: 'text-purple-600',
      [NotificationType.SECURITY]: 'text-red-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const formatTime = (timeString) => timeString

  const NotificationSkeleton = () => (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-2 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={loading}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
        {loading && <Loader2 className="absolute -top-1 -right-1 w-3 h-3 text-blue-500 animate-spin" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => loadNotifications(true)}
                disabled={refreshing}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors duration-200"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {error ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-300 mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">Failed to load</p>
                <p className="text-xs text-gray-500 mb-3">{error}</p>
                <button onClick={() => loadNotifications()} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Try again</button>
              </div>
            ) : loading ? (
              <div className="py-2">{[...Array(3)].map((_, i) => <NotificationSkeleton key={i} />)}</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-900">No notifications</p>
                <p className="text-xs text-gray-500 mt-1">Youre all caught up!</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 group ${!notification.read ? 'bg-blue-50/50' : 'hover:bg-gray-50'} transition-colors duration-200`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${!notification.read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        <Icon className={`w-4 h-4 ${getNotificationColor(notification.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.time)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!notification.read && (
                          <button onClick={() => handleMarkAsRead(notification.id)} className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors duration-200" title="Mark as read">
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteNotification(notification.id)} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors duration-200" title="Dismiss">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {!notification.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-100 pt-2 pb-1">
              <Link href="/notifications" className="block text-center text-xs text-blue-600 hover:text-blue-700 font-medium px-4 py-2 hover:bg-blue-50 rounded transition-colors duration-200" onClick={() => setIsOpen(false)}>
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsDropdown
