// [ARQUIVO: configuracoes/page.tsx]
// Função: Página de configurações com switch de temas e outras opções
// Interações: usado pelo sistema de navegação
// Observação: Controla preferências do usuário

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Smartphone, Monitor, Palette, Info, Download, Trash2, Circle } from "lucide-react"
import { useTheme } from "next-themes"

export default function ConfiguracoesPage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const [storageUsed, setStorageUsed] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    // Calcular uso de armazenamento local
    let totalSize = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    setStorageUsed(Math.round(totalSize / 1024)) // KB
  }, [])

  const clearLocalStorage = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.")) {
      localStorage.clear()
      setStorageUsed(0)
      window.location.reload()
    }
  }

  if (!mounted) {
    return null
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência no Metri</p>
        </div>

        <div className="space-y-6">
          {/* Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Escolha como o aplicativo deve aparecer para você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Tema Claro</p>
                    <p className="text-sm text-muted-foreground">Interface com fundo claro</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "light"}
                  onCheckedChange={() => setTheme("light")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Tema Escuro</p>
                    <p className="text-sm text-muted-foreground">Interface com fundo escuro</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={() => setTheme("dark")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Circle className="w-5 h-5 text-black fill-black" />
                  <div>
                    <p className="font-medium">OLED True Black</p>
                    <p className="text-sm text-muted-foreground">Preto absoluto para telas OLED</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "oled"}
                  onCheckedChange={() => setTheme("oled")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Automático</p>
                    <p className="text-sm text-muted-foreground">Segue o tema do sistema</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "system"}
                  onCheckedChange={() => setTheme("system")}
                />
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    currentTheme === "dark" ? "bg-blue-500" : 
                    theme === "oled" ? "bg-black" : 
                    "bg-orange-500"
                  }`} />
                  <span className="text-sm font-medium">
                    Tema atual: {
                      theme === "oled" ? "OLED True Black" :
                      currentTheme === "dark" ? "Escuro" : "Claro"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PWA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Aplicativo Web
              </CardTitle>
              <CardDescription>
                Instale o Metri como um aplicativo nativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Instalar Metri</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione à tela inicial para acesso rápido
                  </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  PWA
                </Badge>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  O botão de instalação aparecerá automaticamente quando disponível no seu navegador.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Armazenamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Dados e Armazenamento
              </CardTitle>
              <CardDescription>
                Gerencie os dados armazenados localmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Armazenamento Local</p>
                  <p className="text-sm text-muted-foreground">
                    {storageUsed} KB utilizados
                  </p>
                </div>
                <Badge variant="outline">{storageUsed} KB</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Limpar Dados</p>
                  <p className="text-sm text-muted-foreground">
                    Remove todos os dados salvos localmente
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearLocalStorage}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sobre */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Sobre o Metri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Versão</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tecnologia</span>
                  <span className="text-sm font-medium">Next.js + SQLite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <span className="text-sm font-medium">PWA (Progressive Web App)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
