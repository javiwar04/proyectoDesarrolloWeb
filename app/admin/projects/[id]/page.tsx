"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById, createProject, updateProject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectFormPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const data = await getProjectById(Number(params.id));
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setProjectUrl(data.projectUrl ?? "");
        setCodeUrl(data.codeUrl ?? "");
        const techs = Array.isArray(data.technologies) ? data.technologies.join(",") : "";
        setTechnologies(techs);
      } catch (e) {
        setError("No se pudo cargar el proyecto");
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      if (projectUrl) fd.append("projectUrl", projectUrl);
      if (codeUrl) fd.append("codeUrl", codeUrl);
      if (technologies) {
        // El backend puede esperar una lista; según tu implementación, ajusta este nombre/formato
        for (const t of technologies.split(",").map((s) => s.trim()).filter(Boolean)) {
          fd.append("technologies", t);
        }
      }
      if (imageFile) fd.append("imageFile", imageFile);

      if (isNew) {
        await createProject(fd);
      } else {
        await updateProject(Number(params.id), fd);
      }
      router.push("/admin/projects");
    } catch (e) {
      setError("No se pudo guardar el proyecto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm mb-1">Título</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Descripción</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">URL del proyecto (demo)</label>
          <Input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">URL del código</label>
          <Input value={codeUrl} onChange={(e) => setCodeUrl(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Tecnologías (separadas por coma)</label>
        <Input value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, .NET, SQL" />
      </div>
      <div>
        <label className="block text-sm mb-1">Imagen</label>
        <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
