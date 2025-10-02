"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChefHat, Link as LinkIcon, Copy, Check, ExternalLink, MessageCircle } from "lucide-react"
import { useMenus } from "@/hooks/use-menus"
import { supabase } from "@/lib/supabase/client"

interface EventMenuLinkProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventName: string
}

export function EventMenuLink({ open, onOpenChange, eventId, eventName }: EventMenuLinkProps) {
  const { menus } = useMenus()
  const [selectedMenuId, setSelectedMenuId] = useState<string>("")
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [existingLink, setExistingLink] = useState<{ menuId: string; token: string } | null>(null)

  // Carregar vínculo existente
  useEffect(() => {
    if (open && eventId) {
      loadExistingLink()
    }
  }, [open, eventId])

  const loadExistingLink = async () => {
    try {
      const { data, error } = await supabase
        .from('event_menus')
        .select('menu_id, share_token')
        .eq('event_id', eventId)
        .single()

      if (data && !error) {
        setExistingLink({ menuId: data.menu_id, token: data.share_token })
        setSelectedMenuId(data.menu_id)
        setShareToken(data.share_token)
        setShareLink(`${window.location.origin}/eventos/${eventId}/cardapio/${data.share_token}`)
      }
    } catch (error) {
      console.log("Nenhum cardápio vinculado ainda")
    }
  }

  const handleGenerateLink = async () => {
    if (!selectedMenuId) return

    setLoading(true)
    try {
      // Se já existe vínculo, atualizar
      if (existingLink) {
        const { data, error } = await supabase
          .from('event_menus')
          .update({ menu_id: selectedMenuId })
          .eq('event_id', eventId)
          .select('share_token')
          .single()

        if (error) throw error

        setShareToken(data.share_token)
        setShareLink(`${window.location.origin}/eventos/${eventId}/cardapio/${data.share_token}`)
      } else {
        // Criar novo vínculo
        const { data, error } = await supabase
          .from('event_menus')
          .insert({
            event_id: eventId,
            menu_id: selectedMenuId
          })
          .select('share_token')
          .single()

        if (error) throw error

        setShareToken(data.share_token)
        setShareLink(`${window.location.origin}/eventos/${eventId}/cardapio/${data.share_token}`)
        setExistingLink({ menuId: selectedMenuId, token: data.share_token })
      }
    } catch (error) {
      console.error("Erro ao gerar link:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenLink = () => {
    window.open(shareLink, '_blank')
  }

  const handleShareWhatsApp = () => {
    const message = `Olá! Aqui está o cardápio do evento "${eventName}":\n${shareLink}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const activeMenus = menus.filter(m => m.status === 'active')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Cardápio do Evento
          </DialogTitle>
          <DialogDescription>
            Vincule um cardápio ao evento "{eventName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Cardápio */}
          <div className="space-y-2">
            <Label htmlFor="menu">Selecione o Cardápio</Label>
            <Select
              value={selectedMenuId}
              onValueChange={setSelectedMenuId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um cardápio ativo" />
              </SelectTrigger>
              <SelectContent>
                {activeMenus.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhum cardápio ativo disponível
                  </div>
                )}
                {activeMenus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    <div className="flex items-center gap-2">
                      <span>{menu.name}</span>
                      {existingLink?.menuId === menu.id && (
                        <Badge variant="outline" className="text-xs">Atual</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Gerar/Atualizar */}
          <Button
            onClick={handleGenerateLink}
            disabled={!selectedMenuId || loading}
            className="w-full"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {existingLink ? "Atualizar Vínculo" : "Gerar Link Compartilhável"}
          </Button>

          {/* Link Gerado */}
          {shareLink && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm font-medium">Link Compartilhável</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="font-mono text-xs bg-background"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    title="Copiar link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    title="Compartilhar no WhatsApp"
                    className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950 relative"
                  >
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_mwbHX3hY1L0K0i2JkhhpxGonRGb5WclhTg&s"
                      alt="WhatsApp"
                      className="w-6 h-6"
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleOpenLink}
                    title="Abrir link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compartilhe este link com seus clientes para que possam selecionar os itens do cardápio
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• O link é único e permanente para este evento</p>
            <p>• Não requer login do cliente</p>
            <p>• As seleções são salvas automaticamente</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
