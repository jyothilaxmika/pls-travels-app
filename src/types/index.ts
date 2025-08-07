export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface TravelBooking {
  id: string
  customer_name: string
  destination: string
  travel_date: string
  return_date?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_amount: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  created_at: string
} 