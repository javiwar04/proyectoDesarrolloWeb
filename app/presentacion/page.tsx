import { redirect } from "next/navigation"

export default function PresentacionIndex() {
  // Ruta obsoleta -> redirige a la presentación actual
  redirect("/portafolio")
}
