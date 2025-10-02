"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import Image from "next/image"

interface ImageSearchModalProps {
  open: boolean
  onClose: () => void
  itemName: string
  onSelect: (imageUrl: string) => void
}

export function ImageSearchModal({ open, onClose, itemName, onSelect }: ImageSearchModalProps) {
  const [pastedImage, setPastedImage] = useState<string | null>(null)

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const base64 = event.target?.result as string
            setPastedImage(base64)
          }
          reader.readAsDataURL(blob)
        }
      }
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const reader = new FileReader()
            reader.onload = (event) => {
              const base64 = event.target?.result as string
              setPastedImage(base64)
            }
            reader.readAsDataURL(blob)
            return
          }
        }
      }
      alert('Nenhuma imagem encontrada na área de transferência')
    } catch (error) {
      alert('Erro ao acessar área de transferência. Use Ctrl+V ou copie uma imagem primeiro.')
    }
  }

  const handleUsePastedImage = () => {
    if (!pastedImage) return
    onSelect(pastedImage)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Imagem - {itemName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Copie uma imagem (Ctrl+C ou Print Screen) e cole aqui
            </p>

            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onPaste={handlePaste}
              tabIndex={0}
            >
              <Clipboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-base font-medium mb-2">
                {pastedImage ? "✓ Imagem colada com sucesso!" : "Clique aqui e pressione Ctrl+V"}
              </p>
              <p className="text-xs text-muted-foreground">
                ou
              </p>
            </div>

            <Button
              onClick={handlePasteFromClipboard}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Clipboard className="w-5 h-5 mr-2" />
              Colar da Área de Transferência
            </Button>
          </div>

          {pastedImage && (
            <>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border-2 border-primary">
                <Image
                  src={pastedImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <Button onClick={handleUsePastedImage} className="w-full" size="lg">
                <Clipboard className="w-5 h-5 mr-2" />
                Salvar Esta Imagem
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
