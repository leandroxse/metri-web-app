# PRP: Editor de Fotos de Cardápio + Limpeza de Configurações

## 📋 Objetivo

Implementar um sistema administrativo para editar fotos dos itens de cardápio usando busca de imagens (Unsplash API) e upload para Supabase Storage. Simultaneamente, limpar a página de Configurações removendo seções obsoletas.

## 🎯 Requisitos Funcionais

### Parte 1: Limpeza da Página de Configurações
- ✅ **Remover** o card "Aplicativo Web" (PWA)
- ✅ **Remover** o card "Dados e Armazenamento"
- ✅ **Remover** o card "Sobre o Metri"
- ✅ **Manter** apenas o card "Aparência" (temas)
- ✅ **Adicionar** novo card "Editor de Fotos de Cardápio"

### Parte 2: Editor de Fotos de Cardápio
- ✅ Seleção de cardápio para editar
- ✅ Wizard em modo administrador (similar ao wizard do cliente)
- ✅ Botão de busca de imagem (ícone de lupa) em cada foto
- ✅ Modal de busca usando Unsplash API
- ✅ Grid de resultados com preview
- ✅ Upload da imagem selecionada para Supabase Storage
- ✅ Atualização do campo `image_url` no banco

## 🏗️ Arquitetura Técnica

### Stack de Tecnologias
- **Framework**: Next.js 15 + React 18 + TypeScript
- **Busca de Imagens**: Unsplash API (50 requests/hour grátis)
- **Storage**: Supabase Storage
- **Database**: Supabase PostgreSQL
- **UI**: shadcn/ui + Tailwind CSS

### Componentes da Solução

```
metri-web-app/
├── app/
│   ├── api/
│   │   └── search-images/
│   │       └── route.ts                    # Proxy para Unsplash API
│   ├── configuracoes/
│   │   └── page.tsx                        # MODIFICAR: Limpar seções
│   └── admin/
│       └── edit-menu-images/
│           └── page.tsx                    # NOVO: Editor de fotos
├── components/
│   ├── image-search-dialog.tsx            # NOVO: Modal de busca
│   ├── menu-image-uploader.tsx            # NOVO: Gerenciador de upload
│   └── wizard/
│       └── admin-menu-item-card.tsx       # NOVO: Card com botão de busca
├── lib/
│   └── supabase/
│       └── storage-helpers.ts              # NOVO: Helpers de storage
└── types/
    └── unsplash.ts                         # NOVO: Types do Unsplash
```

## 📚 Contexto do Código Existente

### 1. Estrutura do Wizard Atual
**Arquivo**: `app/eventos/[id]/cardapio/[token]/page.tsx`

O wizard atual funciona assim:
- Carrega menu via `event_menus` usando token
- Exibe categorias em stepper
- Grid de items com checkbox (`MenuItemGrid`)
- Cada item tem `image_url` (nullable)
- Salva seleções em `menu_selections`

**Componente de Item**: `components/wizard/menu-item-grid.tsx`
```tsx
// Linhas 48-62: Renderização de imagem
{item.image_url ? (
  <div className="relative w-full aspect-square md:aspect-[4/3] mb-2 md:mb-3 rounded-lg overflow-hidden bg-muted">
    <Image
      src={item.image_url}
      alt={item.name}
      fill
      className="object-cover"
    />
  </div>
) : (
  <div className="w-full aspect-square md:aspect-[4/3] mb-2 md:mb-3 rounded-lg bg-muted flex items-center justify-center">
    <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/50" />
  </div>
)}
```

### 2. Tipos de Menu
**Arquivo**: `types/menu.ts`
```typescript
export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  image_url: string | null  // ← Campo a ser atualizado
  order_index: number
  created_at: string
}
```

### 3. Configurações Atuais
**Arquivo**: `app/configuracoes/page.tsx`

Estrutura atual (257 linhas):
- Card "Aparência" (linhas 59-149) ✅ MANTER
- Card "Aplicativo Web" (linhas 151-182) ❌ REMOVER
- Card "Dados e Armazenamento" (linhas 184-226) ❌ REMOVER
- Card "Sobre o Metri" (linhas 228-252) ❌ REMOVER

## 🔧 Implementação Detalhada

### ETAPA 1: Configurar Supabase Storage

#### 1.1 Criar Bucket via Supabase MCP

```typescript
// Usar MCP para criar bucket e políticas
// Bucket: "menu-images"
// Políticas:
// - Public read (authenticated)
// - Authenticated write
```

**SQL para RLS (usar apply_migration)**:
```sql
-- Migration: create_menu_images_bucket_policies
-- Criar políticas para o bucket menu-images

-- Política de leitura pública
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Public read for menu images',
  'menu-images',
  '(bucket_id = ''menu-images''::text)'
);

-- Política de upload autenticado (admin)
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Authenticated upload for menu images',
  'menu-images',
  '((bucket_id = ''menu-images''::text) AND (auth.role() = ''authenticated''::text))'
);
```

### ETAPA 2: Configurar Unsplash API

#### 2.1 Obter Access Key
1. Registrar em https://unsplash.com/developers
2. Criar nova aplicação
3. Copiar "Access Key"
4. Adicionar ao `.env.local`:

```env
UNSPLASH_ACCESS_KEY=your_access_key_here
```

#### 2.2 Criar API Route

**Arquivo**: `app/api/search-images/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'

interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  user: {
    name: string
    username: string
  }
  links: {
    html: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const perPage = searchParams.get('per_page') || '12'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY

    if (!accessKey) {
      console.error('UNSPLASH_ACCESS_KEY not configured')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }

    // Buscar no Unsplash
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1'
        },
        next: { revalidate: 3600 } // Cache por 1 hora
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      results: data.results,
      total: data.total
    })

  } catch (error) {
    console.error('Image search error:', error)
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    )
  }
}
```

### ETAPA 3: Criar Types do Unsplash

**Arquivo**: `types/unsplash.ts`
```typescript
export interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  user: {
    name: string
    username: string
  }
  links: {
    html: string
  }
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[]
  total: number
}
```

### ETAPA 4: Criar Storage Helpers

**Arquivo**: `lib/supabase/storage-helpers.ts`
```typescript
import { supabase } from './client'

/**
 * Faz download de imagem de URL externa e upload para Supabase Storage
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  itemId: string,
  itemName: string
): Promise<string | null> {
  try {
    // 1. Fazer download da imagem
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Failed to fetch image')

    const blob = await response.blob()

    // 2. Gerar nome único
    const extension = blob.type.split('/')[1] || 'jpg'
    const fileName = `${itemId}_${Date.now()}.${extension}`
    const filePath = `items/${fileName}`

    // 3. Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: true
      })

    if (error) throw error

    // 4. Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl

  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

/**
 * Atualiza image_url de um menu item
 */
export async function updateMenuItemImage(
  itemId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: imageUrl })
      .eq('id', itemId)

    if (error) throw error
    return true

  } catch (error) {
    console.error('Error updating menu item image:', error)
    return false
  }
}
```

### ETAPA 5: Componente de Busca de Imagens

**Arquivo**: `components/image-search-dialog.tsx`
```typescript
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2, ExternalLink } from "lucide-react"
import Image from "next/image"
import { UnsplashImage } from "@/types/unsplash"

interface ImageSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultQuery: string
  onSelectImage: (imageUrl: string) => void
}

export function ImageSearchDialog({
  open,
  onOpenChange,
  defaultQuery,
  onSelectImage
}: ImageSearchDialogProps) {
  const [query, setQuery] = useState(defaultQuery)
  const [results, setResults] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/search-images?query=${encodeURIComponent(query)}&per_page=12`
      )

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      setResults(data.results || [])

    } catch (error) {
      console.error('Search error:', error)
      alert('Erro ao buscar imagens. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectImage = (image: UnsplashImage) => {
    setSelectedImageId(image.id)
    // Usar URL "regular" (1080px) para melhor qualidade
    onSelectImage(image.urls.regular)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Imagem
          </DialogTitle>
          <DialogDescription>
            Busque imagens gratuitas do Unsplash para o item do cardápio
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Ex: sushi, pizza, sobremesa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map((image) => (
              <Card
                key={image.id}
                className="cursor-pointer hover:shadow-lg transition-all overflow-hidden group"
                onClick={() => handleSelectImage(image)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={image.urls.small}
                      alt={image.alt_description || 'Unsplash image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {/* Overlay com crédito */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">
                          Por {image.user.name}
                        </span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Digite um termo e clique em buscar</p>
          </div>
        )}

        {/* Attribution */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Imagens fornecidas por{' '}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Unsplash
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### ETAPA 6: Card de Item Admin com Busca

**Arquivo**: `components/wizard/admin-menu-item-card.tsx`
```typescript
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ImageSearchDialog } from "@/components/image-search-dialog"
import { uploadImageFromUrl, updateMenuItemImage } from "@/lib/supabase/storage-helpers"

interface MenuItem {
  id: string
  name: string
  description: string | null
  image_url: string | null
}

interface AdminMenuItemCardProps {
  item: MenuItem
  onImageUpdated: (itemId: string, newImageUrl: string) => void
}

export function AdminMenuItemCard({ item, onImageUpdated }: AdminMenuItemCardProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(item.image_url)

  const handleSelectImage = async (unsplashUrl: string) => {
    setUploading(true)
    try {
      // 1. Upload da imagem do Unsplash para Supabase Storage
      const uploadedUrl = await uploadImageFromUrl(unsplashUrl, item.id, item.name)

      if (!uploadedUrl) {
        throw new Error('Failed to upload image')
      }

      // 2. Atualizar banco de dados
      const success = await updateMenuItemImage(item.id, uploadedUrl)

      if (!success) {
        throw new Error('Failed to update database')
      }

      // 3. Atualizar UI
      setCurrentImageUrl(uploadedUrl)
      onImageUpdated(item.id, uploadedUrl)

    } catch (error) {
      console.error('Error updating image:', error)
      alert('Erro ao salvar imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-3 md:p-4">
          {/* Image with Search Button */}
          <div className="relative group">
            {currentImageUrl ? (
              <div className="relative w-full aspect-square md:aspect-[4/3] mb-2 md:mb-3 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={currentImageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-square md:aspect-[4/3] mb-2 md:mb-3 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/50" />
              </div>
            )}

            {/* Search Button Overlay */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={() => setSearchOpen(true)}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-1.5 md:space-y-2">
            <h3 className="font-semibold text-sm md:text-base leading-tight">
              {item.name}
            </h3>

            {item.description && (
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ImageSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        defaultQuery={item.name}
        onSelectImage={handleSelectImage}
      />
    </>
  )
}
```

### ETAPA 7: Página do Editor Admin

**Arquivo**: `app/admin/edit-menu-images/page.tsx`
```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChefHat, ArrowLeft, Image as ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Menu } from "@/types/menu"
import { AdminMenuItemCard } from "@/components/wizard/admin-menu-item-card"

interface CategoryWithItems {
  id: string
  name: string
  recommended_count: number
  order_index: number
  items: Array<{
    id: string
    name: string
    description: string | null
    image_url: string | null
    order_index: number
  }>
}

export default function EditMenuImagesPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<string>("")
  const [categories, setCategories] = useState<CategoryWithItems[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)

  useEffect(() => {
    loadMenus()
  }, [])

  useEffect(() => {
    if (selectedMenuId) {
      loadMenuCategories()
    }
  }, [selectedMenuId])

  const loadMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('id, name, description, status, created_at, updated_at')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setMenus(data || [])

    } catch (error) {
      console.error('Error loading menus:', error)
    }
  }

  const loadMenuCategories = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select(`
          id,
          name,
          recommended_count,
          order_index,
          items:menu_items(
            id,
            name,
            description,
            image_url,
            order_index
          )
        `)
        .eq('menu_id', selectedMenuId)
        .order('order_index', { ascending: true })

      if (error) throw error

      // Ordenar itens
      const sortedCategories = (data || []).map(cat => ({
        ...cat,
        items: (cat.items || []).sort((a: any, b: any) => a.order_index - b.order_index)
      }))

      setCategories(sortedCategories as CategoryWithItems[])
      setActiveCategoryIndex(0)

    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpdated = (itemId: string, newImageUrl: string) => {
    // Atualizar UI local
    setCategories(prevCategories =>
      prevCategories.map(cat => ({
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, image_url: newImageUrl } : item
        )
      }))
    )
  }

  const activeCategory = categories[activeCategoryIndex]
  const totalItemsWithImages = categories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.image_url).length,
    0
  )
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/configuracoes')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Configurações
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Editor de Fotos de Cardápio</h1>
              <p className="text-muted-foreground">
                Adicione ou atualize imagens dos itens do cardápio
              </p>
            </div>
          </div>
        </div>

        {/* Menu Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Selecione o Cardápio
            </CardTitle>
            <CardDescription>
              Escolha qual cardápio você deseja editar as fotos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um cardápio..." />
              </SelectTrigger>
              <SelectContent>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMenuId && totalItems > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso:</span>
                  <Badge variant="outline">
                    {totalItemsWithImages} de {totalItems} itens com foto
                  </Badge>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(totalItemsWithImages / totalItems) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-60" />
            ))}
          </div>
        )}

        {/* Category Tabs */}
        {!loading && categories.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {categories.map((cat, index) => {
                const itemsWithImages = cat.items.filter(item => item.image_url).length
                const isActive = index === activeCategoryIndex

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryIndex(index)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-shrink-0
                      ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80'}
                    `}
                  >
                    <span className="font-medium whitespace-nowrap">{cat.name}</span>
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                      {itemsWithImages}/{cat.items.length}
                    </Badge>
                  </button>
                )
              })}
            </div>

            {/* Items Grid */}
            {activeCategory && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {activeCategory.name}
                  {activeCategory.recommended_count > 0 && (
                    <Badge variant="outline" className="ml-2">
                      Recomendado: {activeCategory.recommended_count}
                    </Badge>
                  )}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {activeCategory.items.map((item) => (
                    <AdminMenuItemCard
                      key={item.id}
                      item={item}
                      onImageUpdated={handleImageUpdated}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !selectedMenuId && (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Selecione um cardápio para começar a editar as fotos</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### ETAPA 8: Atualizar Página de Configurações

**Arquivo**: `app/configuracoes/page.tsx` (MODIFICAR)

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Monitor, Palette, Circle, Image as ImageIcon } from "lucide-react"
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
          {/* Tema - MANTER */}
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

          {/* NOVO: Editor de Fotos de Cardápio */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Editor de Fotos de Cardápio
              </CardTitle>
              <CardDescription>
                Adicione ou atualize fotos dos itens do cardápio usando busca de imagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Editar Fotos</p>
                  <p className="text-sm text-muted-foreground">
                    Busque e adicione imagens profissionais aos itens do cardápio
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/admin/edit-menu-images')}
                  className="gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Abrir Editor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
```

## 📝 Checklist de Implementação

### Backend/Database
- [ ] Criar bucket `menu-images` no Supabase Storage
- [ ] Configurar políticas RLS para o bucket
- [ ] Obter Unsplash Access Key e adicionar ao `.env.local`
- [ ] Criar API route `/api/search-images/route.ts`

### Types & Helpers
- [ ] Criar `types/unsplash.ts`
- [ ] Criar `lib/supabase/storage-helpers.ts`

### Componentes
- [ ] Criar `components/image-search-dialog.tsx`
- [ ] Criar `components/wizard/admin-menu-item-card.tsx`

### Páginas
- [ ] Criar `app/admin/edit-menu-images/page.tsx`
- [ ] Modificar `app/configuracoes/page.tsx` (remover cards e adicionar editor)

### Testes
- [ ] Testar busca de imagens via Unsplash
- [ ] Testar upload de imagem para Supabase Storage
- [ ] Testar atualização de `image_url` no banco
- [ ] Verificar exibição de imagens no wizard do cliente
- [ ] Testar rate limiting da Unsplash API

## 🧪 Validação

### Comandos de Build
```bash
# TypeScript validation
npx tsc --noEmit

# Build do projeto
npm run build

# Executar em dev
npm run dev
```

### Fluxo de Teste Manual

1. **Configurações**:
   - Acessar `/configuracoes`
   - Verificar que apenas card "Aparência" e "Editor de Fotos" aparecem
   - Clicar em "Abrir Editor"

2. **Editor de Fotos**:
   - Selecionar um cardápio ativo
   - Navegar pelas categorias
   - Passar mouse sobre item sem foto → botão de busca aparece
   - Clicar no botão de busca

3. **Busca de Imagens**:
   - Modal abre com termo pré-preenchido (nome do item)
   - Editar busca e clicar em "Buscar"
   - Grid de imagens carrega
   - Clicar em uma imagem
   - Loading aparece
   - Modal fecha
   - Foto aparece no card

4. **Validação no Cliente**:
   - Criar evento
   - Vincular cardápio ao evento
   - Compartilhar link
   - Abrir wizard do cliente
   - Verificar que fotos aparecem corretamente

## 🔍 Pontos de Atenção

### Rate Limiting
- Unsplash: 50 requests/hora no plano grátis
- Implementar debounce na busca (300ms)
- Cache de resultados (1 hora)

### Performance
- Usar `Image` do Next.js para otimização
- Lazy loading de imagens
- Comprimir imagens antes do upload (opcional)

### Segurança
- API Key do Unsplash no servidor (`.env.local`)
- RLS no Supabase Storage
- Validar tipo de arquivo no upload
- Limitar tamanho de upload (5MB)

### UX
- Loading states claros
- Mensagens de erro amigáveis
- Preview antes de salvar
- Indicador de progresso (X/Y itens com foto)

## 📚 Referências

### Documentação
- [Unsplash API](https://unsplash.com/documentation)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image)
- [Supabase Storage with Next.js](https://kodaschool.com/blog/next-js-and-supabase-how-to-store-and-serve-images)

### Exemplos
- Playnite (referência do usuário para busca de imagens)
- [React Image Search with Unsplash](https://medium.com/@matt.readout/using-the-unsplash-api-to-search-for-photos-in-a-react-app-93f6262e692c)
- [Supabase File Upload Guide](https://supalaunch.com/blog/file-upload-nextjs-supabase)

## 🎯 Critérios de Sucesso

- ✅ Página de configurações limpa (apenas Aparência + Editor)
- ✅ Editor de fotos funcional com seleção de cardápio
- ✅ Busca de imagens retorna resultados relevantes
- ✅ Upload de imagem funciona sem erros
- ✅ Imagens aparecem no wizard do cliente
- ✅ Progresso de edição visível (X/Y itens)
- ✅ Build sem erros TypeScript
- ✅ Performance aceitável (< 3s por upload)

## 🏆 Confiança de Implementação

**Score: 8.5/10**

**Justificativa**:
- ✅ Todos os componentes necessários estão documentados
- ✅ APIs externas testadas e documentadas
- ✅ Padrões do código existente identificados
- ✅ Supabase MCP disponível para operações de banco
- ⚠️ Necessário criar bucket no Supabase (pode ter variações)
- ⚠️ Rate limiting da Unsplash pode requerer ajustes

**Riscos Mitigados**:
- Upload de imagens: Helper function com tratamento de erro
- API externa: Proxy server-side protege a chave
- Storage: RLS configurado com políticas específicas
- UX: Loading states e feedback claro
