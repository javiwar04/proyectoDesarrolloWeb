"use client"


import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function CurriculumMaskedPage() {
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    const q = search.get("id")
    if (q) {
      const idNum = Number(q)
      if (Number.isFinite(idNum) && idNum > 0) {
        localStorage.setItem("selectedUserId", String(idNum))
        router.replace(`/curriculum/${idNum}`)
        return
      }
    }
    const saved = Number(localStorage.getItem("selectedUserId") || "")
    if (Number.isFinite(saved) && saved > 0) {
      router.replace(`/curriculum/${saved}`)
    } else {
      localStorage.setItem("selectedUserId", "1")
      router.replace(`/curriculum/1`)
    }
  }, [router, search])

  return <div className="max-w-4xl mx-auto px-4 py-10 text-muted-foreground">Cargando curriculum…</div>

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Download, MapPin, Mail, Phone, Calendar, Award, Briefcase, GraduationCap, Github, Linkedin, Twitter, Instagram, Globe } from "lucide-react"
import { getUsers } from "@/lib/api"

type User = {
  id: number
  name: string
  email?: string
  phone?: string
  generalDescription?: string
  location?: string
  profileImageUrl?: string
  yearsOfExperience?: number
  experienceLevel?: string
  skillCategories?: { category: string; skills: string[] }[]
  experiences?: {
    company: string
    position: string
    period?: string
    location?: string
    description?: string
    achievements?: string[]
  }[]
  educations?: {
    institution: string
    degree: string
    period?: string
    description?: string
  }[]
  githubUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  websiteUrl?: string
}

export default function CurriculumPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const normalizeUser = (raw: any): User => {
    if (!raw) return raw
    return {
      ...raw,
      profileImageUrl: raw.profileImageUrl ?? raw.ProfileImageUrl ?? raw.imageUrl ?? raw.ImageUrl,
      githubUrl: raw.githubUrl ?? raw.GitHubUrl ?? raw.GithubUrl ?? raw.github ?? undefined,
      linkedinUrl: raw.linkedinUrl ?? raw.LinkedInUrl ?? raw.LinkedinUrl ?? undefined,
      twitterUrl: raw.twitterUrl ?? raw.TwitterUrl ?? undefined,
      instagramUrl: raw.instagramUrl ?? raw.InstagramUrl ?? undefined,
      websiteUrl: raw.websiteUrl ?? raw.WebsiteUrl ?? raw.site ?? raw.website ?? undefined,
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const list = await getUsers()
        setUser(Array.isArray(list) && list.length > 0 ? normalizeUser(list[0]) : null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl float-animation"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl float-animation"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card className="bg-card/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/30 flex items-center justify-center overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img
                        src={`/api/media/${user.profileImageUrl.replace(/^\/+/, "")}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <svg className="w-16 h-16 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{user?.name ?? "Tu Nombre"}</CardTitle>
                  <CardDescription className="text-lg text-primary font-medium">
                    {user?.generalDescription ?? "Full Stack Developer"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-3 text-primary" />
                    {user?.location ?? "Ubicación"}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-3 text-primary" />
                    {user?.email ?? "correo@ejemplo.com"}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-3 text-primary" />
                    {user?.phone ?? "+502 0000-0000"}
                  </div>

                  {/* Social links (solo si existen) */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {user?.githubUrl && (
                      <a
                        href={user.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                        title="GitHub"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {user?.linkedinUrl && (
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {user?.twitterUrl && (
                      <a
                        href={user.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                        title="Twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {user?.instagramUrl && (
                      <a
                        href={user.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {user?.websiteUrl && (
                      <a
                        href={user.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Sitio Web"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                        title="Sitio Web"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <Button className="w-full mt-6 glow-effect">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar CV
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
                  Mi{" "}
                  <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Curriculum
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                  Desarrollador Full Stack con más de 5 años de experiencia creando soluciones digitales innovadoras.
                  Especializado en tecnologías modernas y metodologías ágiles.
                </p>
              </div>

              {/* Skills Overview */}
              <Card className="bg-card/90 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary" />
                    Habilidades Técnicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.skillCategories?.map((cat, idx) => (
                    <div key={idx}>
                      <h4 className="font-medium text-foreground mb-2 capitalize">{cat.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {(cat.skills || []).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance flex items-center justify-center">
              <Briefcase className="w-8 h-8 mr-3 text-primary" />
              Experiencia Profesional
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <div className="space-y-8">
            {(user?.experiences ?? []).map((job, index) => (
              <Card
                key={index}
                className="bg-card/90 backdrop-blur-sm border-0 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-xl text-primary">{job.position}</CardTitle>
                      <CardDescription className="text-lg font-medium text-foreground mt-1">
                        {job.company}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col md:items-end mt-2 md:mt-0">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {job.period}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{job.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Logros principales:</h4>
                    <ul className="space-y-1">
                      {(job.achievements ?? []).map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="flex items-start text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance flex items-center justify-center">
              <GraduationCap className="w-8 h-8 mr-3 text-primary" />
              Educación y Certificaciones
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(user?.educations ?? []).map((edu, index) => (
              <Card
                key={index}
                className="bg-card/90 backdrop-blur-sm border-0 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{edu.degree}</CardTitle>
                  <CardDescription className="font-medium text-foreground">{edu.institution}</CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {edu.period}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">¿Interesado en trabajar conmigo?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Estoy disponible para nuevos proyectos y oportunidades de colaboración.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 glow-effect">
              <Link href="/contacto">Contactar</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/portafolio">Ver Proyectos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )

}
