
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import AnimatedCounter from "@/components/animated-counter"
import SkillBar from "@/components/skill-bar"
import Typewriter from "@/components/typewriter"
import { getProjects, getUserById } from "@/lib/api"

interface User {
  id: number
  name: string
  shortDescriptions?: string[]
  generalDescription?: string
  profileImageUrl?: string
  yearsOfExperience?: number
  skillCategories?: { id: number; category: string; skills?: string[] }[]
  certifications?: { id: number; name?: string }[]
}

export default function PortafolioPresentacion() {
  const router = useRouter()
  const search = useSearchParams()
  const [userId, setUserId] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [projectsCount, setProjectsCount] = useState<number>(0)
  const [featured, setFeatured] = useState<any[]>([])

  // Inicializa el userId desde query (?id=) o localStorage, con fallback 1
  useEffect(() => {
    const q = search.get("id")
    if (q) {
      const idNum = Number(q)
      if (Number.isFinite(idNum) && idNum > 0) {
        localStorage.setItem("selectedUserId", String(idNum))
        setUserId(idNum)
        // Limpia la query de la URL
        router.replace("/portafolio")
        return
      }
    }
    const saved = Number(localStorage.getItem("selectedUserId") || "")
    if (Number.isFinite(saved) && saved > 0) {
      setUserId(saved)
    } else {
      localStorage.setItem("selectedUserId", "1")
      setUserId(1)
    }
  }, [router, search])

  // Carga de usuario
  useEffect(() => {
    if (!userId) return
    ;(async () => {
      setLoading(true)
      try {
        const u = await getUserById(userId)
        setUser(u ?? null)
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  // Carga y conteo de proyectos del usuario
  useEffect(() => {
    if (!userId) return
    ;(async () => {
      try {
        const list = await getProjects()
        const only = (Array.isArray(list) ? list : []).filter((p: any) => Number(p?.userId ?? p?.UserId) === userId)
        setProjectsCount(only.length)
        // Proyectos destacados (isFeatured true)
        const feats = only.filter((p: any) => Boolean(p?.isFeatured ?? p?.IsFeatured))
          .sort((a: any, b: any) => Number(b?.id ?? b?.Id) - Number(a?.id ?? a?.Id))
          .slice(0, 6)
        setFeatured(feats)
      } catch {
        setProjectsCount(0)
        setFeatured([])
      }
    })()
  }, [userId])

  const subtitle = useMemo(() => {
    if (!user) return ""
    if (Array.isArray(user.shortDescriptions) && user.shortDescriptions.length > 0) return user.shortDescriptions[0]!
    return user.generalDescription || ""
  }, [user])

  // Construir lista única de tecnologías desde skillCategories
  const uniqueSkills = useMemo(() => {
    if (!user) return [] as string[]
    const list = (user.skillCategories || [])
      .flatMap((c) => (c.skills || []).flatMap((s) => String(s).split(",")))
      .map((s) => s.trim())
      .filter(Boolean)
    return Array.from(new Set(list))
  }, [user])

  // Top skills para barras (máx 6) con porcentajes descendentes
  const topBars = useMemo(() => {
    const base = uniqueSkills.slice(0, 6)
    const perc = [92, 86, 80, 74, 68, 62]
    return base.map((skill, i) => ({ skill, percentage: perc[i] ?? 60 }))
  }, [uniqueSkills])

  if (loading || !userId) return <div className="max-w-4xl mx-auto px-4 py-10 text-muted-foreground">Cargando…</div>
  if (!user) return <div className="max-w-4xl mx-auto px-4 py-10">Usuario no encontrado.</div>

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/30 flex items-center justify-center overflow-hidden">
              {user?.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/${user.profileImageUrl.replace(/^\/+/, "")}`} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Hola, soy <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.name}</span>
          </h1>

          <div className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed min-h-[3rem]">
            <Typewriter texts={user.shortDescriptions && user.shortDescriptions.length > 0 ? user.shortDescriptions : [subtitle || ""]} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href={`/curriculum/${user.id}`}>Ver Curriculum</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href={`/proyectos`}>Ver Proyectos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2"><AnimatedCounter end={projectsCount} suffix="+" /></div>
            <p className="text-muted-foreground">Proyectos</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2"><AnimatedCounter end={user.yearsOfExperience ?? 0} suffix="+" /></div>
            <p className="text-muted-foreground">Años Experiencia</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2"><AnimatedCounter end={user.certifications?.length ?? 0} suffix="+" /></div>
            <p className="text-muted-foreground">Certificaciones</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              <AnimatedCounter end={(user.skillCategories || []).flatMap(c => (c.skills || []).flatMap(s => String(s).split(",").map(x => x.trim()).filter(Boolean))).filter((v, i, a) => a.indexOf(v) === i).length} suffix="+" />
            </div>
            <p className="text-muted-foreground">Tecnologías</p>
          </div>
        </div>
      </section>

      {/* Sección inferior mejorada: Stack principal + Tech cloud animada */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/10),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto space-y-12">
          {/* Stack principal con barras */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold">Mi stack principal</h2>
              <p className="text-muted-foreground">Un vistazo a mis tecnologías más utilizadas</p>
            </div>
            {topBars.length === 0 ? (
              <p className="text-center text-muted-foreground">Aún no hay habilidades registradas.</p>
            ) : (
              <div className="max-w-2xl mx-auto">
                {topBars.map((s) => (
                  <SkillBar key={s.skill} skill={s.skill} percentage={s.percentage} />
                ))}
              </div>
            )}
          </div>

          {/* Nube de tecnologías animada */}
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Explora mis tecnologías</h3>
              
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {uniqueSkills.slice(0, 24).map((s, i) => (
                <div
                  key={`${s}-${i}`}
                  className="group relative rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm flex items-center justify-center overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
                  style={{ animationDelay: `${(i % 6) * 200}ms` }}
                >
                  <span className="relative z-10">{s}</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 to-accent/10" />
                  <div className="absolute -inset-0.5 pointer-events-none rounded-lg blur-md opacity-0 group-hover:opacity-40 bg-gradient-to-r from-primary/30 to-accent/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mis proyectos destacados */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Mis proyectos destacados</h2>
            <p className="text-muted-foreground">Una selección de trabajos representativos</p>
          </div>
          {featured.length === 0 ? (
            <p className="text-center text-muted-foreground">Aún no hay proyectos destacados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p: any) => {
                const pid = Number(p?.id ?? p?.Id)
                const rawImg: string | undefined = p?.imageUrl || (Array.isArray(p?.imageUrls) ? p.imageUrls[0] : undefined)
                const img = rawImg ? `/api/media/${String(rawImg).replace(/^\/+/, "")}` : "/placeholder.jpg"
                const techs: string[] = Array.isArray(p?.technologies)
                  ? p.technologies
                  : typeof p?.technologies === "string"
                  ? String(p.technologies).split(",").map((t: string) => t.trim()).filter(Boolean)
                  : []
                return (
                  <Card key={pid} className="overflow-hidden group">
                    <div className="aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium line-clamp-1">{p.title}</div>
                          {p.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                          )}
                        </div>
                        <Badge className="bg-yellow-500/90 text-black">Destacado</Badge>
                      </div>
                      {techs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {techs.slice(0, 4).map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                          {techs.length > 4 && (
                            <span className="text-xs text-muted-foreground">+{techs.length - 4}</span>
                          )}
                        </div>
                      )}
                      <div className="pt-2">
                        <Button asChild size="sm">
                          <Link href={`/proyecto/${pid}`}>Ver proyecto</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, toMediaUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Project = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  technologies?: string[];
  projectUrl?: string;
  codeUrl?: string;
};

export default function PortafolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudieron cargar los proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "3s" }}
        ></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Mi Portafolio</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Una colección de proyectos que demuestran mis habilidades en desarrollo web y móvil
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-6"></div>
          </div>

          {loading ? (
            <div className="text-center text-lg text-muted-foreground">Cargando proyectos...</div>
          ) : error ? (
            <div className="text-center flex flex-col items-center gap-4">
              <span className="text-red-500">{error}</span>
              <Button onClick={load}>Reintentar</Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-muted-foreground">No hay proyectos disponibles por ahora.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project: Project) => (
                <Link key={project.id} href={`/portafolio/${project.id}`} className="block">
                <Card
                  className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 border-0 bg-card/90 backdrop-blur-sm overflow-hidden"
                >
                  <div className="aspect-video overflow-hidden rounded-t-lg relative">
                    <img
                      src={project.imageUrl ? `/api/media/${project.imageUrl.replace(/^\/+/, "")}` : "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(project.technologies || []).map((tech: string) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs hover:bg-primary/10 transition-colors duration-200"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {project.projectUrl && (
                        <Button
                          size="sm"
                          className="flex-1 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(project.projectUrl!, "_blank", "noopener,noreferrer");
                          }}
                        >
                          Ver Demo
                        </Button>
                      )}
                      {project.codeUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(project.codeUrl!, "_blank", "noopener,noreferrer");
                          }}
                        >
                          Ver Código
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4 text-lg">¿Tienes una idea de proyecto? ¡Hablemos!</p>
            <Button asChild size="lg" className="glow-effect">
              <a href="/contacto">Iniciar Conversación →</a>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
