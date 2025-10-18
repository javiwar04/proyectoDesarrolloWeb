"use client";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminContext } from "@/components/admin/admin-context";
import { getProjects, toMediaUrl, deleteProject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { getProjects, deleteProject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";


type Project = {
  id: number;
  title: string;

  description?: string;
  userId?: number;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  technologies?: string[] | string;
  isFeatured?: boolean;
};

export default function AdminProjectsPage() {
  const { selectedUserId, isUserVerified } = useAdminContext();

  description: string;
};

export default function AdminProjectsPage() {

  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();

      const list = Array.isArray(data) ? data : [];
      // Guarda todos; se filtra en render según selectedUserId para evitar mostrar ajenos
      setItems(list);

      setItems(Array.isArray(data) ? data : []);

    } catch (e) {
      setError("No se pudieron cargar los proyectos");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (rawId: number | undefined) => {
    const id = Number(rawId);
    if (!id || Number.isNaN(id)) {
      toast.error("ID de proyecto inválido");
      return;
    }
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    try {
      await deleteProject(id);
      setItems(prev => prev.filter((p: any) => Number(p?.id ?? p?.Id) !== id));
      toast.success("Se eliminó correctamente");
    } catch (e: any) {
      toast.error(e?.message || "No se pudo eliminar");

  const onDelete = async (id: number) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    try {
      await deleteProject(id);
      await load();
    } catch (e) {
      alert("Error eliminando el proyecto");

    }
  };

  useEffect(() => { load(); }, []);

  // Si cambia el usuario seleccionado, recalculamos la vista (sin re-fetch es suficiente)
  // Opcionalmente, podríamos recargar del backend si hace falta
  // useEffect(() => { load(); }, [selectedUserId]);

  const visibleItems = useMemo(() => {
    if (!selectedUserId) return [] as Project[];
    return (items || []).filter((p: any) => Number(p?.userId ?? p?.UserId) === selectedUserId);
  }, [items, selectedUserId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis proyectos</h1>
        <Button asChild disabled={!selectedUserId || !isUserVerified}>
          <Link href="/admin/projects/new">Nuevo proyecto</Link>
        </Button>
      </div>
      {(!selectedUserId || !isUserVerified) && (
        <p className="text-sm text-amber-600">Selecciona y verifica un usuario en el Dashboard para administrar sus proyectos.</p>
      )}


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Proyectos</h1>
        <Button asChild>
          <Link href="/admin/projects/new">Nuevo proyecto</Link>
        </Button>
      </div>


      {loading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : error ? (
        <div className="flex items-center gap-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={load} variant="outline">Reintentar</Button>
        </div>

      ) : (!selectedUserId || !isUserVerified) ? (
        <p className="text-muted-foreground">No hay proyectos para mostrar.</p>
      ) : visibleItems.length === 0 ? (
        <p className="text-muted-foreground">No hay proyectos aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((p: any) => {
            const pid = Number(p?.id ?? p?.Id);
            const img = toMediaUrl(p.imageUrl || p.imageUrls?.[0]) || "/placeholder.jpg";
            const techs: string[] = Array.isArray(p.technologies)
              ? p.technologies
              : typeof p.technologies === "string"
              ? p.technologies.split(",").map((t: string) => t.trim()).filter(Boolean)
              : [];
            return (
              <Card key={pid || p.id} className="overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img src={img} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    </div>
                    {p.isFeatured && <Badge className="bg-yellow-500 text-black">Destacado</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {techs.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Button asChild className="w-full sm:flex-1" disabled={!pid}>
                      <Link href={`/admin/projects/${pid}`}>Editar</Link>
                    </Button>
                    <Button variant="destructive" className="w-full sm:flex-1" onClick={() => onDelete(pid)} disabled={!pid}>Eliminar</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No hay proyectos aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">{p.title}</CardTitle>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/projects/${p.id}`}>Editar</Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(p.id)}>Eliminar</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
              </CardContent>
            </Card>
          ))}

        </div>
      )}
    </div>
  );
}
