"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "@/components/admin/admin-context";

export function VerifyUserDialog({ children }: { children: React.ReactNode }) {
  const { selectedUser, isUserVerified, verifySelectedUser } = useAdminContext();
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifySelectedUser(identifier, password);
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || "No se pudo verificar");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedUser) return <>{children}</>;

  // Si ya está verificado, deja pasar
  if (isUserVerified) return <>{children}</>;

  // En caso contrario, muestra el trigger que abre el diálogo
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span onClick={() => setOpen(true)}>{children}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar credenciales</DialogTitle>
          <DialogDescription>
            Ingresa las credenciales de <strong>{selectedUser.name}</strong> para continuar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Usuario o email</label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Verificando…" : "Continuar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
