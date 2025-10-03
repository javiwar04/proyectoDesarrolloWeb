"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import Typewriter from "@/components/typewriter"
import AnimatedCounter from "@/components/animated-counter"
import SkillBar from "@/components/skill-bar"
import { getUsers } from "@/lib/api"
import { Github, Linkedin, Twitter, Instagram, Globe } from "lucide-react"

type User = {
  id: number
  name: string
  email?: string
  phone?: string
  bio?: string
  shortDescriptions?: string[]
  generalDescription?: string
  location?: string
  profileImageUrl?: string
  yearsOfExperience?: number
  githubUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  websiteUrl?: string
}

export default function HomePage() {
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10">✨ Disponible para proyectos</span>
            </Badge>
          </div>

          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/30 flex items-center justify-center overflow-hidden group hover:scale-110 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/25">
              {user?.profileImageUrl ? (
                <img
                  src={`/api/media/${user.profileImageUrl.replace(/^\/+/, "")}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <svg
                    className="w-16 h-16 text-primary/60 group-hover:text-primary transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Hola, soy{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {user?.name ?? "Tu Nombre"}
            </span>
          </h1>

          <div className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-pretty min-h-[3rem]">
            <Typewriter
              texts={user?.shortDescriptions && user.shortDescriptions.length > 0
                ? user.shortDescriptions
                : [
                    user?.generalDescription || "Desarrollador Full Stack",
                    "Especializado en React, Next.js y tecnologías modernas",
                    "Creando aplicaciones web y móviles que impactan",
                  ]}
              className="text-xl text-muted-foreground"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25"
            >
              <Link href="/portafolio">
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
                <span className="relative z-10">Ver Portafolio</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50 relative overflow-hidden group"
            >
              <Link href="/contacto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <span className="relative z-10">Contactar</span>
              </Link>
            </Button>
          </div>

          {/* Social links (solo si existen) */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {user?.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {user?.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {user?.twitterUrl && (
              <a
                href={user.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                title="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {user?.instagramUrl && (
              <a
                href={user.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {user?.websiteUrl && (
              <a
                href={user.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sitio Web"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-primary/5 hover:text-primary transition-colors"
                title="Sitio Web"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Proyectos
              </p>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                <AnimatedCounter end={user?.yearsOfExperience ?? 3} suffix="+" />
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Años Experiencia
              </p>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Clientes Felices
              </p>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Satisfacción
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-card/50 to-card/30 backdrop-blur-sm"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Mis Habilidades</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Skills Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="text-center group hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm relative overflow-hidden hover:rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Frontend</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed">
                    React, Next.js, TypeScript, Tailwind CSS. Creando interfaces modernas y responsivas que deleitan.
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors duration-300">
                      React
                    </Badge>
                    <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors duration-300">
                      Next.js
                    </Badge>
                    <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors duration-300">
                      TypeScript
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center group hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm relative overflow-hidden hover:-rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Backend</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed">
                    Node.js, Python, bases de datos. Desarrollando APIs robustas y escalables que funcionan.
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors duration-300">
                      Node.js
                    </Badge>
                    <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors duration-300">
                      Python
                    </Badge>
                    <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors duration-300">
                      PostgreSQL
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skill Bars */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Nivel de Experiencia</h3>
              <SkillBar skill="React & Next.js" percentage={95} />
              <SkillBar skill="TypeScript" percentage={90} />
              <SkillBar skill="Node.js" percentage={85} />
              <SkillBar skill="Python" percentage={80} />
              <SkillBar skill="Bases de Datos" percentage={85} />
              <SkillBar skill="UI/UX Design" percentage={75} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Proyectos Destacados</h2>
            <p className="text-muted-foreground text-lg text-pretty">
              Algunos de mis trabajos más recientes y emocionantes
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-3 hover:rotate-1 border-0 bg-card/90 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="aspect-video bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse"></div>
                    <div
                      className="w-3 h-3 bg-accent/60 rounded-full animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-primary/40 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                </div>
              </div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    Proyecto Destacado 1
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="text-xs group-hover:bg-primary/20 transition-colors duration-300"
                  >
                    Web App
                  </Badge>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Una aplicación web moderna construida con React y Node.js, con diseño responsivo y funcionalidades
                  avanzadas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-3 hover:-rotate-1 border-0 bg-card/90 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="aspect-video bg-gradient-to-br from-accent/30 via-primary/20 to-accent/10 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-accent/60 rounded-full animate-pulse"></div>
                    <div
                      className="w-3 h-3 bg-primary/60 rounded-full animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-accent/40 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                </div>
              </div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    Proyecto Destacado 2
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="text-xs group-hover:bg-primary/20 transition-colors duration-300"
                  >
                    Mobile App
                  </Badge>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  App móvil desarrollada con React Native y backend en Python, con interfaz intuitiva y rendimiento
                  óptimo.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 bg-transparent hover:scale-105 hover:shadow-lg relative overflow-hidden group"
            >
              <Link href="/portafolio">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">Ver Todo el Portafolio →</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
