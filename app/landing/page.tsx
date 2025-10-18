"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getUsers } from "@/lib/api"

interface User {
  id: number
  name: string
  generalDescription?: string
  shortDescriptions?: string[]
}

export default function Landing() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Bienvenido</h1>
          <p className="text-sm text-muted-foreground">Selecciona un usuario para ver su presentación y curriculum.</p>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Portafolios Disponibles</h2>
            <span className="text-xs text-muted-foreground">{loading ? "Cargando..." : `${users.length} usuario(s)`}</span>
          </div>

          {users.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay usuarios registrados aún.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="max-w-[500px] truncate">
                      {u.generalDescription || u.shortDescriptions?.[0] || "Curriculum"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/portafolio?id=${u.id}`}>Presentación</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/curriculum/${u.id}`}>Curriculum</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  )
}
