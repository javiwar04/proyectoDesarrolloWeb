"use client";

import { useEffect, useState } from "react";
import { getPoints } from "@/lib/api";

type Point = { id: number; name?: string; value?: number };

export default function AdminPointsPage() {
  const [items, setItems] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPoints();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudieron cargar los puntos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold mb-2">Puntos</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Sin puntos.</p>
      ) : (
        <ul className="list-disc pl-5">
          {items.map((p) => (
            <li key={p.id}>{p.name ?? `Punto #${p.id}`} — {p.value ?? 0}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
