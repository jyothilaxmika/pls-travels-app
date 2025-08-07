"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { format } from 'date-fns'
import { MapPin, DollarSign, Clock, Calendar, Filter, Search, TrendingUp, Image, Eye } from 'lucide-react'
import { detectTripAnomalies } from "@/lib/auditUtils"
import { TripAuditBadge } from "@/components/trip/TripAuditBadge"

interface Trip {
  id: string
  date: string
  platform: string
  destination: string
  amount: number
  distance_km: number
  departure_time: string
  return_time?: string
  status: string
  created_at: string
  fuel_cost?: number
  notes?: string
  photo_url?: string
}

interface TripStats {
  totalTrips: number
  totalEarnings: number
  totalDistance: number
  averageTripValue: number
  platformBreakdown: Record<string, number>
}

export default function TripLogs({ driverId }: { driverId: string }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TripStats>({
    totalTrips: 0,
    totalEarnings: 0,
    totalDistance: 0,
    averageTripValue: 0,
    platformBreakdown: {}
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    fetchTrips()
  }, [driverId])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("driver_id", driverId)
        .order("date", { ascending: false })

      if (error) {
        console.error('Error fetching trips:', error)
        return
      }

      const tripsData = data || []
      setTrips(tripsData)
      calculateStats(tripsData)
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tripsData: Trip[]) => {
    const totalTrips = tripsData.length
    const totalEarnings = tripsData.reduce((sum, trip) => sum + (trip.amount || 0), 0)
    const totalDistance = tripsData.reduce((sum, trip) => sum + (trip.distance_km || 0), 0)
    const averageTripValue = totalTrips > 0 ? totalEarnings / totalTrips : 0

    const platformBreakdown = tripsData.reduce((acc, trip) => {
      acc[trip.platform] = (acc[trip.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({
      totalTrips,
      totalEarnings,
      totalDistance,
      averageTripValue,
      platformBreakdown
    })
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = searchTerm === '' || 
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.platform.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlatform = platformFilter === 'all' || trip.platform === platformFilter
    
    const matchesDate = dateFilter === 'all' || (() => {
      const tripDate = new Date(trip.date)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      switch (dateFilter) {
        case 'today':
          return tripDate.toDateString() === today.toDateString()
        case 'yesterday':
          return tripDate.toDateString() === yesterday.toDateString()
        case 'lastWeek':
          return tripDate >= lastWeek
        case 'lastMonth':
          return tripDate >= lastMonth
        default:
          return true
      }
    })()

    return matchesSearch && matchesPlatform && matchesDate
  })

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      confirmed: 'bg-blue-100 text-blue-800'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPlatformIcon = (platform: string) => {
    const platformColors = {
      uber: 'bg-black text-white',
      ola: 'bg-yellow-500 text-white',
      rapido: 'bg-green-500 text-white',
      other: 'bg-gray-500 text-white'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${platformColors[platform as keyof typeof platformColors] || 'bg-gray-100 text-gray-800'}`}>
        {platform.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Trip History</h2>
          </div>
          <div className="text-sm text-gray-500">
            {filteredTrips.length} of {trips.length} trips
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTrips}</div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalDistance.toFixed(0)} km</div>
            <div className="text-sm text-gray-600">Total Distance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">${stats.averageTripValue.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Avg. Trip Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips by destination or platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Platform Filter */}
          <div className="md:w-48">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Platforms</option>
              <option value="uber">Uber</option>
              <option value="ola">Ola</option>
              <option value="rapido">Rapido</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="md:w-48">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="lastWeek">Last 7 Days</option>
              <option value="lastMonth">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="overflow-x-auto">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-500">
              {searchTerm || platformFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'This driver has no trip records yet.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Status
                 </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(trip.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trip.departure_time}
                          {trip.return_time && ` - ${trip.return_time}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPlatformIcon(trip.platform)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{trip.destination}</div>
                    {trip.notes && (
                      <div className="text-xs text-gray-500 mt-1">{trip.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        ${trip.amount}
                      </span>
                    </div>
                    {trip.fuel_cost && (
                      <div className="text-xs text-gray-500">
                        Fuel: ${trip.fuel_cost}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-900">
                        {trip.distance_km} km
                      </span>
                    </div>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                     {getStatusBadge(trip.status)}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     {trip.photo_url ? (
                       <div className="flex items-center gap-2">
                         <img
                           src={trip.photo_url}
                           alt="Dashboard"
                           className="h-12 w-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                           onClick={() => window.open(trip.photo_url, '_blank')}
                         />
                         <button
                           onClick={() => window.open(trip.photo_url, '_blank')}
                           className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                           title="View full size"
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                       </div>
                     ) : (
                       <div className="flex items-center justify-center h-12 w-12 bg-gray-100 rounded-lg border border-gray-200">
                         <Image className="h-5 w-5 text-gray-400" />
                       </div>
                                           )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TripAuditBadge anomalies={detectTripAnomalies(trip)} />
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        )}
      </div>

      {/* Platform Breakdown */}
      {Object.keys(stats.platformBreakdown).length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Platform Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.platformBreakdown).map(([platform, count]) => (
              <div key={platform} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                {getPlatformIcon(platform)}
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 