"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getUsers } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

interface User {
  id: number
  name: string
  generalDescription?: string
  shortDescriptions?: string[]
  profileImageUrl?: string
}

export default function PortafoliosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const list = await getUsers()
        setUsers(Array.isArray(list) ? list : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Activar animaciones de entrada una vez montado en cliente
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  const displayUsers = useMemo(() => {
    // Ordena: con foto primero, luego por nombre ascendente
    return [...users].sort((a, b) => {
      const aHas = !!a.profileImageUrl, bHas = !!b.profileImageUrl
      if (aHas !== bHas) return aHas ? -1 : 1
      return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
    })
  }, [users])

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Galería de Portafolios</h1>
          <p className="text-muted-foreground">Explora y selecciona un usuario para ver su presentación.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border/60 bg-muted/20 animate-pulse">
                <div className="aspect-[16/9] bg-muted/40" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="mt-3 h-9 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-muted-foreground">No hay usuarios registrados aún.</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
            {displayUsers.map((u, i) => (
              <div
                key={u.id}
                className="p-[1px] rounded-xl bg-gradient-to-br from-primary/20 via-border to-accent/20 hover:from-primary/40 hover:to-accent/40 transition-colors"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <Card
                  className={`overflow-hidden group transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                <div className="aspect-[16/9] bg-muted/40 relative">
                  {u.profileImageUrl ? (
                    <img
                      src={`/api/media/${u.profileImageUrl.replace(/^\/+/, "")}`}
                      alt={u.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <img
                      src="/placeholder-user.jpg"
                      alt={u.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardHeader className="relative">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{u.name}</CardTitle>
                  <CardDescription>
                    {u.generalDescription || u.shortDescriptions?.[0] || "Usuario"}
                  </CardDescription>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          aria-label="Copiar enlace"
                          className="inline-flex items-center justify-center rounded-md border bg-background hover:bg-accent/30 transition-all h-8 w-8 hover:scale-105 active:scale-95"
                          onClick={async (e) => {
                            e.preventDefault()
                            const url = `${window.location.origin}/portafolio/${u.id}`
                            try {
                              await navigator.clipboard.writeText(url)
                              toast.success("Enlace copiado", { description: url })
                            } catch {
                              toast.message("Copia el enlace", { description: url })
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copiar enlace</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="flex">
                  <Button asChild size="sm" className="w-full transition-all hover:translate-y-[-1px]">
                    <Link href={`/portafolio?id=${u.id}`}>Ver Portafolio</Link>
                  </Button>
                </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
