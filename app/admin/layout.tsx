"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/projects", label: "Proyectos" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/points", label: "Puntos" },
    { href: "/admin/contact-messages", label: "Mensajes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="font-semibold">← Volver al sitio</Link>
          <nav className="flex items-center gap-3 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md hover:bg-primary/10",
                  pathname === item.href && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
