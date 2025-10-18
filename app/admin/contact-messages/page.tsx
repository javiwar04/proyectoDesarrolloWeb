"use client";


import { useEffect, useMemo, useState } from "react";
import { getContactMessages } from "@/lib/api";
import { useAdminContext } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Message = {
  id: number;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  userId?: number;
  createdAt?: string;
};

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function buildGmailLink(to?: string, subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (to) params.set("to", to);
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  params.set("view", "cm");
  params.set("fs", "1");
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export default function AdminMessagesPage() {
  const { selectedUserId } = useAdminContext();
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [hideResponded, setHideResponded] = useState(false);
  const [sortKey, setSortKey] = useState<
    "dateDesc" | "dateAsc" | "subject" | "sender"
  >("dateDesc");
  const [statuses, setStatuses] = useState<Record<number, { responded: boolean; starred?: boolean }>>({});

  const LS_STATUS_KEY = "contactMessageStatuses";

  // Cargar estados locales (respondido/destacado) desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_STATUS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<number, { responded: boolean; starred?: boolean }>;
        if (parsed && typeof parsed === "object") setStatuses(parsed);
      }
    } catch {}
  }, []);

  const saveStatuses = (next: Record<number, { responded: boolean; starred?: boolean }>) => {
    setStatuses(next);
    try { localStorage.setItem(LS_STATUS_KEY, JSON.stringify(next)); } catch {}
  };

import { useEffect, useState } from "react";
import { getContactMessages } from "@/lib/api";

type Message = { id: number; name?: string; email?: string; subject?: string };

export default function AdminMessagesPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContactMessages();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudieron cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);


  const visible = useMemo(() => {
    const base = selectedUserId
      ? (items || []).filter((m: any) => Number(m?.userId ?? m?.UserId) === selectedUserId)
      : (items || []);
    const term = q.trim().toLowerCase();
    if (!term) return base;
    return base.filter(m =>
      (m.subject || "").toLowerCase().includes(term) ||
      (m.name || "").toLowerCase().includes(term) ||
      (m.email || "").toLowerCase().includes(term) ||
      (m.message || "").toLowerCase().includes(term)
    );
  }, [items, selectedUserId, q]);

  const replyGmail = (m: Message) => {
    if (!m.email) {
      toast.error("No hay correo para responder");
      return;
    }
    const url = buildGmailLink(m.email, m.subject || `Re: Mensaje #${m.id}`, `Hola ${m.name || ""},\n\n`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const replyMailto = (m: Message) => {
    if (!m.email) {
      toast.error("No hay correo para responder");
      return;
    }
    const params = new URLSearchParams();
    if (m.subject) params.set("subject", m.subject);
    params.set("body", `Hola ${m.name || ""},%0D%0A%0D%0A`);
    const href = `mailto:${encodeURIComponent(m.email)}?${params.toString()}`;
    window.location.href = href;
  };

  const copyEmail = async (email?: string) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Correo copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const toggleResponded = (id: number) => {
    const current = statuses[id]?.responded || false;
    const next = { ...statuses, [id]: { ...(statuses[id] || {}), responded: !current } };
    saveStatuses(next);
  };

  const toggleStar = (id: number) => {
    const current = statuses[id]?.starred || false;
    const next = { ...statuses, [id]: { ...(statuses[id] || {}), starred: !current } };
    saveStatuses(next);
  };

  const comparator = useMemo(() => {
    const getDate = (m: Message) => {
      const t = m.createdAt ? Date.parse(m.createdAt) : NaN;
      return Number.isNaN(t) ? m.id : t;
    };
    const cmpStr = (a?: string, b?: string) => (a || "").localeCompare(b || "", undefined, { sensitivity: "base" });
    switch (sortKey) {
      case "dateAsc":
        return (a: Message, b: Message) => getDate(a) - getDate(b);
      case "subject":
        return (a: Message, b: Message) => cmpStr(a.subject, b.subject);
      case "sender":
        return (a: Message, b: Message) => cmpStr(a.name, b.name) || cmpStr(a.email, b.email);
      case "dateDesc":
      default:
        return (a: Message, b: Message) => getDate(b) - getDate(a);
    }
  }, [sortKey]);

  const unresponded = useMemo(() => {
    const list = (visible || []).filter(m => !statuses[m.id]?.responded);
    if (hideResponded) return list.sort(comparator);
    return list.sort(comparator);
  }, [visible, statuses, hideResponded, comparator]);

  const responded = useMemo(() => {
    if (hideResponded) return [] as Message[];
    const list = (visible || []).filter(m => !!statuses[m.id]?.responded);
    return list.sort(comparator);
  }, [visible, statuses, hideResponded, comparator]);

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;
  if (error) return (
    <div className="flex items-center gap-3">
      <p className="text-red-500">{error}</p>
      <Button variant="outline" onClick={load}>Reintentar</Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Mensajes de contacto</h1>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <div className="flex-1 min-w-[240px] max-w-sm">
            <Input placeholder="Buscar por asunto, nombre, correo…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select
            className="h-10 border rounded-md px-2 text-sm"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            title="Ordenar"
          >
            <option value="dateDesc">Recientes primero</option>
            <option value="dateAsc">Antiguos primero</option>
            <option value="subject">Asunto A–Z</option>
            <option value="sender">Remitente A–Z</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={hideResponded} onChange={(e) => setHideResponded(e.target.checked)} />
            Ocultar respondidos
          </label>
        </div>
      </div>
      {!selectedUserId && (
        <p className="text-sm text-amber-600">Selecciona un usuario en el Dashboard para ver sus mensajes.</p>
      )}
      {unresponded.length === 0 && responded.length === 0 ? (
        <p className="text-muted-foreground">No hay mensajes para mostrar.</p>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-medium">No respondidos</h2>
            {unresponded.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay mensajes pendientes.</p>) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {unresponded.map((m) => {
                  const respondedFlag = !!statuses[m.id]?.responded;
                  const starred = !!statuses[m.id]?.starred;
                  return (
                    <Card key={m.id} className="h-full">
                      <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base line-clamp-1 flex items-center gap-2">
                            {m.subject || `Mensaje #${m.id}`}
                            {starred && <span title="Destacado" className="text-yellow-500">★</span>}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{m.id}</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span>{m.name || "Sin nombre"}</span>
                          {m.email && (
                            <button onClick={() => copyEmail(m.email)} className="underline underline-offset-2 hover:text-foreground" title="Copiar correo" type="button">
                              {m.email}
                            </button>
                          )}
                          {m.createdAt && <span className="ml-auto">{fmtDate(m.createdAt)}</span>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className={`text-sm whitespace-pre-line`}>{m.message || "(Sin contenido)"}</div>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => replyGmail(m)} disabled={!m.email}>Responder en Gmail</Button>
                          <Button size="sm" variant="secondary" onClick={() => replyMailto(m)} disabled={!m.email}>Responder por correo</Button>
                          <Button size="sm" variant={respondedFlag ? "secondary" : "outline"} onClick={() => toggleResponded(m.id)}>
                            {respondedFlag ? "Quitar respondido" : "Marcar respondido"}
                          </Button>
                          <Button size="sm" variant={starred ? "secondary" : "outline"} onClick={() => toggleStar(m.id)}>
                            {starred ? "Quitar destacado" : "Destacar"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {!hideResponded && (
            <div className="space-y-3 pt-6">
              <h2 className="text-lg font-medium">Respondidos</h2>
              {responded.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay respondidos.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {responded.map((m) => {
                    const starred = !!statuses[m.id]?.starred;
                    return (
                      <Card key={m.id} className="h-full opacity-90">
                        <CardHeader className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base line-clamp-1 flex items-center gap-2">
                              {m.subject || `Mensaje #${m.id}`}
                              {starred && <span title="Destacado" className="text-yellow-500">★</span>}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-600">Respondido</Badge>
                              <Badge variant="secondary">#{m.id}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span>{m.name || "Sin nombre"}</span>
                            {m.email && (
                              <button onClick={() => copyEmail(m.email)} className="underline underline-offset-2 hover:text-foreground" title="Copiar correo" type="button">
                                {m.email}
                              </button>
                            )}
                            {m.createdAt && <span className="ml-auto">{fmtDate(m.createdAt)}</span>}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className={`text-sm whitespace-pre-line`}>{m.message || "(Sin contenido)"}</div>
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" onClick={() => replyGmail(m)} disabled={!m.email}>Responder en Gmail</Button>
                            <Button size="sm" variant="secondary" onClick={() => replyMailto(m)} disabled={!m.email}>Responder por correo</Button>
                            <Button size="sm" variant="secondary" onClick={() => toggleResponded(m.id)}>
                              Quitar respondido
                            </Button>
                            <Button size="sm" variant={starred ? "secondary" : "outline"} onClick={() => toggleStar(m.id)}>
                              {starred ? "Quitar destacado" : "Destacar"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold mb-2">Mensajes de contacto</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Sin mensajes.</p>
      ) : (
        <ul className="list-disc pl-5">
          {items.map((m) => (
            <li key={m.id}>
              {m.subject ?? `Mensaje #${m.id}`} — {m.name ?? ""} {m.email ? `(${m.email})` : ""}
            </li>
          ))}
        </ul>

      )}
    </div>
  );
}
