# PRP: Editor de Fotos de Cardápio (Versão Simplificada)

## 🎯 O que fazer

1. **Limpar página de Configurações** - remover cards desnecessários
2. **Adicionar botão** "Editar Fotos de Cardápio" em Configurações
3. **Criar editor simples** que abre o wizard em modo admin com busca de imagens

## 📋 Mudanças Necessárias

### ETAPA 1: Limpar Configurações (5 min)

**Arquivo**: `app/configuracoes/page.tsx`

**Remover** (deletar código):
- Card "Aplicativo Web" (linhas 151-182)
- Card "Dados e Armazenamento" (linhas 184-226)
- Card "Sobre o Metri" (linhas 228-252)

**Adicionar** novo card depois do card "Aparência":

```tsx
{/* Editor de Fotos */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ImageIcon className="w-5 h-5" />
      Editor de Fotos de Cardápio
    </CardTitle>
    <CardDescription>
      Adicione fotos aos itens do cardápio
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button onClick={() => router.push('/admin/edit-menu-images')}>
      Abrir Editor
    </Button>
  </CardContent>
</Card>
```

**Imports necessários**:
```tsx
import { useRouter } from "next/navigation"
import { Image as ImageIcon } from "lucide-react"
```

---

### ETAPA 2: Criar API de Busca (10 min)

**Arquivo NOVO**: `app/api/search-images/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query obrigatória' }, { status: 400 })
  }

  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_KEY}`
        }
      }
    )

    const data = await response.json()
    return NextResponse.json({ results: data.results || [] })

  } catch (error) {
    return NextResponse.json({ error: 'Erro na busca' }, { status: 500 })
  }
}
```

**Adicionar ao `.env.local`**:
```
UNSPLASH_ACCESS_KEY=sua_chave_aqui
```

> **Como obter chave**: https://unsplash.com/developers → Create App → copiar "Access Key"

---

### ETAPA 3: Componente de Busca (15 min)

**Arquivo NOVO**: `components/image-search-modal.tsx`

```tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageSearchModalProps {
  open: boolean
  onClose: () => void
  itemName: string
  onSelect: (imageUrl: string) => void
}

export function ImageSearchModal({ open, onClose, itemName, onSelect }: ImageSearchModalProps) {
  const [query, setQuery] = useState(itemName)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/search-images?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      alert('Erro ao buscar imagens')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Imagem</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: sushi, pizza..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {results.map((img) => (
            <div
              key={img.id}
              className="cursor-pointer hover:opacity-80 relative aspect-square"
              onClick={() => {
                onSelect(img.urls.regular)
                onClose()
              }}
            >
              <Image
                src={img.urls.small}
                alt={img.alt_description || ''}
                fill
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-8">
            Digite e busque imagens
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

---

### ETAPA 4: Modificar Grid de Itens (10 min)

**Arquivo**: `components/wizard/menu-item-grid.tsx`

**Adicionar** prop `adminMode`:
```tsx
interface MenuItemGridProps {
  items: MenuItem[]
  selections: Set<string>
  onToggleItem: (itemId: string) => void
  adminMode?: boolean  // NOVO
  onImageChange?: (itemId: string, imageUrl: string) => void  // NOVO
}
```

**Adicionar** botão de busca quando `adminMode={true}`:

```tsx
export function MenuItemGrid({ items, selections, onToggleItem, adminMode, onImageChange }: MenuItemGridProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const selectedItem = items.find(i => i.id === selectedItemId)

  // Dentro do return, no bloco de imagem, adicionar:
  {adminMode && (
    <Button
      size="sm"
      variant="secondary"
      className="absolute top-2 right-2"
      onClick={(e) => {
        e.stopPropagation()
        setSelectedItemId(item.id)
        setSearchOpen(true)
      }}
    >
      <Search className="w-4 h-4" />
    </Button>
  )}

  // Antes do return final, adicionar modal:
  {adminMode && selectedItem && (
    <ImageSearchModal
      open={searchOpen}
      onClose={() => setSearchOpen(false)}
      itemName={selectedItem.name}
      onSelect={async (imageUrl) => {
        // Salvar URL direto (sem upload)
        const { error } = await supabase
          .from('menu_items')
          .update({ image_url: imageUrl })
          .eq('id', selectedItemId)

        if (!error && onImageChange) {
          onImageChange(selectedItemId!, imageUrl)
        }
      }}
    />
  )}
```

**Imports adicionais**:
```tsx
import { useState } from "react"
import { Search } from "lucide-react"
import { ImageSearchModal } from "@/components/image-search-modal"
import { supabase } from "@/lib/supabase/client"
```

---

### ETAPA 5: Página do Editor (20 min)

**Arquivo NOVO**: `app/admin/edit-menu-images/page.tsx`

```tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { MenuItemGrid } from "@/components/wizard/menu-item-grid"

export default function EditMenuImagesPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<any[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [selections] = useState(new Set()) // Não usado, mas necessário pro grid

  useEffect(() => {
    loadMenus()
  }, [])

  useEffect(() => {
    if (selectedMenuId) loadCategories()
  }, [selectedMenuId])

  const loadMenus = async () => {
    const { data } = await supabase
      .from('menus')
      .select('*')
      .eq('status', 'active')
    setMenus(data || [])
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('menu_categories')
      .select(`
        *,
        items:menu_items(*)
      `)
      .eq('menu_id', selectedMenuId)
      .order('order_index')

    setCategories(data || [])
  }

  const handleImageChange = (itemId: string, imageUrl: string) => {
    // Atualizar UI local
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item =>
        item.id === itemId ? { ...item, image_url: imageUrl } : item
      )
    })))
  }

  const activeCategory = categories[activeIndex]

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

      <h1 className="text-2xl font-bold mb-6">Editor de Fotos de Cardápio</h1>

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

      {categories.length > 0 && (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {categories.map((cat, idx) => (
              <Button
                key={cat.id}
                variant={idx === activeIndex ? "default" : "outline"}
                onClick={() => setActiveIndex(idx)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {activeCategory && (
            <MenuItemGrid
              items={activeCategory.items}
              selections={selections}
              onToggleItem={() => {}} // Não usado no modo admin
              adminMode={true}
              onImageChange={handleImageChange}
            />
          )}
        </>
      )}
    </div>
  )
}
```

---

## ✅ Checklist de Implementação

- [ ] Limpar cards de `app/configuracoes/page.tsx`
- [ ] Adicionar botão "Editor de Fotos" em configurações
- [ ] Criar `app/api/search-images/route.ts`
- [ ] Obter chave do Unsplash e adicionar ao `.env.local`
- [ ] Criar `components/image-search-modal.tsx`
- [ ] Modificar `components/wizard/menu-item-grid.tsx` (adicionar adminMode)
- [ ] Criar `app/admin/edit-menu-images/page.tsx`
- [ ] Testar: selecionar cardápio → buscar imagem → salvar

## 🧪 Validação

```bash
npm run build
```

## 🎯 Fluxo de Teste

1. Ir em `/configuracoes`
2. Clicar em "Abrir Editor"
3. Selecionar cardápio
4. Clicar na categoria
5. Passar mouse em item → botão de busca aparece
6. Clicar em buscar → modal abre
7. Buscar "sushi" → grid de imagens
8. Clicar em imagem → salva e fecha
9. Foto aparece no card

## 💡 Simplificações

- ❌ **SEM upload** para Supabase Storage - usa URL direto do Unsplash
- ❌ **SEM componentes separados** - tudo inline
- ❌ **SEM helpers complexos** - fetch direto
- ✅ **Reutiliza** componente grid existente
- ✅ **Busca simples** via API route
- ✅ **Update direto** no banco

## 🏆 Score: 9/10

**Por quê?**
- ✅ Muito mais simples
- ✅ Reutiliza código existente
- ✅ Sem dependências extras
- ✅ 5 arquivos (vs 8 antes)
- ⚠️ Unsplash key precisa ser configurada

**Tempo estimado**: ~1 hora
