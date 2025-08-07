export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  license_number: string
  address?: string
  status: 'active' | 'inactive' | 'on_trip' | 'off_duty'
  created_at: string
  updated_at: string
}

export interface DriverWithTrips extends Driver {
  trips?: Trip[]
  attendance?: Attendance[]
}

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

export interface Attendance {
  id: string
  driver_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'half_day'
  check_in_time?: string
  check_out_time?: string
  notes?: string
  created_at: string
  updated_at: string
} 