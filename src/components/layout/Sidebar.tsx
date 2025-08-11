'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Calendar, 
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: number
  description?: string
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'Drivers',
      href: '/drivers',
      icon: Users,
      description: 'Manage driver profiles'
    },
    {
      name: 'Trips',
      href: '/trips',
      icon: MapPin,
      description: 'Track and manage trips'
    },
    {
      name: 'Audit',
      href: '/audit',
      icon: AlertTriangle,
      description: 'Review anomalies'
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      description: 'Track driver attendance'
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: DollarSign,
      description: 'Manage payments'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose?.()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">PLS Travels</h2>
                <p className="text-sm text-gray-600">Driver Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={item.description}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}