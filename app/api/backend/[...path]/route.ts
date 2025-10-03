import { NextResponse } from "next/server";
import axios from "axios";
import https from "node:https";

// Base del backend (.NET)
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7251/api").replace(/\/$/, "");

// Agente HTTPS que acepta el certificado de desarrollo (solo dev)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const segments = path || [];
  const urlIn = new URL(req.url);
  const target = `${API_BASE}/${segments.join("/")}${urlIn.search}`;

  try {
    const res = await axios.get(target, { httpsAgent, headers: { Accept: "application/json" } });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: "Proxy error" };
    return NextResponse.json(data, { status });
  }
}

async function forwardWithBody(method: "POST" | "PUT" | "DELETE", req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const segments = path || [];
  const urlIn = new URL(req.url);
  const target = `${API_BASE}/${segments.join("/")}${urlIn.search}`;
  const contentType = req.headers.get("content-type") || undefined;
  const body = method === "DELETE" ? undefined : Buffer.from(await req.arrayBuffer());

  try {
    const res = await axios.request({
      method,
      url: target,
      data: body,
      headers: {
        "Content-Type": contentType,
        Accept: "application/json",
      },
      httpsAgent,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: "Proxy error" };
    return NextResponse.json(data, { status });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardWithBody("POST", req, ctx);
}

export async function PUT(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardWithBody("PUT", req, ctx);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardWithBody("DELETE", req, ctx);
}
