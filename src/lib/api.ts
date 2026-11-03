import type { CursoRelatorio, ResumoSistema, UsuarioLista } from "../types";
import { lerToken } from "./sessao";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://deppiapi-q96m.onrender.com"
).replace(/\/$/, "");

async function chamar(caminho: string, init: RequestInit = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${lerToken()}`,
      ...init.headers,
    },
  });

  if (!resposta.ok) {
    let msg = `Erro ${resposta.status}`;
    try {
      const corpo = await resposta.json();
      msg = corpo.mensagem ?? corpo.msg ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return resposta;
}

export async function buscarResumoSistema(): Promise<ResumoSistema> {
  const r = await chamar("/admin/relatorios/resumo");
  return ((await r.json()) as { resumo: ResumoSistema }).resumo;
}

export async function buscarCursosRelatorio(): Promise<CursoRelatorio[]> {
  const r = await chamar("/admin/relatorios/cursos");
  return (await r.json()) as CursoRelatorio[];
}

export async function exportarCsv() {
  const r = await chamar("/admin/relatorios/cursos/exportar");
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio_cursos_ifce.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export async function buscarUsuarios(): Promise<UsuarioLista[]> {
  const r = await chamar("/users");
  return (await r.json()) as UsuarioLista[];
}

export async function concederCargo(id: string, cargo: "ADMIN" | "DEPPI") {
  await chamar("/admin/cadastro", {
    method: "POST",
    body: JSON.stringify({ id, cargo }),
  });
}