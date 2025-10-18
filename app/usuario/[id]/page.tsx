import { redirect } from "next/navigation"

export default async function UsuarioAlias({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/portafolio?id=${id}`)
}
