import { apiFetch } from "../lib/api";
import type { InscricaoResumo } from "../types";

export async function buscarInscricoesPendentes(): Promise<InscricaoResumo[]> {
  const resposta = await apiFetch("/inscricoes?status=PENDENTE");
  return ((await resposta.json()) as { inscricoes: InscricaoResumo[] }).inscricoes;
}