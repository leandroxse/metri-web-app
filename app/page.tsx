import { redirect } from 'next/navigation'

/**
 * Página raiz - redireciona para /access
 * PWA abre aqui e vai direto pro login
 * Se já autenticado, middleware redireciona pra /central
 */
export default function HomePage() {
  redirect('/access')
}
