import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const driverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  license_number: z.string().min(5, 'License number must be at least 5 characters'),
  license_expiry: z.string().min(1, 'License expiry date is required'),
  joining_date: z.string().min(1, 'Joining date is required'),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
})

export const tripSchema = z.object({
  driver_id: z.string().min(1, 'Driver is required'),
  date: z.string().min(1, 'Date is required'),
  platform: z.enum(['uber', 'ola', 'rapido', 'other']),
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  departure_time: z.string().min(1, 'Departure time is required'),
  return_time: z.string().optional(),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  distance_km: z.coerce.number().min(0, 'Distance must be positive'),
  fuel_cost: z.coerce.number().min(0, 'Fuel cost must be positive').optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('completed'),
})

export const attendanceSchema = z.object({
  driver_id: z.string().uuid('Invalid driver ID'),
  date: z.string().datetime('Invalid date'),
  status: z.enum(['present', 'absent', 'late', 'half_day']),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  notes: z.string().optional(),
})

export const paymentSchema = z.object({
  driver_id: z.string().uuid('Invalid driver ID'),
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().datetime('Invalid payment date'),
  payment_method: z.string().min(1, 'Payment method is required'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']),
  description: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type DriverFormData = z.infer<typeof driverSchema>
export type TripFormData = z.infer<typeof tripSchema>
export type AttendanceFormData = z.infer<typeof attendanceSchema>
export type PaymentFormData = z.infer<typeof paymentSchema> 