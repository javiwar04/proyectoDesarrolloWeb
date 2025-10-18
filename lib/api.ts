
// Cliente API del frontend que consume el proxy interno /api/backend
// Nota: No establecemos manualmente "Content-Type" para permitir FormData/multipart correcto.

type Json = any

const BASE = "/api/backend"

function getServerOrigin(): string {
	const envOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
	if (envOrigin) {
		return envOrigin.startsWith("http") ? envOrigin : `https://${envOrigin}`
	}
	const port = process.env.PORT || "3000"
	return `http://localhost:${port}`
}

function buildUrl(path: string): string {
	const rel = `${BASE}${path}`.replace(/\/+$/, "")
	if (typeof window !== "undefined") return rel
	return new URL(rel, getServerOrigin()).toString()
}

async function http<T = Json>(path: string, init?: RequestInit): Promise<T> {
	const url = buildUrl(path)
	const res = await fetch(url, {
		// credenciales same-origin por defecto
		...init,
		headers: init?.body instanceof FormData ? init?.headers : { ...(init?.headers || { Accept: "application/json" }) },
		cache: "no-store",
	})
	if (!res.ok) {
		// intenta parsear body para mensaje de error
		let msg = `${res.status} ${res.statusText}`
		try {
			const data = await res.json()
			msg = data?.message || msg
		} catch {}
		throw new Error(msg)
	}
	const ct = res.headers.get("content-type") || ""
	if (ct.includes("application/json")) return (await res.json()) as T
	// @ts-ignore
	return (await res.text()) as T
}

// Helpers
export function toMediaUrl(path?: string | null): string | undefined {
	if (!path) return undefined
	const clean = String(path).replace(/^\/+/, "")
	return `/api/media/${clean}`
}

// Users
export async function getUsers(): Promise<Json[]> {
	return http<Json[]>(`/Users`)
}

export async function getUserById(id: number): Promise<Json | null> {
	if (!id) return null
	return http<Json>(`/Users/${id}`)
}

export async function createUser(form: FormData): Promise<Json> {
	return http<Json>(`/Users/with-image`, { method: "POST", body: form })
}

export async function updateUser(id: number, form: FormData): Promise<Json> {
	return http<Json>(`/Users/${id}/with-image`, { method: "PUT", body: form })
}

export async function deleteUser(id: number): Promise<void> {
	await http(`/Users/${id}`, { method: "DELETE" })
}

// Projects
export async function getProjects(): Promise<Json[]> {
	return http<Json[]>(`/Projects`)
}

export async function getProjectById(id: number): Promise<Json | null> {
	if (!id) return null
	return http<Json>(`/Projects/${id}`)
}

export async function createProject(body: Record<string, any> | FormData): Promise<Json> {
	const isForm = body instanceof FormData
	return http<Json>(`/Projects`, { method: "POST", body: isForm ? (body as FormData) : JSON.stringify(body), headers: isForm ? undefined : { "Content-Type": "application/json" } })
}

export async function updateProject(id: number, body: Record<string, any> | FormData): Promise<Json> {
	const isForm = body instanceof FormData
	return http<Json>(`/Projects/${id}`, { method: "PUT", body: isForm ? (body as FormData) : JSON.stringify(body), headers: isForm ? undefined : { "Content-Type": "application/json" } })
}

export async function deleteProject(id: number): Promise<void> {
	// Intento principal: DELETE directo
	try {
		await http(`/Projects/${id}`, { method: "DELETE" })
		return
	} catch (e: any) {
		const msg = String(e?.message || "")
		// Fallback 1: algunos backends no permiten DELETE. Intentar POST con method-override.
		if (msg.includes("405")) {
			try {
				await http(`/Projects/${id}?_method=DELETE`, {
					method: "POST",
					headers: { "X-HTTP-Method-Override": "DELETE" },
				})
				return
			} catch (e2: any) {
				// Fallback 2: rutas comunes alternativas para borrar
				const altPaths = [`/Projects/delete/${id}`, `/Projects/${id}/delete`]
				let lastErr = String(e2?.message || msg)
				for (const p of altPaths) {
					try {
						await http(p, { method: "POST" })
						return
					} catch (e3: any) {
						lastErr = String(e3?.message || lastErr)
					}
				}
				throw new Error(lastErr)
			}
		}
		throw e
	}
}

// Projects with image
export async function createProjectWithImage(form: FormData): Promise<Json> {
	return http<Json>(`/Projects/with-image`, { method: "POST", body: form })
}

export async function updateProjectWithImage(id: number, form: FormData): Promise<Json> {
	return http<Json>(`/Projects/${id}/with-image`, { method: "PUT", body: form })
}

// Points
export async function getPoints(): Promise<Json[]> {
	return http<Json[]>(`/Points`)
}

export async function getPointById(id: number): Promise<Json | null> {
	if (!id) return null
	return http<Json>(`/Points/${id}`)
}

export async function createPoint(body: { description: string; projectId: number }): Promise<Json> {
	return http<Json>(`/Points`, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	})
}

export async function updatePoint(id: number, body: { id?: number; description: string; projectId: number }): Promise<void> {
	return http<void>(`/Points/${id}`, {
		method: "PUT",
		body: JSON.stringify({ id, ...body }),
		headers: { "Content-Type": "application/json" },
	})
}

export async function deletePoint(id: number): Promise<void> {
	await http(`/Points/${id}`, { method: "DELETE" })
}

// Contact messages
export async function getContactMessages(): Promise<Json[]> {
	return http<Json[]>(`/ContactMessages`)
}

export async function createContactMessage(body: {
	name: string
	email: string
	subject: string
	message: string
	userId?: number
}): Promise<Json> {
	return http<Json>(`/ContactMessages`, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	})
}

// Auth
export async function register(body: { name?: string; email?: string; phone?: string; username?: string; password: string }): Promise<Json> {
	return http<Json>(`/Auth/register`, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	})
}

export async function login(body: { identifier: string; password: string }): Promise<{ userId: number; username: string; email: string; message: string }> {
	return http<{ userId: number; username: string; email: string; message: string }>(`/Auth/login`, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	})
}

export async function changePassword(body: { userId?: number; identifier?: string; currentPassword: string; newPassword: string }): Promise<Json> {
	return http<Json>(`/Auth/change-password`, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	})
}


import axios from "axios";

// Proxy interno en Next (Route Handler): /api/backend/[...path]
const PROXY_PREFIX = "/api/backend";
// Base real (sólo para logs/debug y fallback)
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

// Devuelve el origen del backend (sin "/api") para construir URLs absolutas a archivos estáticos
export const getBackendOrigin = () => API_BASE_URL.replace(/\/api$/, "");

// Convierte una ruta relativa (p.ej. "images/xyz.png") en URL absoluta al backend.
export const toMediaUrl = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getBackendOrigin();
  const normalized = path.replace(/^\/+/, "");
  return `${origin}/${normalized}`;
};

const api = axios.create({
  baseURL: PROXY_PREFIX,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Interceptor para logs y mensajes de error más claros en el frontend
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const serverMsg = error?.response?.data?.message || error?.response?.data?.title;
    const finalError = new Error(
      serverMsg || `Error de red${status ? ` (${status})` : ""} al llamar ${url}`
    );
    if (typeof window !== "undefined") {
      // Log en cliente para depuración
      // eslint-disable-next-line no-console
      console.error("API error:", { baseURL: API_BASE_URL, proxy: PROXY_PREFIX, url, status, data: error?.response?.data });
    }
    return Promise.reject(finalError);
  }
);

// --- ENDPOINTS DE PROYECTOS ---
export const getProjects = async () => {
  // GET /api/Projects
  const res = await api.get("/Projects");
  return res.data;
};

export const getProjectById = async (id: number) => {
  // GET /api/Projects/{id}
  const res = await api.get(`/Projects/${id}`);
  return res.data;
};

export const createProject = async (formData: FormData) => {
  // POST /api/Projects/with-image
  const res = await api.post("/Projects/with-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProject = async (id: number, formData: FormData) => {
  // PUT /api/Projects/{id}/with-image
  const res = await api.put(`/Projects/${id}/with-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProject = async (id: number) => {
  // DELETE /api/Projects/{id}
  const res = await api.delete(`/Projects/${id}`);
  return res.data;
};

// --- ENDPOINTS DE USUARIOS ---
export const getUsers = async () => {
  // GET /api/Users
  const res = await api.get("/Users");
  return res.data;
};

export const getUserById = async (id: number) => {
  // GET /api/Users/{id}
  const res = await api.get(`/Users/${id}`);
  return res.data;
};

export const createUser = async (formData: FormData) => {
  // POST /api/Users/with-image
  const res = await api.post("/Users/with-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateUser = async (id: number, formData: FormData) => {
  // PUT /api/Users/{id}/with-image
  const res = await api.put(`/Users/${id}/with-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteUser = async (id: number) => {
  // DELETE /api/Users/{id}
  const res = await api.delete(`/Users/${id}`);
  return res.data;
};

// --- ENDPOINTS DE PUNTOS ---
export const getPoints = async () => {
  // GET /api/Points
  const res = await api.get("/Points");
  return res.data;
};

export const getPointById = async (id: number) => {
  // GET /api/Points/{id}
  const res = await api.get(`/Points/${id}`);
  return res.data;
};

export const createPoint = async (point: any) => {
  // POST /api/Points
  const res = await api.post("/Points", point);
  return res.data;
};

export const updatePoint = async (id: number, point: any) => {
  // PUT /api/Points/{id}
  const res = await api.put(`/Points/${id}`, point);
  return res.data;
};

export const deletePoint = async (id: number) => {
  // DELETE /api/Points/{id}
  const res = await api.delete(`/Points/${id}`);
  return res.data;
};

// --- ENDPOINTS DE MENSAJES DE CONTACTO ---
export const getContactMessages = async () => {
  // GET /api/ContactMessages
  const res = await api.get("/ContactMessages");
  return res.data;
};

export const getContactMessageById = async (id: number) => {
  // GET /api/ContactMessages/{id}
  const res = await api.get(`/ContactMessages/${id}`);
  return res.data;
};

export const createContactMessage = async (message: any) => {
  // POST /api/ContactMessages
  const res = await api.post("/ContactMessages", message);
  return res.data;
};

export const deleteContactMessage = async (id: number) => {
  // DELETE /api/ContactMessages/{id}
  const res = await api.delete(`/ContactMessages/${id}`);
  return res.data;
};

