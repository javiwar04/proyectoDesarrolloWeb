"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login } from "@/lib/api"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ identifier: "", password: "" })
  const [loading, setLoading] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.identifier || !form.password) {
      toast.error("Completa usuario/correo y contraseña")
      return
    }
    setLoading(true)
    try {
      const res = await login(form)
      // Guardar sesión mínima en localStorage
      localStorage.setItem("adminUser", JSON.stringify(res))
      toast.success("Bienvenido", { description: res.username || res.email })
      router.replace("/admin")
    } catch (err: any) {
      toast.error("Credenciales inválidas", { description: err?.message || "Inténtalo de nuevo" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Accede al panel de administración</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Usuario o correo</label>
              <Input name="identifier" value={form.identifier} onChange={onChange} placeholder="usuario o email" />
            </div>
            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <Input name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Entrando…" : "Entrar"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.replace("/")}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
