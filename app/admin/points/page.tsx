"use client";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPoints, getProjects, deletePoint } from "@/lib/api";
import { useAdminContext } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type Point = { id: number; description: string; projectId: number };
type Project = { id: number; title: string; userId?: number };

export default function AdminPointsPage() {
  const { selectedUserId, isUserVerified } = useAdminContext();
  const [points, setPoints] = useState<Point[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

import { useEffect, useState } from "react";
import { getPoints } from "@/lib/api";

type Point = { id: number; name?: string; value?: number };

export default function AdminPointsPage() {
  const [items, setItems] = useState<Point[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {

      const [pts, projs] = await Promise.all([getPoints(), getProjects()]);
      setPoints(Array.isArray(pts) ? pts : []);
      setProjects(Array.isArray(projs) ? projs : []);

      const data = await getPoints();
      setItems(Array.isArray(data) ? data : []);

    } catch (e) {
      setError("No se pudieron cargar los puntos");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);

  const visibleProjects = useMemo(() => {
    if (!selectedUserId) return [] as Project[];
    return (projects || []).filter((p: any) => Number(p?.userId ?? p?.UserId) === selectedUserId);
  }, [projects, selectedUserId]);

  const pointsForUser = useMemo(() => {
    const projectIds = new Set(visibleProjects.map(p => p.id));
    return (points || []).filter(pt => projectIds.has(pt.projectId));
  }, [points, visibleProjects]);

  const onDelete = async (id: number) => {
    if (!confirm("¿Eliminar este punto?")) return;
    try {
      await deletePoint(id);
      setPoints(prev => prev.filter(p => p.id !== id));
      toast.success("Punto eliminado");
    } catch (e: any) {
      toast.error(e?.message || "No se pudo eliminar");
    }
  };

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;
  if (error) return (
    <div className="flex items-center gap-4">
      <p className="text-red-500">{error}</p>
      <Button onClick={load} variant="outline">Reintentar</Button>
    </div>
  );

  const canCreate = !!selectedUserId && isUserVerified && visibleProjects.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Puntos por proyecto</h1>
        <Button asChild disabled={!canCreate}>
          <Link href="/admin/points/new">Nuevo punto</Link>
        </Button>
      </div>
      {(!selectedUserId || !isUserVerified) && (
        <p className="text-sm text-amber-600">Selecciona y verifica un usuario en el Dashboard para administrar puntos.</p>
      )}
      {selectedUserId && isUserVerified && visibleProjects.length === 0 && (
        <p className="text-sm text-amber-600">Este usuario no tiene proyectos aún. Crea un proyecto para poder agregar puntos.</p>
      )}
      {pointsForUser.length === 0 ? (
        <p className="text-muted-foreground">No hay puntos aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pointsForUser.map((pt) => {
            const project = visibleProjects.find(p => p.id === pt.projectId);
            return (
              <Card key={pt.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="text-sm text-muted-foreground">Proyecto</div>
                  <div className="font-medium">{project?.title ?? `ID ${pt.projectId}`}</div>
                  <div className="text-sm">{pt.description}</div>
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm"><Link href={`/admin/points/${pt.id}`}>Editar</Link></Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(pt.id)}>Eliminar</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold mb-2">Puntos</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Sin puntos.</p>
      ) : (
        <ul className="list-disc pl-5">
          {items.map((p) => (
            <li key={p.id}>{p.name ?? `Punto #${p.id}`} — {p.value ?? 0}</li>
          ))}
        </ul>

      )}
    </div>
  );
}
