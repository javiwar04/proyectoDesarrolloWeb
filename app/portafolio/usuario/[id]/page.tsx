import { redirect } from "next/navigation"

export default async function LegacyUserProjects({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/proyectos?id=${id}`)
}
