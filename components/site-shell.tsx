"use client"

import { usePathname } from "next/navigation"
import Navigation from "./navigation"
import { Footer } from "./footer"
import ParticleBackground from "./particles"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideChrome = pathname === "/portafolios" || pathname === "/landing"

  if (hideChrome) {
    return (
      <>
        <main className="min-h-screen">{children}</main>
        <SonnerToaster position="top-center" richColors closeButton />
      </>
    )
  }

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen flex flex-col relative z-10">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <SonnerToaster position="top-center" richColors closeButton />
    </>
  )
}
