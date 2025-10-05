"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { MenuEditor } from "@/components/menu-editor"

function EditMenuContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [menus, setMenus] = useState<any[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState("")

  useEffect(() => {
    loadMenus()
  }, [])

  useEffect(() => {
    // Pré-selecionar menu se vier da URL
    const menuIdFromUrl = searchParams.get('menuId')
    if (menuIdFromUrl) {
      setSelectedMenuId(menuIdFromUrl)
    }
  }, [searchParams])

  const loadMenus = async () => {
    const { data } = await supabase
      .from('menus')
      .select('*')
      .eq('status', 'active')
    setMenus(data || [])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header compacto fixo */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/configuracoes')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="h-6 w-px bg-border" />

            <h1 className="text-lg font-semibold">Editor de Cardápio</h1>

            <div className="flex-1 max-w-xs ml-auto">
              <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione um cardápio" />
                </SelectTrigger>
                <SelectContent>
                  {menus.map(menu => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-6">
        {selectedMenuId && (
          <MenuEditor menuId={selectedMenuId} onUpdate={loadMenus} />
        )}
      </div>
    </div>
  )
}

export default function EditMenuPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Carregando...</div>}>
      <EditMenuContent />
    </Suspense>
  )
}
