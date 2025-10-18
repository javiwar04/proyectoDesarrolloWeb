import { redirect } from "next/navigation"

export default function PresentacionUsuario() {
  // Ruta obsoleta -> actualizamos selectedUserId y redirigimos al flujo nuevo
  // Nota: En server components no accedemos a localStorage; usamos la versión sin side-effects y delegamos.
  // Mandamos al nuevo flujo que resuelve el usuario seleccionado.
  redirect("/portafolio")
}
