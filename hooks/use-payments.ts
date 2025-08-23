// [ARQUIVO: use-payments.ts]
// Função: Hook para gerenciamento de pagamentos
// Interações: usa paymentClientService
// Observação: Estado reativo para operações CRUD de pagamentos

import { useState, useEffect } from 'react'
// Usar Supabase em vez do SQLite
import { paymentClientService } from '@/lib/supabase/client-services'
import type { Payment } from '@/types/payment'

export function usePayments(eventId?: string) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar pagamentos
  const loadPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      // Se há eventId específico, buscar por evento, senão buscar todos
      const data = eventId 
        ? await paymentClientService.getByEvent(eventId)
        : await paymentClientService.getAll()
      setPayments(data)
    } catch (err) {
      setError('Erro ao carregar pagamentos')
      console.error('Erro ao carregar pagamentos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Criar novo pagamento
  const createPayment = async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'paidAt'>) => {
    try {
      const newPayment = await paymentClientService.create(payment)
      if (newPayment) {
        setPayments(prev => [...prev, newPayment])
        return newPayment
      }
      return null
    } catch (err) {
      setError('Erro ao criar pagamento')
      console.error('Erro ao criar pagamento:', err)
      return null
    }
  }

  // Atualizar pagamento
  const updatePayment = async (id: string, updates: { amount?: number; isPaid?: boolean }) => {
    try {
      const updatedPayment = await paymentClientService.update(id, updates)
      if (updatedPayment) {
        setPayments(prev => 
          prev.map(payment => 
            payment.id === id ? updatedPayment : payment
          )
        )
        return updatedPayment
      }
      return null
    } catch (err) {
      setError('Erro ao atualizar pagamento')
      console.error('Erro ao atualizar pagamento:', err)
      return null
    }
  }

  // Excluir pagamento
  const deletePayment = async (id: string) => {
    try {
      const success = await paymentClientService.delete(id)
      if (success) {
        setPayments(prev => prev.filter(payment => payment.id !== id))
        return true
      }
      return false
    } catch (err) {
      setError('Erro ao excluir pagamento')
      console.error('Erro ao excluir pagamento:', err)
      return false
    }
  }

  // Criar pagamentos em lote
  const createBatchPayments = async (eventId: string, teamData: any[], categories: any[]) => {
    try {
      const newPayments = await paymentClientService.createBatch(eventId, teamData, categories)
      if (newPayments.length > 0) {
        setPayments(prev => [...prev, ...newPayments])
        return newPayments
      }
      return []
    } catch (err) {
      setError('Erro ao criar pagamentos em lote')
      console.error('Erro ao criar pagamentos em lote:', err)
      return []
    }
  }

  // Obter estatísticas de pagamentos
  const getPaymentStats = () => {
    if (!payments || !Array.isArray(payments)) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        paidCount: 0,
        unpaidCount: 0,
        totalCount: 0
      }
    }

    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const paidAmount = payments
      .filter(payment => payment.isPaid)
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const unpaidAmount = totalAmount - paidAmount
    const paidCount = payments.filter(payment => payment.isPaid).length
    const unpaidCount = payments.length - paidCount

    return {
      totalAmount,
      paidAmount,
      unpaidAmount,
      paidCount,
      unpaidCount,
      totalCount: payments.length
    }
  }

  // Carregar pagamentos na inicialização
  useEffect(() => {
    loadPayments()
  }, [eventId])

  return {
    payments,
    loading,
    error,
    loadPayments,
    createPayment,
    updatePayment,
    deletePayment,
    createBatchPayments,
    getPaymentStats
  }
}
