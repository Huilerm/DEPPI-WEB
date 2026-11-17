
import { apiFetch } from "../lib/api";
import type { InscricaoResumo } from "../types";

export async function buscarInscricoesPendentes(): Promise<InscricaoResumo[]> {
  const resposta = await apiFetch("/inscricoes?status=PENDENTE");

  const dados = await resposta.json();

  return dados.inscricoes;
}

export async function buscarMinhasInscricoes() {
  const resposta = await apiFetch("/inscricoes/minhas");

  const dados = await resposta.json();

  return dados.inscricoes;
}

export async function criarInscricao(cursoId: string) {
  const resposta = await apiFetch("/inscricoes", {
    method: "POST",
    body: JSON.stringify({ cursoId }),
  });

  return resposta.json();
}
