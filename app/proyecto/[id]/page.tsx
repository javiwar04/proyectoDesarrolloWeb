"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getProjectById, getPoints } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Project = {
  id: number;
  title: string;
  description: string;
  technologies?: string[];
  projectUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
  user?: {
    id: number;
    name: string;
    email?: string;
    bio?: string;
    profileImageUrl?: string;
  } | null;
};

type Point = { id: number; description?: string; projectId?: number };

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [needsSelection, setNeedsSelection] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!carouselApi) return;
    if (isHovering) return;
    const id = setInterval(() => {
      try {
        carouselApi?.scrollNext();
      } catch {}
    }, 3500);
    return () => clearInterval(id);
  }, [carouselApi, isHovering]);

  // Cargar el usuario seleccionado desde localStorage (si no hay, se bloqueará la vista)
  useEffect(() => {
    const saved = Number(localStorage.getItem("selectedUserId") || "");
    if (Number.isFinite(saved) && saved > 0) {
      setSelectedUserId(saved);
    } else {
      setNeedsSelection(true);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    if (selectedUserId === null) return; // Espera a conocer el usuario seleccionado o marcar needsSelection
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getProjectById(id);
        // Determinar propietario del proyecto
        const ownerId = Number((p as any)?.user?.id ?? (p as any)?.userId ?? 0);
        if (!ownerId || ownerId !== selectedUserId) {
          // Bloquear acceso si no pertenece al usuario guardado (o no se puede determinar)
          setBlocked(true);
          setProject(null);
          setPoints([]);
        } else {
          setProject(p ?? null);
          const pts = await getPoints();
          setPoints(Array.isArray(pts) ? pts.filter((x: any) => x.projectId === id) : []);
        }
      } catch (e) {
        setError("No se pudo cargar el proyecto");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, selectedUserId]);

  const images = useMemo(() => {
    const list: string[] = [];
    if (project?.imageUrl) list.push(project.imageUrl);
    if (Array.isArray(project?.imageUrls)) list.push(...(project?.imageUrls ?? []));
    return list;
  }, [project]);

  if (needsSelection)
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="mb-4">Debes seleccionar un portafolio antes de ver proyectos.</p>
        <Button asChild>
          <a href="/portafolios">Ir a Portafolios</a>
        </Button>
      </div>
    );
  if (loading) return <div className="max-w-5xl mx-auto px-4 py-10 text-muted-foreground">Cargando…</div>;
  if (error) return <div className="max-w-5xl mx-auto px-4 py-10 text-red-500">{error}</div>;
  if (blocked || !project) return <div className="max-w-5xl mx-auto px-4 py-10">Proyecto no encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-muted-foreground">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {(project.technologies || []).map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
        <div className="flex gap-3">
          {project.projectUrl && (
            <Button asChild>
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">Ver demo</a>
            </Button>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Carousel
            className="w-full"
            opts={{ loop: true, align: "start" }}
            setApi={(api) => {
              if (!api) return;
              setCarouselApi(api);
              setCurrent(api.selectedScrollSnap());
              api.on("select", () => setCurrent(api.selectedScrollSnap()));
            }}
          >
            <CarouselContent>
              {images.map((img, i) => (
                <CarouselItem key={i}>
                  <div
                    className="relative overflow-hidden rounded-lg group cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img
                      src={`/api/media/${img.replace(/^\/+/, "")}`}
                      alt={`${project.title} - imagen ${i + 1}`}
                      className="w-full h-[420px] md:h-[520px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-8" />
            <CarouselNext className="-right-4 md:-right-8" />
          </Carousel>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrent(i);
                    carouselApi?.scrollTo(i);
                  }}
                  onMouseEnter={() => {
                    setCurrent(i);
                    carouselApi?.scrollTo(i);
                  }}
                  className={`relative rounded-md overflow-hidden border ${
                    current === i ? "border-primary ring-2 ring-primary/40" : "border-border"
                  }`}
                  aria-label={`Ir a imagen ${i + 1}`}
                >
                  <img
                    src={`/api/media/${img.replace(/^\/+/, "")}`}
                    alt={`miniatura ${i + 1}`}
                    className="w-full h-16 object-cover hover:brightness-110"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Puntos clave</CardTitle>
        </CardHeader>
        <CardContent>
          {points.length === 0 ? (
            <p className="text-muted-foreground">Este proyecto aún no tiene puntos registrados.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {points.map((pt) => (
                <li key={pt.id}>{pt.description}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {project.user && (
        <Card>
          <CardHeader>
            <CardTitle>Autor</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {project.user.profileImageUrl && (
              <img
                src={`/api/media/${project.user.profileImageUrl.replace(/^\/+/, "")}`}
                alt={project.user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-medium">{project.user.name}</p>
              {project.user.email && (
                <p className="text-sm text-muted-foreground">{project.user.email}</p>
              )}
              {project.user.bio && (
                <p className="text-sm text-muted-foreground mt-1">{project.user.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="w-[95vw] max-w-screen-xl p-0 bg-black/90 border-0 overflow-hidden">
          {images.length > 0 && (
            <div className="relative w-full max-h-[85vh]">
              <Carousel className="w-full" opts={{ loop: true, align: "center" }}>
                <CarouselContent>
                  {images.map((img, i) => (
                    <CarouselItem key={i}>
                      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
                        <img
                          src={`/api/media/${img.replace(/^\/+/, "")}`}
                          alt={`${project.title} - imagen ${i + 1}`}
                          className="max-h-[80vh] w-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-6" />
                <CarouselNext className="-right-6" />
              </Carousel>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
