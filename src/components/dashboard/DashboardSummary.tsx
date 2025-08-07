"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  DollarSign, MapPin, Fuel, Users, Calendar, Activity,
  Car, Clock, Zap, Eye, Shield
} from 'lucide-react'

interface DashboardData {
  totalTrips: number
  totalKms: number
  totalEarnings: number
  totalFuelUsed: number
  totalExpenses: number
  pendingDues: number
  activeDrivers: number
  anomalies: number
  verifiedTrips: number
  platformBreakdown: Array<{ name: string; value: number }>
  dailyTrips: Array<{ date: string; trips: number; earnings: number }>
  fuelEfficiency: Array<{ date: string; kmpl: number; fuelCost: number }>
  shiftDistribution: Array<{ shift: string; trips: number; earnings: number }>
  anomalyDetails: Array<{
    id: string
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
    tripId?: string
    driverId?: string
  }>
}

export default function DashboardSummary() {
  const { user, loading } = useAuth()
  const [data, setData] = useState<DashboardData>({
    totalTrips: 0,
    totalKms: 0,
    totalEarnings: 0,
    totalFuelUsed: 0,
    totalExpenses: 0,
    pendingDues: 0,
    activeDrivers: 0,
    anomalies: 0,
    verifiedTrips: 0,
    platformBreakdown: [],
    dailyTrips: [],
    fuelEfficiency: [],
    shiftDistribution: [],
    anomalyDetails: []
  })
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')

  useEffect(() => {
    if (user && !loading) {
      fetchDashboardData()
    }
  }, [user, loading, timeRange])

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true)
      
      // Fetch trips data
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .order('date', { ascending: false })

      // Fetch drivers data
      const { data: driversData } = await supabase
        .from('drivers')
        .select('*')

      // Fetch payments data
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')

      if (tripsData && driversData && paymentsData) {
        processDashboardData(tripsData, driversData, paymentsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  const processDashboardData = (trips: any[], drivers: any[], payments: any[]) => {
    // Calculate basic stats
    const totalTrips = trips.length
    const totalKms = trips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0)
    const totalEarnings = trips.reduce((sum, trip) => sum + (trip.amount || 0), 0)
    const totalFuelUsed = trips.reduce((sum, trip) => sum + (trip.fuel_cost || 0), 0)
    const totalExpenses = totalFuelUsed // Simplified for now
    const pendingDues = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
    const activeDrivers = drivers.filter(d => d.status === 'active').length
    const verifiedTrips = trips.filter(t => t.audit_status === 'verified').length

    // Platform breakdown
    const platformBreakdown = trips.reduce((acc, trip) => {
      const platform = trip.platform || 'other'
      const existing = acc.find((p: { name: string; value: number }) => p.name === platform)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: platform, value: 1 })
      }
      return acc
    }, [] as Array<{ name: string; value: number }>)

    // Daily trips (last 30 days)
    const dailyTrips = generateDailyTripsData(trips, 30)

    // Fuel efficiency
    const fuelEfficiency = generateFuelEfficiencyData(trips)

    // Shift distribution
    const shiftDistribution = generateShiftDistributionData(trips)

    // Anomaly detection
    const anomalies = detectAnomalies(trips)
    const anomalyDetails = generateAnomalyDetails(trips)

    setData({
      totalTrips,
      totalKms,
      totalEarnings,
      totalFuelUsed,
      totalExpenses,
      pendingDues,
      activeDrivers,
      anomalies: anomalies.length,
      verifiedTrips,
      platformBreakdown,
      dailyTrips,
      fuelEfficiency,
      shiftDistribution,
      anomalyDetails
    })
  }

  const generateDailyTripsData = (trips: any[], days: number) => {
    const data = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTrips = trips.filter(trip => trip.date === dateStr)
      const dayEarnings = dayTrips.reduce((sum, trip) => sum + (trip.amount || 0), 0)
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        trips: dayTrips.length,
        earnings: dayEarnings
      })
    }
    
    return data
  }

  const generateFuelEfficiencyData = (trips: any[]) => {
    return trips
      .filter(trip => trip.fuel_cost && trip.distance_km)
      .map(trip => ({
        date: new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        kmpl: trip.distance_km / (trip.fuel_cost / 100), // Assuming 100 rupees per liter
        fuelCost: trip.fuel_cost
      }))
      .slice(-10) // Last 10 trips
  }

  const generateShiftDistributionData = (trips: any[]) => {
    const shifts = trips.reduce((acc, trip) => {
      const shift = trip.departure_time ? 
        (parseInt(trip.departure_time.split(':')[0]) < 12 ? 'Morning' : 'Evening') : 'Unknown'
      
      const existing = acc.find((s: { shift: string; trips: number; earnings: number }) => s.shift === shift)
      if (existing) {
        existing.trips += 1
        existing.earnings += trip.amount || 0
      } else {
        acc.push({ shift, trips: 1, earnings: trip.amount || 0 })
      }
      return acc
    }, [] as Array<{ shift: string; trips: number; earnings: number }>)

    return shifts
  }

  const detectAnomalies = (trips: any[]) => {
    const anomalies: Array<{ tripId: string; type: string; severity: string }> = []
    
    trips.forEach(trip => {
      // Fuel anomaly (> 25L in one trip)
      if (trip.fuel_cost && trip.fuel_cost > 2500) { // Assuming 100 rupees per liter
        anomalies.push({ tripId: trip.id, type: 'high_fuel', severity: 'high' })
      }
      
      // Distance anomaly (< 3km or > 300km)
      if (trip.distance_km) {
        if (trip.distance_km < 3 || trip.distance_km > 300) {
          anomalies.push({ tripId: trip.id, type: 'distance_anomaly', severity: 'medium' })
        }
      }
      
      // Missing photo for high-value trip
      if (trip.amount > 1000 && !trip.photo_url) {
        anomalies.push({ tripId: trip.id, type: 'missing_photo', severity: 'medium' })
      }
    })
    
    return anomalies
  }

  const generateAnomalyDetails = (trips: any[]) => {
    const details: Array<{
      id: string
      type: string
      severity: 'low' | 'medium' | 'high'
      description: string
      tripId: string
      driverId: string
    }> = []
    
    trips.forEach(trip => {
      if (trip.fuel_cost && trip.fuel_cost > 2500) {
        details.push({
          id: trip.id,
          type: 'High Fuel Usage',
          severity: 'high' as const,
          description: `Fuel cost of ₹${trip.fuel_cost} for ${trip.distance_km}km trip`,
          tripId: trip.id,
          driverId: trip.driver_id
        })
      }
      
      if (trip.distance_km && (trip.distance_km < 3 || trip.distance_km > 300)) {
        details.push({
          id: trip.id,
          type: 'Distance Anomaly',
          severity: 'medium' as const,
          description: `${trip.distance_km}km trip on ${trip.date}`,
          tripId: trip.id,
          driverId: trip.driver_id
        })
      }
      
      if (trip.amount > 1000 && !trip.photo_url) {
        details.push({
          id: trip.id,
          type: 'Missing Photo',
          severity: 'medium' as const,
          description: `High-value trip (₹${trip.amount}) without dashboard photo`,
          tripId: trip.id,
          driverId: trip.driver_id
        })
      }
    })
    
    return details.slice(0, 5) // Show top 5 anomalies
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (dashboardLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of your travel operations</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{data.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total KMs</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalKms.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Fuel className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fuel Used</p>
              <p className="text-2xl font-bold text-gray-900">₹{data.totalFuelUsed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trips Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Trip Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.dailyTrips}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="trips" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="earnings" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.platformBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.platformBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.fuelEfficiency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="kmpl" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Shift Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.shiftDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shift" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earnings" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Anomaly Detection</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{data.anomalies} anomalies detected</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {data.anomalies > 0 ? 'Needs Review' : 'All Clear'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {data.anomalyDetails.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Anomalies Detected</h4>
              <p className="text-gray-500">All trips appear to be within normal parameters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.anomalyDetails.map((anomaly) => (
                <div key={anomaly.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      anomaly.severity === 'high' ? 'bg-red-100 text-red-600' :
                      anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{anomaly.type}</h4>
                      <p className="text-sm text-gray-600">{anomaly.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                      Review
                    </button>
                    <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{data.activeDrivers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Dues</p>
              <p className="text-2xl font-bold text-gray-900">₹{data.pendingDues.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Trips</p>
              <p className="text-2xl font-bold text-gray-900">{data.verifiedTrips}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  )
} 