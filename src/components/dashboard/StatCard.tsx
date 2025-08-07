"use client"

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray'
  trend?: string
  onClick?: () => void
  loading?: boolean
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
    trend: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
    trend: 'text-green-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-100',
    trend: 'text-orange-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100',
    trend: 'text-purple-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
    hover: 'hover:bg-red-100',
    trend: 'text-red-600'
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
    trend: 'text-gray-600'
  }
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  onClick,
  loading = false 
}: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = colorClasses[color]

  const getTrendIcon = (trendValue: string) => {
    if (trendValue.startsWith('+')) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (trendValue.startsWith('-')) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    } else {
      return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trendValue: string) => {
    if (trendValue.startsWith('+')) {
      return 'text-green-600'
    } else if (trendValue.startsWith('-')) {
      return 'text-red-600'
    } else {
      return 'text-gray-600'
    }
  }

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6
        transition-all duration-200 ease-in-out
        ${onClick ? 'cursor-pointer' : ''}
        ${onClick ? colors.hover : ''}
        ${isHovered ? 'transform scale-105 shadow-md' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(trend)}
            <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
              {trend}
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="text-2xl lg:text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>

      {/* Title */}
      <div className="text-sm text-gray-600 font-medium">
        {title}
      </div>

      {/* Hover effect indicator */}
      {onClick && (
        <div className={`
          absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
          ${colors.icon} opacity-0 transition-opacity duration-200
          ${isHovered ? 'opacity-100' : ''}
        `} />
      )}
    </div>
  )
} 