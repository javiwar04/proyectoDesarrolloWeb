"use client";

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
