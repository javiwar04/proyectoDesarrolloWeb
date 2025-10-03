import { NextResponse } from "next/server";
import axios from "axios";
import https from "node:https";

// Origen del backend sin "/api" para archivos estáticos
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7251/api").replace(/\/$/, "");
const ORIGIN = API_BASE.replace(/\/api$/, "");

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const segments = path || [];
  const urlIn = new URL(req.url);
  const target = `${ORIGIN}/${segments.join("/")}${urlIn.search}`;

  try {
    const res = await axios.get(target, { httpsAgent, responseType: "arraybuffer" });
    const contentType = res.headers["content-type"] || "application/octet-stream";
    return new NextResponse(res.data, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error: any) {
    const status = error?.response?.status || 502;
    const msg = error?.message || "Media proxy error";
    return new NextResponse(msg, { status });
  }
}
