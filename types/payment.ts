export interface Payment {
  id: string
  event_id: string
  person_id: string
  amount: number
  is_paid: boolean
  paid_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface EventPayment {
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  totalAmount: number
  totalPaid: number
  totalPending: number
  payments: Payment[]
  paymentsByCategory: Map<string, Payment[]>
}

export interface PaymentSummary {
  totalEvents: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  totalPayments: number
  paidPayments: number
  pendingPayments: number
}
