"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, BarChart3, Users, AlertTriangle, TrendingUp, Fuel, MapPin, DollarSign, CheckCircle, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { 
  getTripSummary, 
  getDriverRankings, 
  getRecentAnomalies, 
  getFuelKmChartData,
  TripSummary 
} from '@/lib/queries/getTripSummary'
import StatCard from '@/components/dashboard/StatCard'
import DriverRankings from '@/components/dashboard/DriverRankings'
import RecentAnomalies from '@/components/dashboard/RecentAnomalies'
import FuelKmChart from '@/components/dashboard/FuelKmChart'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [summary, setSummary] = useState<TripSummary | null>(null)
  const [driverRankings, setDriverRankings] = useState<any[]>([])
  const [recentAnomalies, setRecentAnomalies] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true)
      
      // Fetch all dashboard data in parallel
      const [summaryData, rankingsData, anomaliesData, chartDataResult] = await Promise.all([
        getTripSummary(),
        getDriverRankings(),
        getRecentAnomalies(5),
        getFuelKmChartData()
      ])

      setSummary(summaryData)
      setDriverRankings(rankingsData)
      setRecentAnomalies(anomaliesData)
      setChartData(chartDataResult)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleViewAnomalyDetails = (tripId: string) => {
    router.push(`/audit?trip=${tripId}`)
  }

  const handleMarkVerified = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ audit_status: 'verified' })
        .eq('id', tripId)

      if (error) {
        console.error('Error marking trip as verified:', error)
        return
      }

      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleMarkReview = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ audit_status: 'needs_review' })
        .eq('id', tripId)

      if (error) {
        console.error('Error marking trip for review:', error)
        return
      }

      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b lg:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h1 className="ml-2 text-lg font-bold text-gray-900">
              PLS Travels
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => router.push('/trips')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                View All Trips
              </button>
              <button
                onClick={() => router.push('/audit')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Review Anomalies
              </button>
              <button
                onClick={() => router.push('/drivers')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Manage Drivers
              </button>
              <div className="border-t pt-2">
                <span className="block px-3 py-1 text-sm text-gray-500">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                PLS Travels DMS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">📊 Trip Summary Dashboard</h1>
          <p className="text-gray-600 text-sm lg:text-base">Comprehensive overview of your travel operations and analytics</p>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <StatCard
              title="Total Trips"
              value={summary.total_trips}
              icon={BarChart3}
              color="blue"
            />
            <StatCard
              title="Total KM"
              value={`${summary.total_km.toLocaleString()} km`}
              icon={MapPin}
              color="green"
            />
            <StatCard
              title="Total Fuel"
              value={`${summary.total_fuel.toLocaleString()} L`}
              icon={Fuel}
              color="orange"
            />
            <StatCard
              title="Total Earnings"
              value={`₹${summary.total_earning.toLocaleString()}`}
              icon={DollarSign}
              color="purple"
            />
          </div>
        )}

        {/* Additional Stats Row */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <StatCard
              title="Active Drivers"
              value={summary.total_drivers}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Verified Trips"
              value={summary.verified_trips}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Anomaly Trips"
              value={summary.anomaly_count}
              icon={AlertTriangle}
              color="red"
            />
          </div>
        )}

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Fuel & KM Chart */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel & KM Trends</h3>
            <div className="h-64 lg:h-80">
              <FuelKmChart data={chartData} />
            </div>
          </div>
          
          {/* Driver Rankings */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Drivers</h3>
            <DriverRankings rankings={driverRankings} />
          </div>
        </div>

        {/* Recent Anomalies */}
        <div className="mb-6 lg:mb-8">
          <RecentAnomalies
            anomalies={recentAnomalies}
            onViewDetails={handleViewAnomalyDetails}
            onMarkVerified={handleMarkVerified}
            onMarkReview={handleMarkReview}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <button
              onClick={() => router.push('/trips')}
              className="flex items-center gap-3 p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm lg:text-base">View All Trips</p>
                <p className="text-xs lg:text-sm text-gray-500">Manage and review all trips</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/audit')}
              className="flex items-center gap-3 p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm lg:text-base">Review Anomalies</p>
                <p className="text-xs lg:text-sm text-gray-500">Check flagged trips</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/drivers')}
              className="flex items-center gap-3 p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left sm:col-span-2 lg:col-span-1"
            >
              <Users className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm lg:text-base">Manage Drivers</p>
                <p className="text-xs lg:text-sm text-gray-500">View driver profiles</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

 