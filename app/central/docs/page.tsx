"use client"

import { useState, useEffect, Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FilePlus, FileSignature, Download, Trash2, Share2, AlertTriangle, Receipt } from "lucide-react"
import { useDocuments } from "@/hooks/use-documents"
import { useContracts } from "@/hooks/use-contracts"
import { useBudgets } from "@/hooks/use-budgets"
import { useRouter, useSearchParams } from "next/navigation"
import { DocumentUpload } from "@/components/document-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { forceDownload, sanitizeFilename } from "@/lib/utils/download-utils"

function DocsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { documents, loading: loadingDocs, deleteDocument } = useDocuments()
  const { contracts, loading: loadingContracts, deleteContract, generatePDF, generating } = useContracts()
  const { budgets, templates: budgetTemplates, loading: loadingBudgets, deleteBudget, generatePDF: generateBudgetPDF, generating: generatingBudget } = useBudgets()
  const [showUpload, setShowUpload] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<string | null>(null)
  const [deletingContract, setDeletingContract] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [deletingDocument, setDeletingDocument] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)
  const [deletingBudget, setDeletingBudget] = useState(false)

  // Controlar aba ativa via URL
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'contracts')

  // Atualizar aba quando URL mudar
  useEffect(() => {
    if (tabParam && ['contracts', 'budgets', 'documents'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Atualizar URL quando aba mudar
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/central/docs?tab=${value}`, { scroll: false })
  }

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

  const shareViaWhatsApp = (name: string, url: string) => {
    const message = `📄 *${name}*\n\nConfira o documento: ${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleDeleteContract = async () => {
    if (!contractToDelete) return

    setDeletingContract(true)
    try {
      await deleteContract(contractToDelete)
      setContractToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar contrato:', error)
    } finally {
      setDeletingContract(false)
    }
  }

  const getContractName = (contractId: string): string => {
    const contract = contracts.find(c => c.id === contractId)
    return contract?.filled_data['1'] || "Contrato"
  }

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return

    setDeletingDocument(true)
    try {
      await deleteDocument(documentToDelete)
      setDocumentToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
    } finally {
      setDeletingDocument(false)
    }
  }

  const getDocumentName = (documentId: string): string => {
    const doc = documents.find(d => d.id === documentId)
    return doc?.name || "Documento"
  }

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return

    setDeletingBudget(true)
    try {
      await deleteBudget(budgetToDelete)
      setBudgetToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error)
    } finally {
      setDeletingBudget(false)
    }
  }

  const getBudgetName = (budgetId: string): string => {
    const budget = budgets.find(b => b.id === budgetId)
    return budget?.filled_data.evento || "Orçamento"
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie documentos e contratos do Prime Buffet
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Orçamentos
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
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.open(doc.file_url, '_blank')}
                >
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
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(doc.file_url, '_blank')
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Abrir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          shareViaWhatsApp(doc.name, doc.file_url)
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDocumentToDelete(doc.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB: Orçamentos */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {budgets.length} {budgets.length === 1 ? "orçamento" : "orçamentos"}
            </p>
            <Button onClick={() => router.push('/central/docs/orcamentos/novo')}>
              <FilePlus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>

          {loadingBudgets ? (
            <p>Carregando...</p>
          ) : budgets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum orçamento ainda</p>
                <Button className="mt-4" onClick={() => router.push('/central/docs/orcamentos/novo')}>
                  Criar Primeiro Orçamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <Card
                  key={budget.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    if (budget.generated_pdf_url) {
                      window.open(budget.generated_pdf_url, '_blank')
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base truncate">
                            {budget.filled_data.evento || "Orçamento sem nome"}
                          </CardTitle>
                          {budget.template_id && budgetTemplates.find(t => t.id === budget.template_id) && (
                            <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 oled:bg-green-400/20 rounded text-[10px] font-medium text-green-800 dark:text-green-300 oled:text-green-200 whitespace-nowrap flex-shrink-0">
                              {budgetTemplates.find(t => t.id === budget.template_id)?.name}
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {statusLabels[budget.status] || budget.status} • {formatDistanceToNow(new Date(budget.created_at), { addSuffix: true, locale: ptBR })}
                        </CardDescription>
                      </div>
                      <Receipt className="w-5 h-5 text-primary flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {budget.filled_data.cerimonialista && (
                      <p className="text-sm text-muted-foreground">
                        {budget.filled_data.cerimonialista}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {budget.generated_pdf_url ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(budget.generated_pdf_url!, '_blank')
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation()
                              const filename = sanitizeFilename(`Orcamento_${budget.filled_data.evento || 'Prime_Buffet'}.pdf`)
                              forceDownload(budget.generated_pdf_url!, filename)
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              shareViaWhatsApp(
                                budget.filled_data.evento || "Orçamento",
                                budget.generated_pdf_url!
                              )
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            generateBudgetPDF(budget.id)
                          }}
                          disabled={generatingBudget}
                        >
                          {generatingBudget ? "Gerando..." : "Gerar PDF"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBudgetToDelete(budget.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
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
            <Button onClick={() => router.push('/central/docs/contratos/novo')}>
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
                <Button className="mt-4" onClick={() => router.push('/central/docs/contratos/novo')}>
                  Criar Primeiro Contrato
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <Card
                  key={contract.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    if (contract.generated_pdf_url) {
                      window.open(contract.generated_pdf_url, '_blank')
                    }
                  }}
                >
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
                    <div className="flex gap-2">
                      {contract.generated_pdf_url ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(contract.generated_pdf_url!, '_blank')
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation()
                              const filename = sanitizeFilename(`Contrato_${contract.filled_data['1'] || 'Prime_Buffet'}.pdf`)
                              forceDownload(contract.generated_pdf_url!, filename)
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              shareViaWhatsApp(
                                contract.filled_data['1'] || "Contrato",
                                contract.generated_pdf_url!
                              )
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            generatePDF(contract.id)
                          }}
                          disabled={generating}
                        >
                          {generating ? "Gerando..." : "Gerar PDF"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setContractToDelete(contract.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Confirmação de Exclusão de DOCUMENTO - AVISO TAXATIVO */}
      <Dialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <DialogContent className="max-w-md border-destructive">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl">⚠️ ATENÇÃO: Ação Irreversível</DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="space-y-3 pt-4">
                <p className="text-base font-semibold text-foreground">
                  Você está prestes a excluir permanentemente o documento:
                </p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-bold text-foreground">
                    "{documentToDelete ? getDocumentName(documentToDelete) : ""}"
                  </p>
                </div>

                <div className="bg-destructive/5 border-l-4 border-destructive p-4 rounded space-y-2">
                  <p className="font-bold text-destructive text-sm">
                    ⛔ ESTA AÇÃO NÃO PODE SER DESFEITA!
                  </p>
                  <ul className="space-y-1 text-sm text-foreground/90">
                    <li>• O documento será excluído permanentemente do banco de dados</li>
                    <li>• O arquivo será removido do armazenamento</li>
                    <li>• Não há como recuperar após a exclusão</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  💡 Dica: Se você não tem certeza, cancele esta operação e faça backup do documento antes de excluir.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDocumentToDelete(null)}
              disabled={deletingDocument}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={deletingDocument}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              {deletingDocument ? "Excluindo..." : "Sim, Excluir Permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão de CONTRATO - AVISO TAXATIVO */}
      <Dialog open={!!contractToDelete} onOpenChange={(open) => !open && setContractToDelete(null)}>
        <DialogContent className="max-w-md border-destructive">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl">⚠️ ATENÇÃO: Ação Irreversível</DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="space-y-3 pt-4">
                <p className="text-base font-semibold text-foreground">
                  Você está prestes a excluir permanentemente o contrato:
                </p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-bold text-foreground">
                    "{contractToDelete ? getContractName(contractToDelete) : ""}"
                  </p>
                </div>

                <div className="bg-destructive/5 border-l-4 border-destructive p-4 rounded space-y-2">
                  <p className="font-bold text-destructive text-sm">
                    ⛔ ESTA AÇÃO NÃO PODE SER DESFEITA!
                  </p>
                  <ul className="space-y-1 text-sm text-foreground/90">
                    <li>• O contrato será excluído permanentemente do banco de dados</li>
                    <li>• O arquivo PDF será removido do armazenamento</li>
                    <li>• Todos os dados preenchidos serão perdidos</li>
                    <li>• Não há como recuperar após a exclusão</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  💡 Dica: Se você não tem certeza, cancele esta operação e faça backup do contrato antes de excluir.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setContractToDelete(null)}
              disabled={deletingContract}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContract}
              disabled={deletingContract}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              {deletingContract ? "Excluindo..." : "Sim, Excluir Permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão de ORÇAMENTO */}
      <Dialog open={!!budgetToDelete} onOpenChange={(open) => !open && setBudgetToDelete(null)}>
        <DialogContent className="max-w-md border-destructive">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl">⚠️ ATENÇÃO: Ação Irreversível</DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="space-y-3 pt-4">
                <p className="text-base font-semibold text-foreground">
                  Você está prestes a excluir permanentemente o orçamento:
                </p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-bold text-foreground">
                    "{budgetToDelete ? getBudgetName(budgetToDelete) : ""}"
                  </p>
                </div>

                <div className="bg-destructive/5 border-l-4 border-destructive p-4 rounded space-y-2">
                  <p className="font-bold text-destructive text-sm">
                    ⛔ ESTA AÇÃO NÃO PODE SER DESFEITA!
                  </p>
                  <ul className="space-y-1 text-sm text-foreground/90">
                    <li>• O orçamento será excluído permanentemente do banco de dados</li>
                    <li>• O arquivo PDF será removido do armazenamento</li>
                    <li>• Todos os dados preenchidos serão perdidos</li>
                    <li>• Não há como recuperar após a exclusão</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  💡 Dica: Se você não tem certeza, cancele esta operação e faça backup do orçamento antes de excluir.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setBudgetToDelete(null)}
              disabled={deletingBudget}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBudget}
              disabled={deletingBudget}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              {deletingBudget ? "Excluindo..." : "Sim, Excluir Permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4 md:p-6 max-w-7xl">Carregando...</div>}>
      <DocsPageContent />
    </Suspense>
  )
}
