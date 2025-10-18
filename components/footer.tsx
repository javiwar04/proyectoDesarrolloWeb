"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Github, Linkedin, Mail, Heart, Code2, ExternalLink, Twitter, Facebook, Instagram } from "lucide-react"
import { getUserById } from "@/lib/api"

type FooterUser = {
  id: number
  name: string
  experienceLevel?: string
  yearsOfExperience?: number
  generalDescription?: string
  githubUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  email?: string
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [user, setUser] = useState<FooterUser | null>(null)

  useEffect(() => {
    const saved = Number(localStorage.getItem("selectedUserId") || "")
    if (!Number.isFinite(saved) || saved <= 0) return
    ;(async () => {
      try {
        const u = await getUserById(saved)
        if (u) {
          setUser({
            id: u.id,
            name: u.name,
            experienceLevel: u.experienceLevel,
            yearsOfExperience: u.yearsOfExperience,
            generalDescription: u.generalDescription,
            githubUrl: u.gitHubUrl || u.githubUrl,
            linkedinUrl: u.linkedInUrl || u.linkedinUrl,
            twitterUrl: u.twitterUrl || u.xUrl,
            facebookUrl: u.facebookUrl,
            instagramUrl: u.instagramUrl,
            email: u.email,
          })
        }
      } catch {}
    })()
  }, [])

  return (
    <footer className="bg-gradient-to-t from-blue-950/5 to-transparent border-t border-border/50 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {user?.name ?? "Mi Portafolio"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user?.experienceLevel ? user.experienceLevel : user?.yearsOfExperience != null ? `${user.yearsOfExperience}+ años` : ""}
                </p>
              </div>
            </div>
            {user?.generalDescription && (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">{user.generalDescription}</p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-blue-600 text-sm transition-colors duration-200"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/portafolio"
                  className="text-muted-foreground hover:text-blue-600 text-sm transition-colors duration-200"
                >
                  Proyectos
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-muted-foreground hover:text-blue-600 text-sm transition-colors duration-200"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Conecta Conmigo</h4>
            <div className="flex space-x-3">
              {user?.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
                >
                  <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {user?.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
                >
                  <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {user?.twitterUrl && (
                <a
                  href={user.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
                >
                  <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {user?.facebookUrl && (
                <a
                  href={user.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
                >
                  <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {user?.instagramUrl && (
                <a
                  href={user.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
                >
                  <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {user?.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
                >
                  <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>© {currentYear} Mi Portafolio. Hecho con</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>y mucho café</span>
          </div>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-blue-600 transition-colors duration-200"
            >
              <span>Powered by Next.js</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
