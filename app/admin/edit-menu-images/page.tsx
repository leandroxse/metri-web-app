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
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/configuracoes')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <h1 className="text-2xl font-bold mb-6">Editor de Cardápio</h1>

      <div className="mb-6">
        <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
          <SelectTrigger>
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

      {selectedMenuId && (
        <MenuEditor menuId={selectedMenuId} onUpdate={loadMenus} />
      )}
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
