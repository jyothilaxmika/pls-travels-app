export interface Database {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          license_number: string
          address: string | null
          status: 'active' | 'inactive' | 'on_trip' | 'off_duty'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          license_number: string
          address?: string | null
          status?: 'active' | 'inactive' | 'on_trip' | 'off_duty'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          license_number?: string
          address?: string | null
          status?: 'active' | 'inactive' | 'on_trip' | 'off_duty'
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          driver_id: string
          destination: string
          departure_date: string
          return_date: string | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          destination: string
          departure_date: string
          return_date?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          destination?: string
          departure_date?: string
          return_date?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          driver_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'half_day'
          check_in_time: string | null
          check_out_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'half_day'
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late' | 'half_day'
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          driver_id: string
          amount: number
          payment_date: string
          payment_method: string
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          amount: number
          payment_date: string
          payment_method: string
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 