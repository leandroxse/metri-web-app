import { FileQuestion } from 'lucide-react'

/**
 * Página raiz - 404 discreto
 * SECURITY: Não revela existência do painel
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">Página não encontrada</p>
      </div>
    </div>
  )
}
