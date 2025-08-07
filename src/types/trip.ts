import { Driver } from './driver'

export interface Trip {
  id: string
  driver_id: string
  destination: string
  departure_date: string
  return_date?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_amount: number
  description?: string
  created_at: string
  updated_at: string
}

export interface TripWithDriver extends Trip {
  drivers?: Driver
}

export interface TripFilters {
  status?: string
  driver_id?: string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
}

export interface TripStats {
  total_trips: number
  completed_trips: number
  pending_trips: number
  cancelled_trips: number
  total_revenue: number
  average_trip_amount: number
} 