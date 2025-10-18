"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminContext } from "@/components/admin/admin-context";
import { getPointById, createPoint, updatePoint, getProjects } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function PointFormPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";
  const router = useRouter();
  const { selectedUserId, isUserVerified } = useAdminContext();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [projects, setProjects] = useState<Array<{ id: number; title: string; userId?: number }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const projs = await getProjects();
        setProjects(Array.isArray(projs) ? projs : []);
        if (!isNew) {
          const pt = await getPointById(Number(params.id));
          setDescription(pt?.description ?? "");
          setProjectId(Number(pt?.projectId) || "");
        }
      } catch (e) {
        setError("No se pudo cargar el formulario de puntos");
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, params.id]);

  const visibleProjects = useMemo(() => {
    if (!selectedUserId) return [] as Array<{ id: number; title: string; userId?: number }>;
    return (projects || []).filter((p: any) => Number(p?.userId ?? p?.UserId) === selectedUserId);
  }, [projects, selectedUserId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      if (!selectedUserId || !isUserVerified) throw new Error("Debes verificar al usuario para guardar puntos");
      const errs: Record<string, string> = {};
      if (!description.trim()) errs.description = "La descripción es obligatoria";
      const pid = Number(projectId);
      if (!pid || Number.isNaN(pid)) errs.projectId = "Selecciona un proyecto";
      // Asegura que el proyecto seleccionado pertenece al usuario verificado
      const allowed = visibleProjects.some(p => p.id === pid);
      if (!allowed) errs.projectId = "Debes seleccionar un proyecto propio";
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        throw new Error(Object.values(errs)[0]);
      }

      if (isNew) {
        await createPoint({ description: description.trim(), projectId: pid });
        toast.success("Punto creado");
      } else {
        await updatePoint(Number(params.id), { description: description.trim(), projectId: pid });
        toast.success("Punto actualizado");
      }
      router.push("/admin/points");
    } catch (e: any) {
      const msg = e?.message || "No se pudo guardar";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Nuevo punto" : "Editar punto"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Descripción <span className="text-red-600">*</span></label>
            <Input
              aria-invalid={!!fieldErrors.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beneficio, logro o característica"
              required
            />
            {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Proyecto <span className="text-red-600">*</span></label>
            <select
              className="w-full border rounded-md h-10 px-3 text-sm"
              aria-invalid={!!fieldErrors.projectId}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">Selecciona un proyecto</option>
              {visibleProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            {fieldErrors.projectId && <p className="text-xs text-red-600 mt-1">{fieldErrors.projectId}</p>}
            {selectedUserId && isUserVerified && visibleProjects.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No tienes proyectos aún para asociar puntos.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
