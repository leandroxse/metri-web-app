import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  colorScheme: "blue" | "green" | "amber" | "purple" | "emerald" | "orange" | "rose"
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  onClick?: () => void
}

const colorVariants = {
  blue: {
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
    borderColor: "border-blue-500/20",
    ringColor: "ring-blue-500/30",
    textColor: "text-blue-700 dark:text-blue-300 oled:text-blue-400",
    // OLED-specific optimizations
    oled: {
      gradient: "oled:from-blue-400/15 oled:via-blue-400/8 oled:to-transparent",
      iconBg: "oled:from-blue-400 oled:to-blue-500",
      borderColor: "oled:border-blue-400/30",
      ringColor: "oled:ring-blue-400/40"
    }
  },
  green: {
    gradient: "from-green-500/10 via-green-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-green-500 to-green-600",
    iconColor: "text-white",
    borderColor: "border-green-500/20",
    ringColor: "ring-green-500/30",
    textColor: "text-green-700 dark:text-green-300 oled:text-green-400",
    oled: {
      gradient: "oled:from-green-400/15 oled:via-green-400/8 oled:to-transparent",
      iconBg: "oled:from-green-400 oled:to-green-500",
      borderColor: "oled:border-green-400/30",
      ringColor: "oled:ring-green-400/40"
    }
  },
  amber: {
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    iconColor: "text-white",
    borderColor: "border-amber-500/20",
    ringColor: "ring-amber-500/30",
    textColor: "text-amber-700 dark:text-amber-300 oled:text-amber-400",
    oled: {
      gradient: "oled:from-amber-400/15 oled:via-amber-400/8 oled:to-transparent",
      iconBg: "oled:from-amber-400 oled:to-amber-500",
      borderColor: "oled:border-amber-400/30",
      ringColor: "oled:ring-amber-400/40"
    }
  },
  purple: {
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    iconColor: "text-white",
    borderColor: "border-purple-500/20",
    ringColor: "ring-purple-500/30",
    textColor: "text-purple-700 dark:text-purple-300 oled:text-purple-400",
    oled: {
      gradient: "oled:from-purple-400/15 oled:via-purple-400/8 oled:to-transparent",
      iconBg: "oled:from-purple-400 oled:to-purple-500",
      borderColor: "oled:border-purple-400/30",
      ringColor: "oled:ring-purple-400/40"
    }
  },
  emerald: {
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white",
    borderColor: "border-emerald-500/20",
    ringColor: "ring-emerald-500/30",
    textColor: "text-emerald-700 dark:text-emerald-300 oled:text-emerald-400",
    oled: {
      gradient: "oled:from-emerald-400/15 oled:via-emerald-400/8 oled:to-transparent",
      iconBg: "oled:from-emerald-400 oled:to-emerald-500",
      borderColor: "oled:border-emerald-400/30",
      ringColor: "oled:ring-emerald-400/40"
    }
  },
  orange: {
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
    iconColor: "text-white",
    borderColor: "border-orange-500/20",
    ringColor: "ring-orange-500/30",
    textColor: "text-orange-700 dark:text-orange-300 oled:text-orange-400",
    oled: {
      gradient: "oled:from-orange-400/15 oled:via-orange-400/8 oled:to-transparent",
      iconBg: "oled:from-orange-400 oled:to-orange-500",
      borderColor: "oled:border-orange-400/30",
      ringColor: "oled:ring-orange-400/40"
    }
  },
  rose: {
    gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-gradient-to-br from-rose-500 to-rose-600",
    iconColor: "text-white",
    borderColor: "border-rose-500/20",
    ringColor: "ring-rose-500/30",
    textColor: "text-rose-700 dark:text-rose-300 oled:text-rose-400",
    oled: {
      gradient: "oled:from-rose-400/15 oled:via-rose-400/8 oled:to-transparent",
      iconBg: "oled:from-rose-400 oled:to-rose-500",
      borderColor: "oled:border-rose-400/30",
      ringColor: "oled:ring-rose-400/40"
    }
  }
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  colorScheme,
  trend,
  className,
  onClick
}: MetricCardProps) {
  const colors = colorVariants[colorScheme]
  const isClickable = !!onClick

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden",
        "bg-gradient-to-br",
        colors.gradient,
        colors.oled.gradient,
        "border",
        colors.borderColor,
        colors.oled.borderColor,
        "backdrop-blur-sm",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "dark:bg-gradient-to-br dark:from-gray-900/90 dark:via-gray-800/50 dark:to-transparent",
        "oled:bg-gradient-to-br oled:from-black/50 oled:via-black/20 oled:to-transparent",
        "oled:shadow-none oled:shadow-white/5",
        isClickable && [
          "cursor-pointer",
          "hover:scale-[1.02]",
          "active:scale-[0.98]",
          "hover:ring-2",
          colors.ringColor,
          colors.oled.ringColor
        ],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 oled:opacity-30">
          <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-transparent oled:from-white/20" />
          <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-tr from-white/5 to-transparent oled:from-white/10" />
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {/* Icon Container */}
              <div className={cn(
                "flex items-center justify-center",
                "w-10 h-10 rounded-xl",
                "shadow-lg shadow-black/10",
                "oled:shadow-white/20",
                colors.iconBg,
                colors.oled.iconBg,
                "group-hover:scale-110 transition-transform duration-300"
              )}>
                <Icon className={cn("w-5 h-5", colors.iconColor, "oled:text-black")} />
              </div>
              
              {/* Trend Indicator */}
              {trend && (
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  trend.isPositive 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 oled:bg-green-400/20 oled:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 oled:bg-red-400/20 oled:text-red-400"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </div>
              )}
            </div>

            <div className="space-y-1">
              {/* Value */}
              <div className="text-2xl font-bold text-gray-900 dark:text-white oled:text-white leading-none">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              
              {/* Title */}
              <div className={cn(
                "text-sm font-medium",
                colors.textColor
              )}>
                {title}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        {isClickable && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 oled:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </CardContent>
    </Card>
  )
}

// Hook para formatação de valores monetários
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Variante compacta para espaços menores
export function CompactMetricCard({
  title,
  value,
  icon: Icon,
  colorScheme,
  className,
  onClick
}: Omit<MetricCardProps, 'trend'>) {
  const colors = colorVariants[colorScheme]
  const isClickable = !!onClick

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden",
        "bg-gradient-to-br",
        colors.gradient,
        colors.oled.gradient,
        "border",
        colors.borderColor,
        colors.oled.borderColor,
        "backdrop-blur-sm",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "oled:bg-gradient-to-br oled:from-black/50 oled:via-black/20 oled:to-transparent",
        "oled:shadow-none oled:shadow-white/5",
        isClickable && [
          "cursor-pointer",
          "hover:scale-[1.02]",
          "active:scale-[0.98]",
          "hover:ring-2",
          colors.ringColor,
          colors.oled.ringColor
        ],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center",
            "w-8 h-8 rounded-lg",
            "shadow-md shadow-black/10",
            "oled:shadow-white/20",
            colors.iconBg,
            colors.oled.iconBg,
            "group-hover:scale-110 transition-transform duration-300"
          )}>
            <Icon className={cn("w-4 h-4", colors.iconColor, "oled:text-black")} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-gray-900 dark:text-white oled:text-white leading-none">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <div className={cn(
              "text-xs font-medium truncate",
              colors.textColor
            )}>
              {title}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}