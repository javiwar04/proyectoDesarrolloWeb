"use client";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "@/components/admin/admin-context";
import { VerifyUserDialog } from "@/components/admin/verify-user-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FolderOpen, User, MessageSquareText, ListChecks } from "lucide-react";

type U = { id: number; name: string; email?: string; experienceLevel?: string; yearsOfExperience?: number };

const tiles = [
  { href: "/admin/projects", title: "Proyectos", desc: "Crear, editar y eliminar proyectos", icon: FolderOpen },
  { href: "/admin/users", title: "Usuarios", desc: "Gestionar datos del usuario/autor", icon: User },
  { href: "/admin/points", title: "Puntos", desc: "Administrar puntos/skills o logros", icon: ListChecks },
  { href: "/admin/contact-messages", title: "Mensajes", desc: "Ver mensajes de contacto", icon: MessageSquareText },
];

export default function AdminHome() {
  const { selectedUser, isUserVerified, clearSelected } = useAdminContext();

  const initials = (name?: string) => name?.split(" ").map((s) => s[0]).slice(0,2).join("")?.toUpperCase() || "U";

  return (
    <div className="space-y-8">
      {/* Encabezado bonito con estado de selección */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Panel de administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios, proyectos, puntos y mensajes.</p>
        </div>
        {selectedUser ? (
          <Card className="min-w-[240px]">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Usuario seleccionado</CardDescription>
              <CardTitle className="text-base flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{initials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                {selectedUser.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" size="sm" onClick={() => clearSelected()}>
                Cambiar Usuario (ver todos)
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Paso 1 removido: usar el selector del header para elegir usuario */}
      {!selectedUser && (
        <section className="space-y-2">
          <h2 className="text-xl font-medium">1) Selecciona un usuario</h2>
          <p className="text-sm text-muted-foreground">Usa el selector de la parte superior para elegir a quién administrar.</p>
          <div>
            <Button asChild variant="outline">
              <Link href="/admin/users/new">Crear usuario</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Step 2: Accesos del panel */}
      <section className={cn("space-y-4", !selectedUser && "opacity-50 pointer-events-none")}> 
        <div>
          <h2 className="text-xl font-medium">2) Administrar contenido</h2>
          <p className="text-sm text-muted-foreground">Accede a las secciones del usuario seleccionado.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiles.map((t) => {
            const Icon = t.icon;
            const card = (
              <Link key={t.href} href={t.href} className={cn((!selectedUser) && "pointer-events-none")}> 
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="flex-row items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>{t.title}</CardTitle>
                      <CardDescription>{t.desc}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
            if (selectedUser && !isUserVerified) {
              return (
                <VerifyUserDialog key={t.href}>
                  {card}
                </VerifyUserDialog>
              );
            }
            return card;
          })}
        </div>
      </section>

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiles = [
  { href: "/admin/projects", title: "Proyectos", desc: "Crear, editar y eliminar proyectos" },
  { href: "/admin/users", title: "Usuarios", desc: "Gestionar datos del usuario/autor" },
  { href: "/admin/points", title: "Puntos", desc: "Administrar puntos/skills o logros" },
  { href: "/admin/contact-messages", title: "Mensajes", desc: "Ver mensajes de contacto" },
];

export default function AdminHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tiles.map((t) => (
        <Link key={t.href} href={t.href}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t.desc}</p>
            </CardContent>
          </Card>
        </Link>
      ))}

    </div>
  );
}
