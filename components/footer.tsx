import Link from "next/link"
import { Github, Linkedin, Mail, Heart, Code2, ExternalLink } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

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
                  Mi Portafolio
                </h3>
                <p className="text-sm text-muted-foreground">Desarrollador Full Stack</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Creando experiencias digitales excepcionales con código limpio y diseño intuitivo. Especializado en
              desarrollo web moderno y soluciones innovadoras.
            </p>
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
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
              >
                <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
              >
                <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a
                href="mailto:tu@email.com"
                className="p-2 rounded-lg bg-muted hover:bg-blue-100 dark:hover:bg-blue-950/50 text-muted-foreground hover:text-blue-600 transition-all duration-200 group"
              >
                <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
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
