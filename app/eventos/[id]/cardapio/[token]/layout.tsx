import type React from "react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '🍽️ Cardápio do Evento - Metri',
  description: 'Escolha seus pratos favoritos para o evento. Clique para montar seu cardápio personalizado!',
  openGraph: {
    title: '🍽️ Cardápio do Evento',
    description: 'Escolha seus pratos favoritos para o evento',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Cardápio Metri',
      },
    ],
    type: 'website',
    siteName: 'Metri Eventos',
  },
}

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="light">
      {children}
    </div>
  )
}
