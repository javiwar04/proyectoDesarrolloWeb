"use client";

import { useEffect, useState } from "react";
import { getProjects, deleteProject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type Project = {
  id: number;
  title: string;
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
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudieron cargar los proyectos");
    } finally {
      setLoading(false);
    }
  };

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
