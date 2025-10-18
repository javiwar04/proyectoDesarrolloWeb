"use client"

import { Button } from "@/components/ui/button"

export function PrintButton({ className }: { className?: string }) {
  const handlePrintOnePage = () => {
    if (typeof window === "undefined") return
    const root = document.documentElement
    root.classList.add("onepage-print")
    // ejecutar print ligeramente después para asegurar que la clase aplique
    setTimeout(() => {
      window.print()
      // remover la clase tras breve lapso para no afectar navegación
      setTimeout(() => root.classList.remove("onepage-print"), 300)
    }, 50)
  }

  return (
    <div className={className}>
      <Button type="button" variant="outline" onClick={handlePrintOnePage}>
        Exportar a PDF
      </Button>
    </div>
  )
}
