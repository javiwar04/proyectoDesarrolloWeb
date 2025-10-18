import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import SiteShell from "@/components/site-shell"

export const metadata: Metadata = {
  title: "Mi Portafolio - Desarrollador Full Stack",
  description:
    "Portafolio profesional de desarrollador full stack especializado en React, Next.js y tecnologías modernas",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
