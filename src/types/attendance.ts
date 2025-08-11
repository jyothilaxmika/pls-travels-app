export interface Attendance {
  id: string
  driver_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'half_day'
  check_in_time?: string
  check_out_time?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface AttendanceWithDriver extends Attendance {
  drivers?: {
    id: string
    name: string
    email?: string
    phone: string
  }
}

export interface AttendanceStats {
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  half_days: number
  attendance_rate: number
}