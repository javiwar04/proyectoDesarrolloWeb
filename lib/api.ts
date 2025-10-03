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
