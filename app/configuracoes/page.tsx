// [ARQUIVO: configuracoes/page.tsx]
// Função: Página de configurações com switch de temas e outras opções
// Interações: usado pelo sistema de navegação
// Observação: Controla preferências do usuário

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Monitor, Palette, Circle, Image as ImageIcon, Users } from "lucide-react"
import { useTheme } from "next-themes"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize sua experiência no Metri</p>
        </div>

        {/* Grid Layout para Desktop/Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categorias e Equipes */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Categorias e Equipes
              </CardTitle>
              <CardDescription>
                Gerencie categorias profissionais e colaboradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/categorias')} className="w-full">
                Gerenciar Categorias
              </Button>
            </CardContent>
          </Card>

          {/* Editor de Cardápio */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Editor de Cardápio
              </CardTitle>
              <CardDescription>
                Edite cardápios, categorias, itens e fotos de forma interativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/admin/edit-menu-images')} className="w-full">
                Abrir Editor
              </Button>
            </CardContent>
          </Card>

          {/* Tema - Ocupa toda a largura */}
          <Card className="lg:col-span-2">
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
              {/* Grid de opções de tema para desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tema Claro */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
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

                {/* Tema Escuro */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
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

                {/* OLED */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                      <Circle className="w-5 h-5 text-black dark:text-white fill-current" />
                    </div>
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

                {/* Automático */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
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
              </div>

              {/* Indicador de Tema Atual */}
              <div className="mt-6 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    currentTheme === "dark" ? "bg-blue-500" :
                    theme === "oled" ? "bg-black dark:bg-white" :
                    "bg-orange-500"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tema Ativo</p>
                    <p className="font-semibold">
                      {
                        theme === "oled" ? "OLED True Black" :
                        currentTheme === "dark" ? "Escuro" :
                        theme === "system" ? "Automático" : "Claro"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
