"use client";

import Link from "next/link";
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
