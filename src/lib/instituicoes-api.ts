import type { Instituicao } from "../types";
import { API_URL } from "./api";
import { lerToken } from "./sessao";

type DadosInstituicao = Pick<Instituicao, "nome" | "cidade" | "campus" | "cnpj">;

/*
 * O código-fonte recebido só documenta /admin/relatorios/resumo; não contém
 * as rotas CRUD de instituições. Este módulo centraliza a convenção REST
 * /admin/instituicoes para que ela possa ser ajustada facilmente ao contrato
 * real do backend, assim que confirmado com a equipe da API.
 */
const ENDPOINT = `${API_URL}/admin/instituicoes`;

async function requisitar(caminho: string, init: RequestInit = {}) {
  const token = lerToken();
  const resposta = await fetch(caminho, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!resposta.ok) {
    let detalhe = "";
    try {
      const corpo = await resposta.json();
      detalhe = String(corpo.mensagem ?? corpo.message ?? corpo.erro ?? "");
    } catch { /* Resposta sem JSON */ }
    throw new Error(detalhe || `A API respondeu com erro (${resposta.status}).`);
  }

  if (resposta.status === 204) return null;
  const texto = await resposta.text();
  return texto ? JSON.parse(texto) as unknown : null;
}

function normalizarInstituicao(valor: unknown): Instituicao {
  const item = valor as Record<string, unknown>;
  return {
    id: String(item.id ?? item.instituicaoId ?? ""),
    nome: String(item.nome ?? item.name ?? ""),
    cidade: String(item.cidade ?? item.city ?? ""),
    campus: String(item.campus ?? item.nomeCampus ?? ""),
    cnpj: String(item.cnpj ?? item.CNPJ ?? ""),
  };
}

export async function buscarInstituicoes(): Promise<Instituicao[]> {
  const resposta = await requisitar(ENDPOINT);
  const corpo = resposta as Record<string, unknown> | unknown[] | null;
  const lista = Array.isArray(corpo)
    ? corpo
    : corpo && typeof corpo === "object"
      ? (corpo.instituicoes ?? corpo.data ?? corpo.items ?? []) as unknown[]
      : [];
  if (!Array.isArray(lista)) throw new Error("A resposta da API não contém uma lista de instituições válida.");
  return lista.map(normalizarInstituicao);
}

export async function criarInstituicao(dados: DadosInstituicao): Promise<void> {
  await requisitar(ENDPOINT, { method: "POST", body: JSON.stringify(dados) });
}

export async function atualizarInstituicao(id: string, dados: DadosInstituicao): Promise<void> {
  await requisitar(`${ENDPOINT}/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(dados) });
}

export async function excluirInstituicao(id: string): Promise<void> {
  await requisitar(`${ENDPOINT}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
