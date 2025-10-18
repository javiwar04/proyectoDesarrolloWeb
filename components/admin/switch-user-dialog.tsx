"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUsers } from "@/lib/api";
import { useAdminContext, type AdminUser } from "@/components/admin/admin-context";
import { toast } from "sonner";

export function SwitchUserDialog({ children }: { children: React.ReactNode }) {
  const { selectedUser, setSelectedUser, setSelectedUserAndMarkVerified, verifySelectedUser } = useAdminContext();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const [step, setStep] = useState<"choose" | "verify">("choose");
  const [candidate, setCandidate] = useState<AdminUser | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const list = await getUsers();
        const mapped = (Array.isArray(list) ? list : []).map((u: any) => ({ id: Number(u?.id ?? u?.Id), name: String(u?.name ?? u?.Name ?? "Usuario"), email: u?.email, username: u?.username })) as AdminUser[];
        setUsers(mapped);
      } catch (e) {
        setError("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => (u.name || "").toLowerCase().includes(term) || (u.email || "").toLowerCase().includes(term) || (u.username || "").toLowerCase().includes(term));
  }, [users, q]);

  const chooseUser = (u: AdminUser) => {
    setCandidate(u);
    setIdentifier(u.email || u.username || "");
    // Establece la selección en el contexto para que la verificación aplique al candidato
    setSelectedUser(u);
    setStep("verify");
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    setVerifying(true);
    try {
      await verifySelectedUser(identifier, password);
      setSelectedUserAndMarkVerified(candidate);
      toast.success(`Ahora administras a ${candidate.name}`);
      setOpen(false);
      setStep("choose");
      setCandidate(null);
      setIdentifier("");
      setPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Credenciales inválidas");
    } finally {
      setVerifying(false);
    }
  };

  const resetFlow = () => {
    setStep("choose");
    setCandidate(null);
    setIdentifier("");
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetFlow(); }}>
      <DialogTrigger asChild>
        <span onClick={() => setOpen(true)}>{children}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {step === "choose" ? (
          <>
            <DialogHeader>
              <DialogTitle>Administrar otro usuario</DialogTitle>
              <DialogDescription>Selecciona un usuario de la lista para administrarlo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Buscar por nombre, correo o usuario" value={q} onChange={(e) => setQ(e.target.value)} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <ScrollArea className="max-h-[320px] border rounded-md">
                <div className="divide-y">
                  {loading ? (
                    <div className="p-4 text-sm text-muted-foreground">Cargando…</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">Sin usuarios.</div>
                  ) : (
                    filtered.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className={`w-full text-left px-4 py-3 hover:bg-accent/40 transition ${u.id === selectedUser?.id ? "bg-accent/20" : ""}`}
                        onClick={() => chooseUser(u)}
                      >
                        <div className="font-medium">{u.name}</div>
                        {(u.email || u.username) && (
                          <div className="text-xs text-muted-foreground">{u.email || u.username}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Verificar credenciales</DialogTitle>
              <DialogDescription>
                Ingresa las credenciales de <strong>{candidate?.name}</strong> para continuar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onVerify} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Usuario o email</label>
                <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="block text-sm mb-1">Contraseña</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetFlow} disabled={verifying}>Volver</Button>
                <Button type="submit" disabled={verifying}>{verifying ? "Verificando…" : "Continuar"}</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
