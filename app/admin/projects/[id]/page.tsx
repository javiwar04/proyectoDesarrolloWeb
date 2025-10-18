"use client";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById, createProjectWithImage, updateProjectWithImage, toMediaUrl } from "@/lib/api";
import { useAdminContext } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(value: string): string {
  const v = (value || "").trim();
  if (!v) return v;
  // Si comienza con www. o parece dominio sin esquema, prefija https://
  const looksLikeDomain = /^(www\.)?[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(v);
  if (!/^https?:\/\//i.test(v) && looksLikeDomain) {
    return `https://${v}`;
  }
  return v;
}

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  const [technologies, setTechnologies] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingMainUrl, setExistingMainUrl] = useState<string | null>(null);
  // Ruta cruda que espera el backend (ej: "images/abc.jpg")
  const [existingMainRaw, setExistingMainRaw] = useState<string | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [removeUrls, setRemoveUrls] = useState<string[]>([]);
  const { selectedUserId, isUserVerified } = useAdminContext();

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

    const techs = Array.isArray(data.technologies) ? data.technologies.join(", ") : (typeof data.technologies === "string" ? data.technologies : "");
        setTechnologies(techs);
        setIsFeatured(Boolean((data as any)?.isFeatured));
  const urls: string[] = Array.isArray((data as any)?.imageUrls) ? (data as any).imageUrls : [];
        setExistingUrls(urls);
  // Determina imagen principal existente (ImageUrl o primera de ImageUrls)
  const main = (data as any)?.imageUrl || urls[0] || null;
  setExistingMainRaw(main ?? null);
  const media = main ? toMediaUrl(main) : undefined;
  setExistingMainUrl(media ?? null);
  setImagePreview(media ?? null);

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

    setFieldErrors({});
    try {
      if (!selectedUserId || !isUserVerified) {
        throw new Error("Debes verificar al usuario para guardar proyectos");
      }
      // Validaciones obligatorias
      const errs: Record<string, string> = {};
      if (!title.trim()) errs.title = "El título es obligatorio";
      if (!description.trim()) errs.description = "La descripción es obligatoria";
      const normalizedUrl = normalizeUrl(projectUrl);
      if (!normalizedUrl.trim()) {
        errs.projectUrl = "La URL del proyecto es obligatoria";
      } else if (!isValidHttpUrl(normalizedUrl)) {
        errs.projectUrl = "Ingresa una URL válida (incluye http:// o https://)";
      }
      if (!technologies.trim()) errs.technologies = "Las tecnologías son obligatorias";
  // Valida imagen principal y al menos una adicional tanto en creación como en edición
  const hasMainAfter = !!imageFile || !!existingMainUrl;
      if (!hasMainAfter) errs.image = "La imagen principal es obligatoria";
  const remainingExistingExtras = existingUrls.filter((u) => !removeUrls.includes(u)).length;
  const totalExtrasAfter = remainingExistingExtras + extraImages.length;
      if (totalExtrasAfter < 1) errs.images = "Agrega al menos una imagen adicional";
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        const first = Object.values(errs)[0];
        throw new Error(first);
      }
  const fd = new FormData();
      // Campos esperados por ProjectFormModel en el backend
      fd.append("Title", title);
      fd.append("Description", description);
      fd.append("UserId", String(selectedUserId));
  // Enviar URL normalizada
  fd.append("ProjectUrl", normalizeUrl(projectUrl));
      if (!isNew) {
        // Algunos backends requieren Id también en el form para validar; no afecta si se ignora
        fd.append("Id", String(params.id));
      }
      // Backend espera array<string> para Technologies: enviar entradas repetidas
      const techItems = technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (techItems.length > 0) {
        for (const t of techItems) fd.append("Technologies", t);
      } else {
        // Enviar la clave aunque esté vacía para evitar problemas de binding
        fd.append("Technologies", "");
      }
      fd.append("IsFeatured", String(isFeatured));
      if (imageFile) {
        fd.append("Image", imageFile);
      } else if (existingMainRaw) {
        // Si no cambia la imagen principal, enviar la ruta existente que el backend entiende
        fd.append("ImageUrl", existingMainRaw);
      }
      if (extraImages.length > 0) {
        for (const img of extraImages) {
          fd.append("Images", img);
        }
      }
      if (!isNew && removeUrls.length > 0) {
        removeUrls.forEach((url) => fd.append("RemoveImageUrls", url));
      }

      const goAdminProjects = () => {
        if (typeof window !== "undefined") {
          window.location.href = "http://localhost:3000/admin/projects";
        } else {
          router.push("/admin/projects");
        }
      };

      if (isNew) {
        const created = await createProjectWithImage(fd);
        toast.success("Se registró correctamente");
        const newId = Number((created as any)?.id);
        if (Number.isFinite(newId)) {
          goAdminProjects();
        } else {
          goAdminProjects();
        }
      } else {
        await updateProjectWithImage(Number(params.id), fd);
        toast.success("Se editó correctamente");
        goAdminProjects();
      }
    } catch (e: any) {
      const msg = e?.message || "No se pudo guardar el proyecto";
      setError(msg);
      toast.error(msg);

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

    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Datos del proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Título <span className="text-red-600">*</span></label>
            <Input aria-invalid={!!fieldErrors.title} value={title} onChange={(e) => setTitle(e.target.value)} required />
            {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Descripción <span className="text-red-600">*</span></label>
            <Textarea aria-invalid={!!fieldErrors.description} value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
            {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">URL del proyecto (demo) <span className="text-red-600">*</span></label>
              <Input
                type="url"
                inputMode="url"
                placeholder="https://mi-sitio.com/demo"
                aria-invalid={!!fieldErrors.projectUrl}
                value={projectUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setProjectUrl(val);
                  // Valida en caliente y limpia error si corrige
                  const n = normalizeUrl(val);
                  if (fieldErrors.projectUrl) {
                    if (n && isValidHttpUrl(n)) {
                      setFieldErrors((prev) => ({ ...prev, projectUrl: "" }));
                    }
                  }
                }}
                onBlur={() => {
                  const n = normalizeUrl(projectUrl);
                  setProjectUrl(n);
                  if (!n || !isValidHttpUrl(n)) {
                    setFieldErrors((prev) => ({ ...prev, projectUrl: "Ingresa una URL válida (incluye http:// o https://)" }));
                  }
                }}
                required
              />
              {fieldErrors.projectUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.projectUrl}</p>}
            </div>
            <div className="flex items-center gap-2 pt-6 md:pt-0">
              <input id="featured" type="checkbox" className="h-4 w-4" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <label htmlFor="featured" className="text-sm">Marcar como destacado</label>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Tecnologías (separadas por coma) <span className="text-red-600">*</span></label>
            <Input aria-invalid={!!fieldErrors.technologies} value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, .NET, SQL" required />
            {fieldErrors.technologies && <p className="text-xs text-red-600 mt-1">{fieldErrors.technologies}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagen principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {imagePreview && (
            <img src={imagePreview} alt="Previsualización" className="h-40 w-full object-cover rounded-md border" />
          )}
          <Input type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setImageFile(f);
            if (f) {
              const url = URL.createObjectURL(f);
              if (imagePreview?.startsWith("blob:")) {
                try { URL.revokeObjectURL(imagePreview); } catch {}
              }
              setImagePreview(url);
            } else {
              if (imagePreview?.startsWith("blob:")) {
                try { URL.revokeObjectURL(imagePreview); } catch {}
              }
              // Restaurar imagen principal existente si no hay archivo nuevo
              setImagePreview(existingMainUrl);
            }
          }} />
          {fieldErrors.image && <p className="text-xs text-red-600">{fieldErrors.image}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes adicionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Imágenes existentes del proyecto (del backend) */}
          {existingUrls.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Existentes</div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {existingUrls.map((url, i) => {
                  const isMarked = removeUrls.includes(url);
                  return (
                    <div key={i} className={`relative rounded-md overflow-hidden border ${isMarked ? 'opacity-50 grayscale' : ''}`}>
                      <img src={`/api/media/${String(url).replace(/^\/+/, '')}`} alt={`existente-${i+1}`} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        className={`absolute top-1 right-1 ${isMarked ? 'bg-gray-600' : 'bg-red-600'} text-white text-xs rounded-full px-1.5 py-0.5 shadow-lg border border-white/70`}
                        onClick={() => {
                          setRemoveUrls(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
                        }}
                        aria-label="Marcar para eliminar"
                        title={isMarked ? 'Restaurar' : 'Eliminar esta imagen'}
                      >
                        {isMarked ? '↺' : '×'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Las imágenes marcadas se eliminarán al guardar.</p>
            </div>
          )}

          {extraPreviews.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {extraPreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`extra-${i+1}`} className="h-24 w-full object-cover rounded-md border" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 shadow-lg border border-white/70"
                    onClick={() => {
                      setExtraImages(prev => prev.filter((_, idx) => idx !== i));
                      const url = extraPreviews[i];
                      if (url?.startsWith("blob:")) {
                        try { URL.revokeObjectURL(url); } catch {}
                      }
                      setExtraPreviews(prev => prev.filter((_, idx) => idx !== i));
                    }}
                    aria-label="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              setExtraImages(prev => [...prev, ...files]);
              const urls = files.map(f => URL.createObjectURL(f));
              setExtraPreviews(prev => [...prev, ...urls]);
            }}
          />
          {fieldErrors.images && <p className="text-xs text-red-600">{fieldErrors.images}</p>}
          {extraPreviews.length > 0 && (
            <div className="text-xs text-muted-foreground">Puedes arrastrar para reordenar en una futura mejora.</div>
          )}
        </CardContent>
      </Card>

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
