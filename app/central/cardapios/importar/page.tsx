"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, FileText, Copy, Check, Sparkles, Upload } from "lucide-react"
import Link from "next/link"
import { parseMenuFromText } from "@/lib/utils/menu-text-parser"
import { menuClientService } from "@/lib/supabase/client-services"

const CHATGPT_PROMPT = `Você é um assistente que formata cardápios para um sistema de gestão de eventos.

**REGRAS:**
1. O usuário vai te enviar um cardápio de qualquer forma (texto solto, lista, foto transcrita, etc)
2. Você deve retornar APENAS o texto formatado, sem explicações
3. Use EXATAMENTE este formato:

**FORMATO DE SAÍDA:**
\`\`\`
CARDÁPIO: [Nome do Cardápio]

CATEGORIA: [Nome da Categoria]
- [Nome do Item] :: [Descrição do item]
- [Nome do Item] :: [Descrição do item]

CATEGORIA: [Nome da Categoria 2]
- [Nome do Item] :: [Descrição do item]
- [Nome do Item] :: [Descrição do item]
\`\`\`

**EXEMPLO COMPLETO:**
\`\`\`
CARDÁPIO: Casamento Premium

CATEGORIA: Entradas
- Bruschetta de Tomate :: Pão italiano tostado, tomate fresco, manjericão e azeite
- Carpaccio de Carne :: Fatias finas de filé mignon, rúcula, lascas de parmesão e alcaparras
- Salmão Defumado :: Com cream cheese, alcaparras e torradas

CATEGORIA: Pratos Principais
- Filé Mignon ao Molho Madeira :: 200g de filé, molho madeira, batatas rústicas e legumes
- Salmão Grelhado :: Salmão fresco grelhado, arroz de brócolis e legumes no vapor
- Risoto de Camarão :: Risoto cremoso com camarões grandes e parmesão

CATEGORIA: Sobremesas
- Petit Gateau :: Bolinho quente de chocolate com sorvete de baunilha
- Cheesecake :: Cheesecake cremoso com calda de frutas vermelhas
- Mousse de Maracujá :: Mousse leve e refrescante
\`\`\`

**IMPORTANTE:**
- Use " :: " (espaço-dois pontos-dois pontos-espaço) para separar nome e descrição
- Cada item começa com "- " (hífen e espaço)
- Nome da categoria após "CATEGORIA: "
- Nome do cardápio após "CARDÁPIO: "
- Não adicione numeração, emojis ou formatação extra
- Retorne APENAS o texto formatado, nada mais

Agora me envie o cardápio que você quer formatar!`

export default function ImportarCardapioPage() {
  const router = useRouter()
  const [textInput, setTextInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(CHATGPT_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleImport = async () => {
    if (!textInput.trim()) {
      setError("Cole o texto formatado do ChatGPT")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Parse do texto
      const parsedData = parseMenuFromText(textInput)

      // Criar cardápio no Supabase
      const menuId = await menuClientService.createFromParsedText(parsedData)

      if (menuId) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/cardapios")
        }, 2000)
      } else {
        setError("Erro ao criar cardápio no banco de dados")
      }
    } catch (err: any) {
      console.error("Import error:", err)
      setError(err.message || "Erro ao processar o texto. Verifique o formato.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/cardapios">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Importar Cardápio por Texto
          </h1>
          <p className="text-muted-foreground mt-2">
            Use o ChatGPT para formatar seu cardápio e cole aqui para criar automaticamente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Passo 1: Copiar Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                Copie o Prompt
              </CardTitle>
              <CardDescription>
                Clique para copiar o prompt e cole no ChatGPT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {CHATGPT_PROMPT}
                </pre>
              </div>
              <Button onClick={handleCopyPrompt} className="w-full" size="lg">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Prompt para ChatGPT
                  </>
                )}
              </Button>
              <Alert>
                <FileText className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  <strong>Passos:</strong><br />
                  1. Copie este prompt<br />
                  2. Cole no ChatGPT<br />
                  3. Envie seu cardápio (de qualquer jeito)<br />
                  4. ChatGPT retorna formatado<br />
                  5. Cole o texto formatado abaixo
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Passo 2: Colar Texto Formatado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                Cole o Texto Formatado
              </CardTitle>
              <CardDescription>
                Cole aqui a resposta do ChatGPT e clique em Importar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Cole aqui o texto formatado pelo ChatGPT...&#10;&#10;Exemplo:&#10;CARDÁPIO: Casamento Premium&#10;&#10;CATEGORIA: Entradas&#10;- Bruschetta :: Pão italiano tostado..."
                rows={12}
                className="font-mono text-sm resize-none"
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
                  <Check className="w-4 h-4" />
                  <AlertDescription>
                    Cardápio criado com sucesso! Redirecionando...
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleImport}
                className="w-full"
                size="lg"
                disabled={loading || !textInput.trim()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Cardápio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Exemplo Visual */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Exemplo de Formato Correto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono">
{`CARDÁPIO: Casamento Premium

CATEGORIA: Entradas
- Bruschetta de Tomate :: Pão italiano tostado, tomate fresco, manjericão
- Carpaccio :: Fatias finas de filé mignon, rúcula e parmesão

CATEGORIA: Pratos Principais
- Filé Mignon :: 200g, molho madeira, batatas rústicas
- Salmão Grelhado :: Com legumes e arroz de brócolis

CATEGORIA: Sobremesas
- Petit Gateau :: Bolinho de chocolate com sorvete
- Cheesecake :: Com calda de frutas vermelhas`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
