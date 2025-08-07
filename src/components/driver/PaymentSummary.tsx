"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { format } from 'date-fns'
import { DollarSign, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  status: string
  description?: string
  driver_id: string
  user_id: string
  created_at: string
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  averagePayment: number
  paymentMethods: Record<string, number>
}

export default function PaymentSummary({ driverId }: { driverId: string }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    averagePayment: 0,
    paymentMethods: {}
  })

  useEffect(() => {
    fetchPayments()
  }, [driverId])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("driver_id", driverId)
        .order("payment_date", { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
        return
      }

      const paymentsData = data || []
      setPayments(paymentsData)
      calculateStats(paymentsData)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentsData: Payment[]) => {
    const totalPayments = paymentsData.length
    const totalAmount = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const paidAmount = paymentsData
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const pendingAmount = paymentsData
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0

    const paymentMethods = paymentsData.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({
      totalPayments,
      totalAmount,
      paidAmount,
      pendingAmount,
      averagePayment,
      paymentMethods
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPaymentMethodBadge = (method: string) => {
    const methodColors = {
      cash: 'bg-green-100 text-green-800',
      bank_transfer: 'bg-blue-100 text-blue-800',
      upi: 'bg-purple-100 text-purple-800',
      cheque: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${methodColors[method as keyof typeof methodColors] || methodColors.other}`}>
        {method.replace('_', ' ').toUpperCase()}
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
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Summary</h2>
          </div>
          <div className="text-sm text-gray-500">
            {payments.length} payments
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPayments}</div>
            <div className="text-sm text-gray-600">Total Payments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${stats.totalAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">${stats.pendingAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Pending Amount</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${stats.averagePayment.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Avg. Payment</div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">No payment records for this driver yet.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        ${payment.amount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentMethodBadge(payment.payment_method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {payment.description || 'No description'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Methods Breakdown */}
      {Object.keys(stats.paymentMethods).length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Methods</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.paymentMethods).map(([method, count]) => (
              <div key={method} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                {getPaymentMethodBadge(method)}
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 