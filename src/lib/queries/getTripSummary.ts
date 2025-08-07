import { supabase } from '@/lib/supabase'

export interface TripSummary {
  total_trips: number
  total_km: number
  total_fuel: number
  total_earning: number
  anomaly_count: number
  verified_trips: number
  needs_review_trips: number
  average_trip_value: number
  total_drivers: number
}

export async function getTripSummary(): Promise<TripSummary | null> {
  try {
    // Get basic trip statistics
    const { data: tripStats, error: tripError } = await supabase
      .from('trips')
      .select('distance_km, fuel_cost, amount, anomaly_flag, audit_status')

    if (tripError) {
      console.error('Error fetching trip stats:', tripError)
      return null
    }

    // Get driver count
    const { data: driverStats, error: driverError } = await supabase
      .from('drivers')
      .select('id', { count: 'exact' })

    if (driverError) {
      console.error('Error fetching driver stats:', driverError)
      return null
    }

    const trips = tripStats || []
    
    const summary: TripSummary = {
      total_trips: trips.length,
      total_km: trips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0),
      total_fuel: trips.reduce((sum, trip) => sum + (trip.fuel_cost || 0), 0),
      total_earning: trips.reduce((sum, trip) => sum + (trip.amount || 0), 0),
      anomaly_count: trips.filter(trip => trip.anomaly_flag).length,
      verified_trips: trips.filter(trip => trip.audit_status === 'verified').length,
      needs_review_trips: trips.filter(trip => trip.audit_status === 'needs_review').length,
      average_trip_value: trips.length > 0 ? trips.reduce((sum, trip) => sum + (trip.amount || 0), 0) / trips.length : 0,
      total_drivers: driverStats?.length || 0
    }

    return summary
  } catch (error) {
    console.error('Error in getTripSummary:', error)
    return null
  }
}

export async function getDriverRankings(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        driver_id,
        distance_km,
        amount,
        drivers (
          name,
          phone
        )
      `)
      .order('amount', { ascending: false })

    if (error) {
      console.error('Error fetching driver rankings:', error)
      return []
    }

    // Group by driver and calculate totals
    const driverStats = data?.reduce((acc, trip) => {
      const driverId = trip.driver_id
      if (!acc[driverId]) {
        acc[driverId] = {
          driver_id: driverId,
          driver_name: trip.drivers?.name || 'Unknown',
          driver_phone: trip.drivers?.phone || '',
          total_trips: 0,
          total_km: 0,
          total_earning: 0
        }
      }
      
      acc[driverId].total_trips++
      acc[driverId].total_km += trip.distance_km || 0
      acc[driverId].total_earning += trip.amount || 0
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(driverStats || {}).sort((a, b) => b.total_earning - a.total_earning)
  } catch (error) {
    console.error('Error in getDriverRankings:', error)
    return []
  }
}

export async function getRecentAnomalies(limit: number = 5): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        date,
        distance_km,
        fuel_cost,
        amount,
        notes,
        anomaly_flag,
        audit_status,
        drivers (
          name,
          phone
        )
      `)
      .eq('anomaly_flag', true)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent anomalies:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getRecentAnomalies:', error)
    return []
  }
}

export async function getFuelKmChartData(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('date, distance_km, fuel_cost')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching chart data:', error)
      return []
    }

    // Group by date and calculate daily totals
    const dailyStats = data?.reduce((acc, trip) => {
      const date = trip.date
      if (!acc[date]) {
        acc[date] = {
          date,
          total_km: 0,
          total_fuel: 0,
          trip_count: 0
        }
      }
      
      acc[date].total_km += trip.distance_km || 0
      acc[date].total_fuel += trip.fuel_cost || 0
      acc[date].trip_count++
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(dailyStats || {}).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error('Error in getFuelKmChartData:', error)
    return []
  }
} 