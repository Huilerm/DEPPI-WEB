import { apiFetch } from "../lib/api";
import type { Instituicao } from "../types";

type DadosInstituicao = Pick<
  Instituicao,
  "nome" | "cidade" | "campus" | "cnpj"
>;

export async function buscarInstituicoes(): Promise<Instituicao[]> {
  const resposta = await apiFetch("/instituicao/");
  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("Resposta inválida ao buscar instituições.");
  }

  return dados as Instituicao[];
}

export async function criarInstituicao(
  dados: DadosInstituicao,
): Promise<void> {
  await apiFetch("/instituicao/cadastrar", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarInstituicao(
  id: string,
  dados: DadosInstituicao,
): Promise<void> {
  await apiFetch("/instituicao/atualizar", {
    method: "PUT",
    body: JSON.stringify({ id, ...dados }),
  });
}

export async function excluirInstituicao(id: string): Promise<void> {
  await apiFetch("/instituicao/excluir", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}