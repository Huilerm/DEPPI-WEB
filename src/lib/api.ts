import type {
  Curso,
  CursoRelatorio,
  Instituicao,
  ResumoSistema,
  UsuarioLista,
  StatusCurso,
  InscricaoResumo,
  StatusInscricao,
} from "../types";

import { lerToken } from "./sessao";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://deppiapi-q96m.onrender.com"
).replace(/\/$/, "");

async function chamar(caminho: string, init: RequestInit = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${lerToken()}`,
      ...init.headers,
    },
  });

  if (!resposta.ok) {
    let msg = `Erro ${resposta.status}`;
    try {
      const corpo = await resposta.json();
      msg = corpo.mensagem ?? corpo.msg ?? corpo.error ?? msg;
    } catch { }
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

export type HistoricoInscricao = {
  id?: string;
  alteracao: string;
  descricao: string;
  statusAnterior: StatusInscricao;
  statusAtual: StatusInscricao;
  dataModificacao: string;
  usuario?: { id: string; nome: string; emailInstitucional: string };
};

export type InscricaoDetalhe = InscricaoResumo & {
  rendaFamiliar?: { rendaFamiliar: number; numeroPessoas: number } | null;
  historico?: HistoricoInscricao[];
};

export async function buscarInscricoes(status?: StatusInscricao): Promise<InscricaoResumo[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const r = await chamar(`/inscricoes${query}`);
  const dados = await r.json();
  if (!Array.isArray(dados.inscricoes)) throw new Error("Resposta inválida ao listar inscrições.");
  return dados.inscricoes as InscricaoResumo[];
}

export async function buscarInscricoesPendentes(): Promise<InscricaoResumo[]> {
  return buscarInscricoes("PENDENTE");
}

export type MinhaInscricao = {
  id: string;
  data: string;
  status: StatusInscricao;
  curso: {
    id: string;
    nome: string;
    dataInicio: string;
    dataFim: string;
    horarioInicio: string;
    horarioFim: string;
    carga_horaria: number;
    Instituicao: { nome: string; campus: string } | null;
  };
  documentos: {
    id: string;
    nomeOriginal: string;
    categoria: string | null;
    criadoEm: string;
  }[];
};

export async function buscarMinhasInscricoes(): Promise<MinhaInscricao[]> {
  const r = await chamar("/inscricoes/minhas");
  const dados = await r.json();
  if (!Array.isArray(dados.inscricoes)) {
    throw new Error("Resposta inválida ao buscar suas inscrições.");
  }
  return dados.inscricoes as MinhaInscricao[];
}

export async function criarInscricao(cursoId: string): Promise<void> {
  await chamar("/inscricoes", { method: "POST", body: JSON.stringify({ cursoId }) });
}

export async function buscarDetalhesInscricao(id: string): Promise<InscricaoDetalhe> {
  const r = await chamar(`/inscricoes/${encodeURIComponent(id)}`);
  const dados = await r.json();
  if (!dados.inscricao) throw new Error("A API não retornou os detalhes da inscrição.");
  return dados.inscricao as InscricaoDetalhe;
}

export async function buscarHistoricoInscricao(id: string): Promise<HistoricoInscricao[]> {
  const r = await chamar(`/inscricoes/${encodeURIComponent(id)}/historico`);
  const dados = await r.json();
  return Array.isArray(dados.historico) ? dados.historico as HistoricoInscricao[] : [];
}

export async function aprovarInscricao(id: string): Promise<void> {
  await chamar(`/inscricoes/${encodeURIComponent(id)}/aprovar`, { method: "PATCH" });
}

export async function rejeitarInscricao(id: string, motivo: string): Promise<void> {
  await chamar(`/inscricoes/${encodeURIComponent(id)}/rejeitar`, {
    method: "PATCH",
    body: JSON.stringify({ motivo }),
  });
}

export async function cancelarInscricao(id: string, motivo?: string): Promise<void> {
  await chamar(`/inscricoes/${encodeURIComponent(id)}/cancelar`, {
    method: "PATCH",
    body: JSON.stringify(motivo ? { motivo } : {}),
  });
}

export async function contarProfessores(): Promise<number> {
  const r = await chamar("/professores");
  const dados = await r.json();
  return Array.isArray(dados) ? dados.length : 0;
}

export async function concederCargo(id: string, cargo: "ADMIN" | "DEPPI") {
  await chamar("/admin/cadastro", {
    method: "POST",
    body: JSON.stringify({ id, cargo }),
  });
}

type DadosInstituicao = Pick<
  Instituicao,
  "nome" | "cidade" | "campus" | "cnpj"
>;

export async function buscarInstituicoes(): Promise<Instituicao[]> {
  const resposta = await chamar("/instituicao/");
  const dados = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("Resposta inválida ao buscar instituições.");
  }

  return dados as Instituicao[];
}

export async function criarInstituicao(
  dados: DadosInstituicao
): Promise<void> {
  await chamar("/instituicao/cadastrar", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarInstituicao(
  id: string,
  dados: DadosInstituicao
): Promise<void> {
  await chamar("/instituicao/atualizar", {
    method: "PUT",
    body: JSON.stringify({ id, ...dados }),
  });
}

export async function excluirInstituicao(id: string): Promise<void> {
  await chamar("/instituicao/excluir", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

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
  const r = await chamar("/cursos");
  return ((await r.json()) as { data: Curso[] }).data;
}

export async function buscarCurso(id: string): Promise<Curso> {
  const r = await chamar(`/cursos/${id}`);
  return ((await r.json()) as { data: Curso }).data;
}

export async function criarCurso(
  dados: DadosCurso & { fkInstituicao: string }
): Promise<Curso> {
  const r = await chamar("/cursos", { method: "POST", body: JSON.stringify(dados) });
  return ((await r.json()) as { data: Curso }).data;
}

export async function atualizarCurso(
  id: string,
  dados: DadosAtualizacaoCurso
): Promise<Curso> {
  const r = await chamar(`/cursos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  return ((await r.json()) as { data: Curso }).data;
}

export async function excluirCurso(id: string): Promise<void> {
  await chamar(`/cursos/${id}`, { method: "DELETE" });
}

export async function enviarCapa(id: string, arquivo: File): Promise<void> {
  const fd = new FormData();
  fd.append("cover", arquivo);
  await chamar(`/cursos/${id}/capa`, { method: "POST", body: fd });
}

function extrairUrlCapa(valor: unknown): string | null {
  if (typeof valor === "string") {
    const texto = valor.trim();

    if (!texto) return null;

    if (/^https?:\/\//i.test(texto)) {
      return texto;
    }

    if (texto.startsWith("/")) {
      return new URL(texto, API_URL).toString();
    }

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

    const camposAninhados = [
      "data",
      "capa",
      "cover",
      "imagem",
      "arquivo",
    ];

    for (const campo of camposAninhados) {
      const resultado = extrairUrlCapa(objeto[campo]);

      if (resultado) return resultado;
    }
  }

  return null;
}

export async function buscarUrlCapa(
  id: string
): Promise<string | null> {
  const r = await chamar(`/cursos/${id}/capa`, {
    cache: "no-store",
  });

  const tipo = r.headers.get("content-type")?.toLowerCase() ?? "";

  if (tipo.startsWith("image/")) {
    const imagem = await r.blob();
    return URL.createObjectURL(imagem);
  }

  const texto = (await r.text()).trim();

  if (!texto) return null;

  try {
    const dados: unknown = JSON.parse(texto);

    return extrairUrlCapa(dados) ?? extrairUrlCapa(texto);
  } catch {
    return extrairUrlCapa(texto);
  }
}
