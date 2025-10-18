"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AdminUser = {
  id: number;
  name: string;
  email?: string;
  username?: string;
};

type AdminContextValue = {
  selectedUser: AdminUser | null;
  setSelectedUser: (u: AdminUser | null) => void;
  setSelectedUserAndMarkVerified: (u: AdminUser) => void;
  selectedUserId: number | null;
  clearSelected: () => void;
  // Verificación de credenciales por usuario
  verifiedUserId: number | null;
  isUserVerified: boolean;
  clearVerification: () => void;
  verifySelectedUser: (identifier: string, password: string) => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

const LS_KEY = "selectedAdminUser";
const LS_VERIFIED_KEY = "verifiedAdminUserId";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [selectedUser, setSelectedUserState] = useState<AdminUser | null>(null);
  const [verifiedUserId, setVerifiedUserId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdminUser;
        if (parsed && typeof parsed.id === "number") {
          setSelectedUserState(parsed);
        }
      }
      const v = localStorage.getItem(LS_VERIFIED_KEY);
      if (v) {
        const n = Number(v);
        if (Number.isFinite(n)) setVerifiedUserId(n);
      }
    } catch {}
  }, []);

  const setSelectedUser = useCallback((u: AdminUser | null) => {
    setSelectedUserState(u);
    try {
      if (u) localStorage.setItem(LS_KEY, JSON.stringify(u));
      else localStorage.removeItem(LS_KEY);
    } catch {}
    // Al cambiar de usuario, invalidar verificación previa
    try {
      setVerifiedUserId(null);
      localStorage.removeItem(LS_VERIFIED_KEY);
    } catch {}
  }, []);

  const clearSelected = useCallback(() => setSelectedUser(null), [setSelectedUser]);

  const clearVerification = useCallback(() => {
    setVerifiedUserId(null);
    try { localStorage.removeItem(LS_VERIFIED_KEY); } catch {}
  }, []);

  const setSelectedUserAndMarkVerified = useCallback((u: AdminUser) => {
    setSelectedUserState(u);
    try { localStorage.setItem(LS_KEY, JSON.stringify(u)); } catch {}
    setVerifiedUserId(u.id);
    try { localStorage.setItem(LS_VERIFIED_KEY, String(u.id)); } catch {}
  }, []);

  async function verifySelectedUser(identifier: string, password: string): Promise<void> {
    const { login } = await import("@/lib/api");
    if (!selectedUser) throw new Error("Selecciona un usuario");
    const resp = await login({ identifier, password });
    const uid = Number(resp?.userId);
    if (!Number.isFinite(uid) || uid !== selectedUser.id) {
      throw new Error("Credenciales inválidas para el usuario seleccionado");
    }
    setVerifiedUserId(uid);
    try { localStorage.setItem(LS_VERIFIED_KEY, String(uid)); } catch {}
  }

  const value = useMemo<AdminContextValue>(() => ({
    selectedUser,
    setSelectedUser,
    setSelectedUserAndMarkVerified,
    selectedUserId: selectedUser?.id ?? null,
    clearSelected,
    verifiedUserId,
    isUserVerified: !!selectedUser && verifiedUserId === selectedUser.id,
    clearVerification,
    verifySelectedUser,
  }), [selectedUser, verifiedUserId, setSelectedUser, setSelectedUserAndMarkVerified, clearSelected]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext debe usarse dentro de <AdminProvider>");
  return ctx;
}
