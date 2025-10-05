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
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência no Metri</p>
        </div>

        <div className="space-y-6">
          {/* Categorias e Equipes */}
          <Card>
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
              <Button onClick={() => router.push('/categorias')}>
                Gerenciar Categorias
              </Button>
            </CardContent>
          </Card>

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

          {/* Editor de Cardápio */}
          <Card>
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
              <Button onClick={() => router.push('/admin/edit-menu-images')}>
                Abrir Editor
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
