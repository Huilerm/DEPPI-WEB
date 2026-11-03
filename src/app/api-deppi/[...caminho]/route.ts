import type { NextRequest } from "next/server";

// Proxy server-side: o navegador chama /api-deppi/... (mesma origem, sem CORS)
// e o Next repassa para a API da Render.
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://deppiapi-q96m.onrender.com"
).replace(/\/$/, "");

export const dynamic = "force-dynamic";

async function encaminhar(
  req: NextRequest,
  ctx: { params: Promise<{ caminho: string[] }> },
) {
  const { caminho } = await ctx.params;

  // só libera as rotas de instituição
  if (caminho[0] !== "instituicao") {
    return Response.json({ mensagem: "Rota não permitida." }, { status: 404 });
  }

  const url = `${API_URL}/${caminho.join("/")}${req.nextUrl.search}`;
  const headers = new Headers();
  const auth = req.headers.get("authorization");
  const tipo = req.headers.get("content-type");
  if (auth) headers.set("authorization", auth);
  if (tipo) headers.set("content-type", tipo);

  const temCorpo = req.method !== "GET" && req.method !== "HEAD";

  try {
    const resposta = await fetch(url, {
      method: req.method,
      headers,
      body: temCorpo ? await req.text() : undefined,
      cache: "no-store",
    });
    return new Response(await resposta.text(), {
      status: resposta.status,
      headers: { "content-type": resposta.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json(
      { mensagem: "Não foi possível conectar à API. Ela pode estar iniciando no Render; tente novamente em instantes." },
      { status: 502 },
    );
  }
}

export const GET = encaminhar;
export const POST = encaminhar;
export const PUT = encaminhar;
export const DELETE = encaminhar;
