import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, Briefcase, Calendar, GraduationCap, Mail, MapPin, Phone, Github, Linkedin, Twitter, Facebook, Instagram } from "lucide-react"
import { getUserById } from "@/lib/api"
import { PrintButton } from "@/components/print-button"

type Params = { id: string }

export default async function CurriculumByUser({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const userId = Number(id)
  if (!Number.isFinite(userId) || userId <= 0) {
    return <div className="max-w-4xl mx-auto px-4 py-10">Usuario no válido.</div>
  }

  const user = await getUserById(userId)
  if (!user) return <div className="max-w-4xl mx-auto px-4 py-10">Usuario no encontrado.</div>

  const skillsByCategory: Array<{ id: number; category: string; skills: string[] }> = (user.skillCategories || []).map((c: any) => ({
    id: c.id,
    category: c.category,
    skills: (c.skills || [])
      .flatMap((s: any) => String(s).split(","))
      .map((s: string) => s.trim())
      .filter(Boolean),
  }))

  const experiences: Array<{ id: number; company?: string; position?: string; period?: string; location?: string; description?: string; achievements?: string[] }> = user.experiences || []
  const educations: Array<{ id: number; institution?: string; degree?: string; period?: string; description?: string }> = user.educations || []
  const certifications: Array<{ id: number; name?: string; issuer?: string; date?: string }> = user.certifications || []

  const social = {
    github: user.gitHubUrl || user.githubUrl,
    linkedin: user.linkedInUrl || user.linkedinUrl,
    twitter: user.twitterUrl || user.xUrl,
    facebook: user.facebookUrl,
    instagram: user.instagramUrl,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Barra de acciones (no imprimir) */}
      <div className="print:hidden sticky top-0 z-20 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Contenido imprimible */}
      <div className="printable">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden print:py-6 print:px-6">
        <div className="absolute inset-0 overflow-hidden print:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Cabecera solo para impresión */}
          <div className="hidden print:block mb-6">
            <h1 className="text-3xl font-extrabold leading-tight">{user.name}</h1>
            {user.experienceLevel && (
              <div className="text-base mt-1">{user.experienceLevel}</div>
            )}
            <div className="text-sm mt-2 space-x-3">
              {user.location && <span>{user.location}</span>}
              {user.email && <span>• {user.email}</span>}
              {user.phone && <span>• {user.phone}</span>}
              {social.linkedin && <span>• LinkedIn: {social.linkedin}</span>}
              {social.github && <span>• GitHub: {social.github}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 cv-grid">
            {/* Perfil */}
            <div className="lg:col-span-1">
              <Card className="bg-card/90 backdrop-blur-sm border-0 shadow-xl avoid-break">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/30 flex items-center justify-center overflow-hidden">
                    {user.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/media/${String(user.profileImageUrl).replace(/^\/+/, "")}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <svg className="w-16 h-16 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
                  {user.experienceLevel && (
                    <CardDescription className="text-lg text-primary font-medium">{user.experienceLevel}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.location && (
                    <div className="flex items-center text-sm text-muted-foreground"><MapPin className="w-4 h-4 mr-3 text-primary" />{user.location}</div>
                  )}
                  {user.email && (
                    <div className="flex items-center text-sm text-muted-foreground"><Mail className="w-4 h-4 mr-3 text-primary" />{user.email}</div>
                  )}
                  {user.phone && (
                    <div className="flex items-center text-sm text-muted-foreground"><Phone className="w-4 h-4 mr-3 text-primary" />{user.phone}</div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-3 onepage-hide">
                    {social.github && (
                      <a href={social.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-primary/10 transition-colors"><Github className="w-4 h-4" /> GitHub</a>
                    )}
                    {social.linkedin && (
                      <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-primary/10 transition-colors"><Linkedin className="w-4 h-4" /> LinkedIn</a>
                    )}
                    {social.twitter && (
                      <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-primary/10 transition-colors"><Twitter className="w-4 h-4" /> Twitter</a>
                    )}
                    {social.facebook && (
                      <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-primary/10 transition-colors"><Facebook className="w-4 h-4" /> Facebook</a>
                    )}
                    {social.instagram && (
                      <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-primary/10 transition-colors"><Instagram className="w-4 h-4" /> Instagram</a>
                    )}
                  </div>

                  <div className="pt-4 print:hidden onepage-hide">
                    <Button asChild className="w-full">
                      <Link href="/contacto">Contactar</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Habilidades (solo impresión 1 hoja) */}
              <div className="onepage-only mt-6 avoid-break">
                <div className="text-lg font-semibold mb-2">Habilidades</div>
                {skillsByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin habilidades registradas</p>
                ) : (
                  <div className="space-y-3">
                    {skillsByCategory.map((cat) => (
                      <div key={cat.id}>
                        <div className="text-sm font-medium mb-1">{cat.category}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.skills.map((skill, i) => (
                            <Badge key={`${cat.id}-s-${i}-${skill}`} variant="secondary" className="text-[10px] print:border print:border-black/20 print:bg-transparent print:text-black print:rounded-sm px-2 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Educación (solo impresión 1 hoja) */}
              {educations.length > 0 && (
                <div className="onepage-only mt-6 avoid-break">
                  <div className="text-lg font-semibold mb-2">Educación</div>
                  <div className="space-y-3">
                    {educations.map((edu) => (
                      <div key={`edu-mini-${edu.id}`}> 
                        <div className="text-sm font-medium">{edu.degree}</div>
                        <div className="text-sm">{edu.institution}</div>
                        {edu.period && <div className="text-xs text-muted-foreground">{edu.period}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2 print:mb-3">Curriculum de <span className="text-primary print:text-black">{user.name}</span></h1>
                <div className="onepage-only text-xl font-semibold mt-2 mb-1">Acerca de mí</div>
                {user.generalDescription && (
                  <p className="text-lg text-muted-foreground leading-relaxed print:text-black/80 onepage-truncate-3">{user.generalDescription}</p>
                )}
              </div>

              {/* Skills */}
              <Card className="bg-card/90 backdrop-blur-sm border-0 avoid-break onepage-hide">
                <CardHeader>
                  <CardTitle className="flex items-center border-l-4 border-primary/60 pl-3 print:border-black"><Award className="w-5 h-5 mr-2 text-primary print:text-black" /> Habilidades Técnicas</CardTitle>
                  <CardDescription>Stack y categorías principales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skillsByCategory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin habilidades registradas</p>
                  ) : (
                    skillsByCategory.map((cat) => (
                      <div key={cat.id}>
                        <h4 className="font-medium text-foreground mb-2">{cat.category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {cat.skills.map((skill, i) => (
                            <Badge
                              key={`${cat.id}-${i}-${skill}`}
                              variant="secondary"
                              className="text-xs print:border print:border-black/20 print:bg-transparent print:text-black print:rounded-sm print:px-2 print:py-0.5"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Experiencia */}
              <section className="avoid-break">
                <div className="text-2xl font-semibold mb-4 flex items-center border-l-4 border-primary/60 pl-3 print:border-black"><Briefcase className="w-6 h-6 mr-2 text-primary print:text-black" /> Experiencia</div>
                <div className="space-y-6">
                  {experiences.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin experiencia registrada</p>
                  ) : (
                    experiences.map((job) => (
                      <Card key={job.id} className="bg-card/90 backdrop-blur-sm border-0 avoid-break onepage-compact">
                        <CardHeader>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <CardTitle className="text-xl text-primary">{job.position}</CardTitle>
                              <CardDescription className="text-lg font-medium text-foreground mt-1">{job.company}</CardDescription>
                            </div>
                            <div className="flex flex-col md:items-end mt-2 md:mt-0">
                              {job.period && <div className="flex items-center text-sm text-muted-foreground"><Calendar className="w-4 h-4 mr-1" />{job.period}</div>}
                              {job.location && <div className="flex items-center text-sm text-muted-foreground mt-1"><MapPin className="w-4 h-4 mr-1" />{job.location}</div>}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {job.description && <p className="text-muted-foreground mb-4 leading-relaxed onepage-truncate-3">{job.description}</p>}
                          {Array.isArray(job.achievements) && job.achievements.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground onepage-hide">Logros principales:</h4>
                              <ul className="space-y-1 onepage-hide">
                                {job.achievements.map((ach, idx) => (
                                  <li key={idx} className="flex items-start text-sm text-muted-foreground"><div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />{ach}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </section>

              {/* Educación y Certificaciones */}
              <section className="avoid-break onepage-hide">
                <div className="text-2xl font-semibold mb-4 flex items-center border-l-4 border-primary/60 pl-3 print:border-black"><GraduationCap className="w-6 h-6 mr-2 text-primary print:text-black" /> Educación y Certificaciones</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
                  {educations.map((edu) => (
                    <Card key={edu.id} className="bg-card/90 backdrop-blur-sm border-0 avoid-break">
                      <CardHeader>
                        <CardTitle className="text-lg text-primary">{edu.degree}</CardTitle>
                        <CardDescription className="font-medium text-foreground">{edu.institution}</CardDescription>
                        {edu.period && <div className="flex items-center text-sm text-muted-foreground mt-2"><Calendar className="w-4 h-4 mr-1" />{edu.period}</div>}
                      </CardHeader>
                      <CardContent>
                        {edu.description && <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {certifications.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center mb-3"><Award className="w-5 h-5 mr-2 text-primary" /><h3 className="font-medium">Certificaciones</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {certifications.map((c) => (
                        <Card key={c.id} className="bg-card/90 backdrop-blur-sm border-0 avoid-break">
                          <CardHeader>
                            <CardTitle className="text-base">{c.name}</CardTitle>
                            {c.issuer && <CardDescription>{c.issuer}</CardDescription>}
                            {c.date && <div className="flex items-center text-xs text-muted-foreground mt-1"><Calendar className="w-3 h-3 mr-1" />{new Date(c.date).toLocaleDateString()}</div>}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card/50 print:hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">¿Te interesa colaborar?</h2>
          <p className="text-muted-foreground mb-6">Estoy abierto a nuevas oportunidades y proyectos.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild><Link href="/contacto">Contactar</Link></Button>
            <Button asChild variant="outline"><Link href="/proyectos">Ver Proyectos</Link></Button>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
