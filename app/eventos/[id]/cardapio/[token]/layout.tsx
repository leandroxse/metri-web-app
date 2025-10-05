"use client"

import type React from "react"
import { useEffect } from "react"

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Forçar tema light
    document.documentElement.classList.remove('dark', 'oled')
    document.documentElement.classList.add('light')
  }, [])

  return (
    <>
      <style jsx global>{`
        /* Força tema light no wizard */
        html {
          color-scheme: light !important;
        }

        /* Background colors */
        .bg-background {
          background-color: white !important;
        }
        .bg-card {
          background-color: white !important;
        }
        .bg-muted {
          background-color: rgb(243 244 246) !important;
        }
        .bg-muted\/50 {
          background-color: rgb(249 250 251) !important;
        }

        /* Text colors */
        .text-foreground {
          color: rgb(17 24 39) !important;
        }
        .text-muted-foreground {
          color: rgb(107 114 128) !important;
        }
        .text-card-foreground {
          color: rgb(17 24 39) !important;
        }

        /* Border colors */
        .border {
          border-color: rgb(229 231 235) !important;
        }
        .border-b {
          border-bottom-color: rgb(229 231 235) !important;
        }
        .border-t {
          border-top-color: rgb(229 231 235) !important;
        }

        /* Shadows sempre visíveis */
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        }
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important;
        }

        /* Input/Button overrides */
        button, input, textarea, select {
          color: rgb(17 24 39) !important;
        }
      `}</style>
      <div className="bg-white text-black min-h-screen">
        {children}
      </div>
    </>
  )
}
