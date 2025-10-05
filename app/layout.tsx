import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Manrope } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Sidebar } from "@/components/sidebar"
import { ConditionalNav } from "@/components/conditional-nav"
import { ConditionalMain } from "@/components/conditional-main"
import "./globals.css"
import { OfflineBanner } from "@/components/offline-banner"
import { IOSInstallPrompt } from "@/components/ios-install-prompt"
import "@/lib/utils/debug"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
  weight: ["400", "600", "700"],
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "METRI - Gestão de Eventos",
  description: "Sistema profissional para gestão de eventos e equipes operacionais",
  generator: "METRI Web App",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/metri-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        rel: "icon", 
        url: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "METRI",
    startupImage: [
      // iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max
      {
        url: "/splash/apple-splash-1290-2796.jpg",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      // iPhone 15 Pro, 14 Pro, 13 Pro, 12 Pro
      {
        url: "/splash/apple-splash-1179-2556.jpg", 
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      // iPhone 15, 14, 13, 12, 13 mini, 12 mini
      {
        url: "/splash/apple-splash-1170-2532.jpg",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      // iPhone 11 Pro Max, XS Max
      {
        url: "/splash/apple-splash-1242-2688.jpg",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      // iPhone 11, XR
      {
        url: "/splash/apple-splash-828-1792.jpg",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
      {
        url: "/splash/apple-splash-1242-2208.jpg",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      // iPhone 8, 7, 6s, 6, SE (2nd gen)
      {
        url: "/splash/apple-splash-750-1334.jpg",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      // iPhone SE (1st gen), 5s, 5c, 5
      {
        url: "/splash/apple-splash-640-1136.jpg",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      // iPad Pro 12.9" (3rd, 4th, 5th, 6th gen)
      {
        url: "/splash/apple-splash-2048-2732.jpg",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      // iPad Pro 11" (all gens), iPad Air (4th, 5th gen)
      {
        url: "/splash/apple-splash-1668-2388.jpg",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      // iPad Pro 10.5", iPad Air (3rd gen)
      {
        url: "/splash/apple-splash-1668-2224.jpg",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      // iPad (9th, 8th, 7th gen), iPad Air (1st, 2nd gen), iPad mini (6th gen)
      {
        url: "/splash/apple-splash-1536-2048.jpg",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      }
    ]
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#10b981" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Ícones e PWA */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/metri-logo.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        
        {/* iOS PWA Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="METRI" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* Splash Screens iOS */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1290-2796.jpg" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1179-2556.jpg" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1170-2532.jpg" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2688.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-828-1792.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2208.jpg" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-750-1334.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-640-1136.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2388.jpg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2224.jpg" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1536-2048.jpg" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        
        {/* General PWA */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Android fullscreen mode */}
        <meta name="theme-color" content="#059669" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#10b981" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="antialiased bg-background" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'oled', 'system']}
        >
          {/* Sidebar - Tablet/Desktop apenas */}
          <Sidebar />

          {/* Main Content - Com padding lateral no desktop */}
          <div className="min-h-screen pb-20 md:pb-0 pt-safe-or-4 md:pl-64">
            <OfflineBanner />
            <ConditionalMain>
              {children}
            </ConditionalMain>
            <ConditionalNav />
            <IOSInstallPrompt />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
