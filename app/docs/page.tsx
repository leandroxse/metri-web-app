"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FilePlus, FileSignature, Download, Trash2 } from "lucide-react"
import { useDocuments } from "@/hooks/use-documents"
import { useContracts } from "@/hooks/use-contracts"
import { useRouter } from "next/navigation"
import { DocumentUpload } from "@/components/document-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function DocsPage() {
  const router = useRouter()
  const { documents, loading: loadingDocs, deleteDocument } = useDocuments()
  const { contracts, loading: loadingContracts, deleteContract, generatePDF, generating } = useContracts()
  const [showUpload, setShowUpload] = useState(false)

  const categoryLabels: Record<string, string> = {
    contract: "Contrato",
    invoice: "Nota Fiscal",
    receipt: "Recibo",
    photo: "Foto",
    other: "Outro"
  }

  const statusLabels: Record<string, string> = {
    draft: "Rascunho",
    completed: "Concluído",
    sent: "Enviado",
    signed: "Assinado"
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie documentos e contratos do Prime Buffet
        </p>
      </div>

      <Tabs defaultValue="contracts" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* TAB: Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {documents.length} {documents.length === 1 ? "documento" : "documentos"}
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <FilePlus className="w-4 h-4 mr-2" />
              Novo Documento
            </Button>
          </div>

          {loadingDocs ? (
            <p>Carregando...</p>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum documento ainda</p>
                <Button className="mt-4" onClick={() => setShowUpload(true)}>
                  Enviar Primeiro Documento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{doc.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {categoryLabels[doc.category]} • {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ptBR })}
                        </CardDescription>
                      </div>
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Abrir
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB: Contratos */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {contracts.length} {contracts.length === 1 ? "contrato" : "contratos"}
            </p>
            <Button onClick={() => router.push('/docs/contratos/novo')}>
              <FilePlus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>

          {loadingContracts ? (
            <p>Carregando...</p>
          ) : contracts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileSignature className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum contrato ainda</p>
                <Button className="mt-4" onClick={() => router.push('/docs/contratos/novo')}>
                  Criar Primeiro Contrato
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {contract.filled_data['1'] || "Contrato sem nome"}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {statusLabels[contract.status]} • {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true, locale: ptBR })}
                        </CardDescription>
                      </div>
                      <FileSignature className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contract.generated_pdf_url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(contract.generated_pdf_url!, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar PDF
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => generatePDF(contract.id)}
                        disabled={generating}
                      >
                        {generating ? "Gerando..." : "Gerar PDF"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      onClick={() => deleteContract(contract.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Upload */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Documento</DialogTitle>
          </DialogHeader>
          <DocumentUpload onSuccess={() => setShowUpload(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
