"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface PersonPayment {
  personId: string
  personName: string
  categoryId: string
  categoryName: string
  categoryColor: string
  eventId: string
  amount: number
  isPaid: boolean
  paymentId?: string
}

interface PaymentCardProps {
  payment: PersonPayment
  onToggle: () => void
  onAmountChange: (amount: number) => void
  isPending?: boolean
}

export function PaymentCard({ payment, onToggle, onAmountChange, isPending = false }: PaymentCardProps) {
  return (
    <motion.div
      onClick={(e) => {
        // Só toggle se NÃO clicar no input
        const target = e.target as HTMLElement
        if (!target.closest('input')) {
          onToggle()
        }
      }}
      className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
        payment.isPaid
          ? 'bg-green-50 dark:bg-green-950/20 oled:bg-green-400/10 border border-green-200 dark:border-green-800 oled:border-green-400/30'
          : 'bg-gray-50 dark:bg-card oled:bg-white/5 border border-gray-200 dark:border-border oled:border-white/20'
      } ${isPending ? 'opacity-60 cursor-not-allowed' : 'opacity-100'}`}
      variants={{
        initial: { opacity: 0, y: 10, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 }
      }}
      whileHover={{
        scale: isPending ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: isPending ? 1 : 0.98,
        transition: { duration: 0.1 }
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <motion.div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            payment.isPaid
              ? 'bg-green-500 border-green-500 text-white oled:bg-green-400 oled:border-green-400'
              : 'border-gray-300 hover:border-emerald-400 oled:border-gray-500 oled:hover:border-emerald-400'
          }`}
          animate={isPending ? { rotate: 360 } : {}}
          transition={{ type: "spring", stiffness: 400, duration: isPending ? 0.8 : 0 }}
        >
          {payment.isPaid && <CheckCircle2 className="w-3 h-3" />}
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900 dark:text-foreground oled:text-white truncate">
            {payment.personName}
          </p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground oled:text-gray-400">
            {payment.categoryName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-600 dark:text-muted-foreground oled:text-gray-400 pointer-events-none">R$</span>
        <motion.input
          type="number"
          value={payment.amount}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          onClick={(e) => e.stopPropagation()}
          className="w-16 h-7 text-right text-xs border border-gray-300 dark:border-border oled:border-white/30 rounded px-2 bg-white dark:bg-background oled:bg-black oled:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
          step="0.01"
          min="0"
          whileFocus={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        />
      </div>
    </motion.div>
  )
}
