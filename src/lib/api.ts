import type { ResumoSistema } from "../types";
import { lerToken } from "./sessao";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://deppiapi-q96m.onrender.com"
).replace(/\/$/, "");

export async function buscarResumoSistema(): Promise<ResumoSistema> {
  const resposta = await fetch(`${API_URL}/admin/relatorios/resumo`, {
    headers: { Authorization: `Bearer ${lerToken()}` },
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao carregar o resumo (${resposta.status})`);
  }

  const dados = (await resposta.json()) as {
    mensagem: string;
    resumo: ResumoSistema;
  };

  return dados.resumo;
}

export const RESUMO_EXEMPLO: ResumoSistema = {
  geradoEm: new Date().toISOString(),
  totais: {
    usuarios: 0,
    alunos: 0,
    professores: 0,
    cursos: 0,
    inscricoes: 0,
    instituicoes: 0,
    vagasRestantes: 0,
  },
  inscricoesPorSituacao: [
    { status: "PENDENTE", quantidade: 0 },
    { status: "DEFERIDO", quantidade: 0 },
    { status: "INDEFERIDO", quantidade: 0 },
    { status: "CANCELADO", quantidade: 0 },
  ],
  cursosPorSituacao: [
    { status: "ANALISE", quantidade: 0 },
    { status: "ANDAMENTO", quantidade: 0 },
    { status: "CONCLUIDO", quantidade: 0 },
    { status: "FECHADO", quantidade: 0 },
  ],
};