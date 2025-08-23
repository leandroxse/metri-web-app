"use client"

import { useState, useEffect } from "react"
import { X, Share, Plus, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Detectar se já está rodando como PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Mostrar prompt apenas se for iOS, não for PWA e não foi rejeitado
    const dismissed = localStorage.getItem('ios-install-dismissed')
    if (iOS && !standalone && !dismissed) {
      // Mostrar após 3 segundos
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem('ios-install-dismissed', 'true')
  }

  const laterPrompt = () => {
    setShowPrompt(false)
    // Mostrar novamente em 7 dias
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    localStorage.setItem('ios-install-dismissed', futureDate.toISOString())
  }

  if (!isIOS || isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm mx-auto bg-white dark:bg-gray-900 border shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Instalar METRI
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adicione METRI à sua tela inicial para acesso rápido
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">1</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Toque no botão</span>
                <Share className="w-4 h-4 text-blue-500" />
                <span>na barra inferior</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">2</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Selecione</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                  <Plus className="w-3 h-3" />
                  <span>Adicionar à Tela Inicial</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">3</span>
              </div>
              <span>Confirme tocando em "Adicionar"</span>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={laterPrompt}
              className="flex-1"
            >
              Mais tarde
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={dismissPrompt}
              className="px-3"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}