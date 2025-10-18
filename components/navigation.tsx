"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Menu, X, User, Home, FolderOpen, Mail, Briefcase, FileText, Shield } from "lucide-react"
import { getUserById, login } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const navItems = [
  { href: "/portafolio", label: "Inicio", icon: Home },
  { href: "/portafolios", label: "Portafolios", icon: FolderOpen },
  { href: "/proyectos", label: "Proyectos", icon: Briefcase },
  { href: "/curriculum", label: "Curriculum", icon: FileText },
  { href: "/contacto", label: "Contacto", icon: Mail },
]

type HeaderUser = { id: number; name: string; experienceLevel?: string; yearsOfExperience?: number }

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<HeaderUser | null>(null)
  // Estado para verificación antes de ir a Admin
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyTarget, setVerifyTarget] = useState<HeaderUser | null>(null)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  // Cargar usuario seleccionado para mostrar su nombre y experiencia
  useEffect(() => {
    const saved = Number(localStorage.getItem("selectedUserId") || "")
    if (!Number.isFinite(saved) || saved <= 0) return
    ;(async () => {
      try {
        const u = await getUserById(saved)
        if (u) setUser({ id: u.id, name: u.name, experienceLevel: u.experienceLevel, yearsOfExperience: u.yearsOfExperience })
      } catch {}
    })()
  }, [])

  // Detectar sesión de admin (simplemente si existe en localStorage)
  // Ya no usamos sesión global; el acceso Admin pedirá credenciales del usuario seleccionado

  // Actualizar estado de sesión cuando cambia la ruta (mismo tab)
  useEffect(() => {
    // Cierra menú al cambiar ruta
    setIsMenuOpen(false)
  }, [pathname])

  const onAdminClick = async () => {
    const saved = Number(localStorage.getItem("selectedUserId") || "")
    if (!Number.isFinite(saved) || saved <= 0) {
      toast.info("Primero selecciona un portafolio")
      router.push("/portafolios")
      return
    }
    try {
      const u = await getUserById(saved)
      if (!u) throw new Error("Usuario no encontrado")
      setVerifyTarget({ id: u.id, name: u.name })
      setIdentifier("")
      setPassword("")
      setVerifyError(null)
      setVerifyOpen(true)
    } catch (e: any) {
      toast.error("No se pudo obtener el usuario", { description: e?.message || "Inténtalo de nuevo" })
    }
  }

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyTarget) return
    setVerifying(true)
    setVerifyError(null)
    try {
      const resp = await login({ identifier, password })
      if (!resp?.userId || resp.userId !== verifyTarget.id) {
        throw new Error("Credenciales inválidas para el usuario seleccionado")
      }
      // Persistir selección y verificación para el AdminProvider
      localStorage.setItem("selectedAdminUser", JSON.stringify({ id: verifyTarget.id, name: verifyTarget.name }))
      localStorage.setItem("verifiedAdminUserId", String(resp.userId))
      setVerifyOpen(false)
      router.push("/admin")
    } catch (err: any) {
      setVerifyError(err?.message || "No se pudo verificar")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/portafolio" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">{user?.name ?? "Tu Portafolio"}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 -mt-0.5">
                {user?.experienceLevel ? user.experienceLevel : user?.yearsOfExperience != null ? `${user.yearsOfExperience}+ años` : "Selecciona un usuario"}
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {/* Admin: solicita credenciales del usuario seleccionado y luego navega */}
            <button
              onClick={onAdminClick}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname?.startsWith("/admin")
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </button>
          </nav>

          <div className="hidden md:block">
            <Link
              href="/contacto"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Contáctame
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              {/* Admin en móvil */}
              <button
                onClick={() => { onAdminClick(); }}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname?.startsWith("/admin")
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </button>
              <Link
                href="/contacto"
                onClick={() => setIsMenuOpen(false)}
                className="mx-4 mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-all duration-300"
              >
                Contáctame
              </Link>
            </nav>
          </div>
        )}
      </div>
      {/* Diálogo de verificación para el acceso Admin */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar credenciales</DialogTitle>
            <DialogDescription>
              {verifyTarget ? (
                <>Ingresa las credenciales de <strong>{verifyTarget.name}</strong> para entrar al panel.</>
              ) : (
                "Selecciona un portafolio primero"
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onVerifySubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Usuario o email</label>
              <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={verifying}>{verifying ? "Verificando…" : "Entrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}

export { Navigation }
