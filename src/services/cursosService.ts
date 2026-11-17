import { API_URL, apiFetch } from "../lib/api";
import type { Curso, StatusCurso } from "../types";

export type DadosCurso = {
  nome: string;
  carga_horaria: number;
  vagas: number;
  dataInicio: string;
  dataFim: string;
  horarioInicio: string;
  horarioFim: string;
};

export type DadosAtualizacaoCurso = Partial<DadosCurso> & {
  status?: StatusCurso;
};

export async function buscarCursos(): Promise<Curso[]> {
  const resposta = await apiFetch("/cursos");
  return ((await resposta.json()) as { data: Curso[] }).data;
}

export async function buscarCurso(id: string): Promise<Curso> {
  const resposta = await apiFetch(`/cursos/${id}`);
  return ((await resposta.json()) as { data: Curso }).data;
}

export async function criarCurso(
  dados: DadosCurso & { fkInstituicao: string },
): Promise<Curso> {
  const resposta = await apiFetch("/cursos", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  return ((await resposta.json()) as { data: Curso }).data;
}

export async function atualizarCurso(
  id: string,
  dados: DadosAtualizacaoCurso,
): Promise<Curso> {
  const resposta = await apiFetch(`/cursos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  return ((await resposta.json()) as { data: Curso }).data;
}

export async function excluirCurso(id: string): Promise<void> {
  await apiFetch(`/cursos/${id}`, { method: "DELETE" });
}

export async function enviarCapa(id: string, arquivo: File): Promise<void> {
  const formulario = new FormData();
  formulario.append("cover", arquivo);

  await apiFetch(`/cursos/${id}/capa`, {
    method: "POST",
    body: formulario,
  });
}

function extrairUrlCapa(valor: unknown): string | null {
  if (typeof valor === "string") {
    const texto = valor.trim();

    if (!texto) return null;
    if (/^https?:\/\//i.test(texto)) return texto;
    if (texto.startsWith("/")) return new URL(texto, API_URL).toString();

    return null;
  }

  if (valor && typeof valor === "object") {
    const objeto = valor as Record<string, unknown>;

    const camposUrl = [
      "url",
      "capaUrl",
      "coverUrl",
      "publicUrl",
      "signedUrl",
      "signedURL",
    ];

    for (const campo of camposUrl) {
      const resultado = extrairUrlCapa(objeto[campo]);
      if (resultado) return resultado;
    }

    const camposAninhados = ["data", "capa", "cover", "imagem", "arquivo"];

    for (const campo of camposAninhados) {
      const resultado = extrairUrlCapa(objeto[campo]);
      if (resultado) return resultado;
    }
  }

  return null;
}

export async function buscarUrlCapa(id: string): Promise<string | null> {
  const resposta = await apiFetch(`/cursos/${id}/capa`, {
    cache: "no-store",
  });

  const tipo = resposta.headers.get("content-type")?.toLowerCase() ?? "";

  if (tipo.startsWith("image/")) {
    const imagem = await resposta.blob();
    return URL.createObjectURL(imagem);
  }

  const texto = (await resposta.text()).trim();
  if (!texto) return null;

  try {
    const dados: unknown = JSON.parse(texto);
    return extrairUrlCapa(dados) ?? extrairUrlCapa(texto);
  } catch {
    return extrairUrlCapa(texto);
  }
}