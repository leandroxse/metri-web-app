"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, X } from "lucide-react"
import { useDocuments } from "@/hooks/use-documents"
import { useToast } from "@/hooks/use-toast"
import type { DocumentUpload } from "@/types/document"

interface DocumentUploadProps {
  eventId?: string
  onSuccess?: () => void
}

export function DocumentUpload({ eventId, onSuccess }: DocumentUploadProps) {
  const { uploadDocument, uploading } = useDocuments()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"contract" | "invoice" | "receipt" | "photo" | "other">("other")

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0])
        if (!name) setName(acceptedFiles[0].name)
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({ variant: "destructive", title: "Selecione um arquivo" })
      return
    }

    const uploadData: DocumentUpload = {
      file,
      name: name || file.name,
      description,
      category,
      event_id: eventId || null
    }

    const result = await uploadDocument(uploadData)

    if (result) {
      toast({ title: "Documento enviado com sucesso!" })
      setFile(null)
      setName("")
      setDescription("")
      setCategory("other")
      onSuccess?.()
    } else {
      toast({ variant: "destructive", title: "Erro ao enviar documento" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Documento</CardTitle>
        <CardDescription>Envie PDFs ou imagens (máx 10MB)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? "Solte o arquivo aqui" : "Arraste um arquivo ou clique para selecionar"}
                </p>
              </div>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Documento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Contrato Cliente João Silva"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informações adicionais sobre o documento..."
              rows={3}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contrato</SelectItem>
                <SelectItem value="invoice">Nota Fiscal</SelectItem>
                <SelectItem value="receipt">Recibo</SelectItem>
                <SelectItem value="photo">Foto</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={uploading || !file}>
            {uploading ? "Enviando..." : "Enviar Documento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
