"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminContext, type AdminUser } from "@/components/admin/admin-context";
import { getUsers } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert } from "lucide-react";

/**
 * Selector global de usuario para el header de /admin
 * - Opción "Todos los usuarios" limpia la selección
 * - Al elegir un usuario, solicita credenciales antes de confirmar
 */
export function UserSelector() {
  const { selectedUser, isUserVerified, setSelectedUser, setSelectedUserAndMarkVerified, clearSelected, verifySelectedUser } = useAdminContext();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [value, setValue] = useState<string>(selectedUser ? String(selectedUser.id) : "all");

  // Verificación modal
  const [open, setOpen] = useState(false);
  const [candidate, setCandidate] = useState<AdminUser | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    setValue(selectedUser ? String(selectedUser.id) : "all");
  }, [selectedUser]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const list = await getUsers();
        const mapped = (Array.isArray(list) ? list : []).map((u: any) => ({
          id: Number(u?.id ?? u?.Id),
          name: String(u?.name ?? u?.Name ?? "Usuario"),
          email: u?.email,
          username: u?.username,
        })) as AdminUser[];
        setUsers(mapped);
      } catch (e) {
        setError("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setVerifyError(null);
    if (v === "all") {
      setValue("all");
      clearSelected();
      return;
    }
    const uid = Number(v);
    const u = users.find((x) => x.id === uid) || null;
    if (!u) return;
    // Selección provisional y abrir verificación (sin bypass por localStorage)
    setSelectedUser({ id: u.id, name: u.name, email: u.email, username: u.username });
    setCandidate(u);
    setIdentifier(u.email || u.username || "");
    setPassword("");
    setOpen(true);
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!candidate) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      await verifySelectedUser(identifier, password);
      setSelectedUserAndMarkVerified(candidate);
      setOpen(false);
    } catch (e: any) {
      setVerifyError(e?.message || "Credenciales inválidas");
    } finally {
      setVerifying(false);
    }
  };

  const onClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Si se cierra sin verificar, revertir a "Todos"
      if (!isUserVerified) {
        clearSelected();
        setValue("all");
      }
      setOpen(false);
      setCandidate(null);
      setIdentifier("");
      setPassword("");
      setVerifyError(null);
    } else {
      setOpen(true);
    }
  };

  const leftIcon = isUserVerified ? (
    <ShieldCheck className="h-4 w-4 text-green-600" />
  ) : selectedUser ? (
    <ShieldAlert className="h-4 w-4 text-amber-600" />
  ) : null;

  return (
    <div className="flex items-center gap-2">
      {leftIcon}
      <label className="text-sm text-muted-foreground">Administrando:</label>
      <select
        className="h-8 px-2 rounded-md border bg-background text-sm"
        value={value}
        onChange={onChange}
        disabled={loading}
        aria-label="Seleccionar usuario a administrar"
      >
        <option value="all">Todos los usuarios</option>
        {users.map((u) => (
          <option key={u.id} value={String(u.id)}>
            {u.name}
          </option>
        ))}
      </select>

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar credenciales</DialogTitle>
            <DialogDescription>
              Ingresa las credenciales de <strong>{candidate?.name}</strong> para continuar.
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
            {verifyError && <p className="text-sm text-red-500">{verifyError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={verifying}>Cancelar</Button>
              <Button type="submit" disabled={verifying}>{verifying ? "Verificando…" : "Continuar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
