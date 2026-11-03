import type { Instituicao } from "../types";
import { lerToken } from "./sessao";

type DadosInstituicao = Pick<Instituicao, "nome" | "cidade" | "campus" | "cnpj">;

/*
 * Rotas reais do backend (instituicao.routes.ts), acessadas via proxy do Next
 * (src/app/api-deppi/[...caminho]/route.ts) para evitar CORS:
 *   GET    /instituicao            -> lista
 *   POST   /instituicao/cadastrar  -> cria
 *   PUT    /instituicao/atualizar  -> atualiza (id no body)
 *   DELETE /instituicao/excluir    -> exclui   (id no body)
 */
const ENDPOINT = "/api-deppi/instituicao";

// O backend devolve erros do zod como JSON dentro de "mensagem"; deixa legível.
function extrairMensagem(texto: string): string {
  if (texto.trim().startsWith("[")) {
    try {
      const itens = JSON.parse(texto) as { message?: string }[];
      const msgs = itens.map((i) => i.message).filter(Boolean);
      if (msgs.length) return msgs.join(" · ");
    } catch { /* mantém o texto original */ }
  }
  return texto;
}

async function requisitar(caminho: string, init: RequestInit = {}) {
  const token = lerToken();
  let resposta: Response;
  try {
    resposta = await fetch(caminho, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  if (!resposta.ok) {
    let detalhe = "";
    try {
      const corpo = await resposta.json();
      detalhe = extrairMensagem(String(corpo.mensagem ?? corpo.msg ?? corpo.message ?? ""));
    } catch { /* Resposta sem JSON */ }
    if (!detalhe) {
      if (resposta.status === 401) detalhe = "Sessão expirada. Faça login novamente.";
      else if (resposta.status === 403) detalhe = "Seu usuário não tem permissão (precisa ser ADMIN ou DEPPI).";
      else detalhe = `A API respondeu com erro (${resposta.status}).`;
    }
    throw new Error(detalhe);
  }

  if (resposta.status === 204) return null;
  const texto = await resposta.text();
  return texto ? (JSON.parse(texto) as unknown) : null;
}

function normalizarInstituicao(valor: unknown): Instituicao {
  const item = valor as Record<string, unknown>;
  return {
    id: String(item.id ?? ""),
    nome: String(item.nome ?? ""),
    cidade: String(item.cidade ?? ""),
    campus: String(item.campus ?? ""),
    cnpj: String(item.cnpj ?? ""),
  };
}

export async function buscarInstituicoes(): Promise<Instituicao[]> {
  const corpo = await requisitar(ENDPOINT);
  if (!Array.isArray(corpo)) throw new Error("A resposta da API não contém uma lista de instituições válida.");
  return corpo.map(normalizarInstituicao);
}

export async function criarInstituicao(dados: DadosInstituicao): Promise<void> {
  await requisitar(`${ENDPOINT}/cadastrar`, { method: "POST", body: JSON.stringify(dados) });
}

export async function atualizarInstituicao(id: string, dados: DadosInstituicao): Promise<void> {
  await requisitar(`${ENDPOINT}/atualizar`, { method: "PUT", body: JSON.stringify({ id, ...dados }) });
}

export async function excluirInstituicao(id: string): Promise<void> {
  await requisitar(`${ENDPOINT}/excluir`, { method: "DELETE", body: JSON.stringify({ id }) });
}
