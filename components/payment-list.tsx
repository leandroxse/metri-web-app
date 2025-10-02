"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircleDollarSign, Users } from "lucide-react"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { PaymentCard } from "@/components/payment-card"

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

interface CategoryGroup {
  categoryId: string
  categoryName: string
  categoryColor: string
  payments: PersonPayment[]
}

interface PaymentListProps {
  selectedEvent: string | null
  payments: PersonPayment[]
  onPaymentToggle: (personId: string) => void
  onAmountChange: (personId: string, amount: number) => void
}

export function PaymentList({
  selectedEvent,
  payments,
  onPaymentToggle,
  onAmountChange
}: PaymentListProps) {
  // Agrupar pessoas por categoria
  const groupByCategory = (eventPayments: PersonPayment[]): CategoryGroup[] => {
    const grouped = new Map<string, PersonPayment[]>()

    eventPayments.forEach(payment => {
      const key = payment.categoryId
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(payment)
    })

    return Array.from(grouped.entries()).map(([categoryId, payments]) => ({
      categoryId,
      categoryName: payments[0].categoryName,
      categoryColor: payments[0].categoryColor,
      payments
    }))
  }

  const categoryGroups = groupByCategory(payments)

  if (!selectedEvent) {
    return (
      <AnimatedContainer delay={0.8}>
        <Card className="shadow-sm border border-border">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
              <CircleDollarSign className="w-12 h-12 mx-auto text-gray-300 oled:text-gray-400 mb-3" />
            </motion.div>
            <motion.p
              className="text-gray-600 dark:text-muted-foreground oled:text-gray-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              Selecione um evento para gerenciar pagamentos
            </motion.p>
            <motion.p
              className="text-sm text-gray-500 dark:text-muted-foreground oled:text-gray-400 mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              Toque em um evento da lista ao lado
            </motion.p>
          </CardContent>
        </Card>
      </AnimatedContainer>
    )
  }

  return (
    <AnimatedContainer delay={0.8}>
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <CircleDollarSign className="w-4 h-4 text-emerald-600" />
            </motion.div>
            Gerenciar Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4"
            initial="initial"
            animate="animate"
            variants={{
              initial: {},
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {categoryGroups.length === 0 ? (
              <motion.div
                className="col-span-full text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Users className="w-8 h-8 mx-auto text-gray-400 oled:text-gray-300 mb-2" />
                </motion.div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground oled:text-gray-300">
                  Este evento não possui equipe atribuída
                </p>
              </motion.div>
            ) : (
              categoryGroups.map((group, groupIndex) => (
                <motion.div
                  key={group.categoryId}
                  className="space-y-3"
                  variants={{
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.categoryColor }}
                      whileHover={{ scale: 1.3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    />
                    <h4 className="font-medium text-sm text-gray-900 dark:text-foreground oled:text-white">
                      {group.categoryName}
                    </h4>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + groupIndex * 0.1 }}
                    >
                      <Badge variant="outline" className="text-xs">
                        <AnimatedNumber value={group.payments.length} />
                      </Badge>
                    </motion.div>
                  </div>

                  <motion.div
                    className="space-y-2"
                    initial="initial"
                    animate="animate"
                    variants={{
                      initial: {},
                      animate: {
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                  >
                    {group.payments.map((payment) => (
                      <PaymentCard
                        key={payment.personId}
                        payment={payment}
                        onToggle={() => onPaymentToggle(payment.personId)}
                        onAmountChange={(amount) => onAmountChange(payment.personId, amount)}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ))
            )}
          </motion.div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  )
}
