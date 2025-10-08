'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { authenticate } from './actions'

export default function AccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authenticate(password)

      if (result.success) {
        // Sucesso → redirecionar para painel
        router.push('/central')
        router.refresh() // Força revalidação do middleware
      } else {
        // SECURITY: Mensagem genérica que não revela se existe painel
        setError('Acesso negado')
        setPassword('')
      }
    } catch (err) {
      setError('Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground">
            Insira a senha para continuar
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password}
            >
              {loading ? 'Verificando...' : 'Acessar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
