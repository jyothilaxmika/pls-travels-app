"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Fuel, 
  DollarSign, 
  CheckCircle, 
  RefreshCw,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { 
  getTripSummary, 
  getDriverRankings, 
  getRecentAnomalies, 
  getFuelKmChartData,
  TripSummary 
} from '@/lib/queries/getTripSummary'
import StatCard from './StatCard'
import DriverRankings from './DriverRankings'
import RecentAnomalies from './RecentAnomalies'
import FuelKmChart from './FuelKmChart'

interface DashboardData {
  summary: TripSummary | null
  driverRankings: any[]
  recentAnomalies: any[]
  chartData: any[]
  isLoading: boolean
  lastUpdated: Date | null
}

export default function InteractiveDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    summary: null,
    driverRankings: [],
    recentAnomalies: [],
    chartData: [],
    isLoading: true,
    lastUpdated: null
  })
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true }))
      
      const [summaryData, rankingsData, anomaliesData, chartDataResult] = await Promise.all([
        getTripSummary(),
        getDriverRankings(),
        getRecentAnomalies(5),
        getFuelKmChartData()
      ])

      setData({
        summary: summaryData,
        driverRankings: rankingsData,
        recentAnomalies: anomaliesData,
        chartData: chartDataResult,
        isLoading: false,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setData(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
      setRefreshInterval(interval)
      return () => {
        if (interval) clearInterval(interval)
      }
    } else if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  }, [autoRefresh, fetchDashboardData])

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

  const handleManualRefresh = () => {
    fetchDashboardData()
  }

  const handleExportData = async () => {
    try {
      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      if (trips) {
        const csvContent = [
          ['Date', 'Driver', 'Platform', 'Distance (KM)', 'Amount', 'Status'],
          ...trips.map(trip => [
            new Date(trip.date).toLocaleDateString(),
            trip.driver_name || 'Unknown',
            trip.platform,
            trip.distance_km,
            trip.amount,
            trip.status
          ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `trips-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-trip':
        router.push('/trips?action=add')
        break
      case 'add-driver':
        router.push('/drivers?action=add')
        break
      case 'view-anomalies':
        router.push('/audit')
        break
      case 'view-all-trips':
        router.push('/trips')
        break
      default:
        break
    }
  }

  if (data.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Interactive Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Real-time overview of your travel operations
                {data.lastUpdated && (
                  <span className="ml-2 text-sm text-gray-500">
                    • Last updated: {data.lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </button>

              {/* Manual refresh */}
              <button
                onClick={handleManualRefresh}
                className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>

              {/* Export data */}
              <button
                onClick={handleExportData}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Statistics */}
        {data.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Trips"
              value={data.summary.total_trips}
              icon={BarChart3}
              color="blue"
              trend={data.summary.total_trips > 0 ? '+12%' : '0%'}
            />
            <StatCard
              title="Total KM"
              value={`${data.summary.total_km.toLocaleString()} km`}
              icon={MapPin}
              color="green"
              trend="+8%"
            />
            <StatCard
              title="Total Fuel"
              value={`${data.summary.total_fuel.toLocaleString()} L`}
              icon={Fuel}
              color="orange"
              trend="-3%"
            />
            <StatCard
              title="Total Earnings"
              value={`₹${data.summary.total_earning.toLocaleString()}`}
              icon={DollarSign}
              color="purple"
              trend="+15%"
            />
          </div>
        )}

        {/* Additional Stats */}
        {data.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Active Drivers"
              value={data.summary.total_drivers}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Verified Trips"
              value={data.summary.verified_trips}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Anomaly Trips"
              value={data.summary.anomaly_count}
              icon={AlertTriangle}
              color="red"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleQuickAction('add-trip')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Add Trip</p>
                  <p className="text-sm text-gray-500">Record new trip</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('add-driver')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Add Driver</p>
                  <p className="text-sm text-gray-500">Register new driver</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('view-anomalies')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Review Anomalies</p>
                  <p className="text-sm text-gray-500">Check flagged trips</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('view-all-trips')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">View All Trips</p>
                  <p className="text-sm text-gray-500">Browse trip history</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Fuel & KM Chart */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Fuel & KM Trends</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </div>
              <div className="h-80">
                <FuelKmChart data={data.chartData} />
              </div>
            </div>
          </div>
          
          {/* Driver Rankings */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Drivers</h3>
                <button
                  onClick={() => router.push('/drivers')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <DriverRankings rankings={data.driverRankings} />
            </div>
          </div>
        </div>

        {/* Recent Anomalies */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Anomalies</h3>
              <button
                onClick={() => router.push('/audit')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <RecentAnomalies
              anomalies={data.recentAnomalies}
              onViewDetails={(tripId) => router.push(`/audit?trip=${tripId}`)}
              onMarkVerified={async (tripId) => {
                await supabase
                  .from('trips')
                  .update({ audit_status: 'verified' })
                  .eq('id', tripId)
                fetchDashboardData()
              }}
              onMarkReview={async (tripId) => {
                await supabase
                  .from('trips')
                  .update({ audit_status: 'needs_review' })
                  .eq('id', tripId)
                fetchDashboardData()
              }}
            />
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border mt-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {data.recentAnomalies.slice(0, 3).map((anomaly, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Anomaly detected in trip #{anomaly.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(anomaly.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/audit?trip=${anomaly.id}`)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
