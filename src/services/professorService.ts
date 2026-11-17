import { apiFetch } from "../lib/api";
import type { Professor } from "../types";

export type DadosProfessor = {
  siape: string;
  emailSiape: string | null;
  telefonesInstitucionais: string[];
  telefonesPessoais: string[];
  emPGD: boolean;
  titulacao: string | null;
  escolaridade: string | null;
};

export type DadosContaProfessor = {
  nomeUsual: string;
  emailInstitucional: string;
  emailSecundario: string;
  emailSiape: string;
  emailNotificacoes: string;
  emailClassroom: string;
  telefonesInstitucionais: string[];
  telefonesPessoais: string[];
  emPGD: boolean;
};

export async function buscarProfessores(): Promise<Professor[]> {
  const resposta = await apiFetch("/professores");
  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("Resposta inválida ao buscar professores.");
  }

  return dados as Professor[];
}

export async function contarProfessores(): Promise<number> {
  const resposta = await apiFetch("/professores");
  const dados: unknown = await resposta.json();
  return Array.isArray(dados) ? dados.length : 0;
}

export async function buscarProfessor(id: string): Promise<Professor> {
  const resposta = await apiFetch(`/professores/${id}`);
  return (await resposta.json()) as Professor;
}

export async function criarProfessor(
  dados: DadosProfessor & { fkUsuario: string },
): Promise<Professor> {
  const resposta = await apiFetch("/professores", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  return (await resposta.json()) as Professor;
}

export async function atualizarProfessor(
  id: string,
  dados: Partial<DadosProfessor>,
): Promise<void> {
  await apiFetch(`/professores/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function atualizarContaProfessor(
  id: string,
  dados: DadosContaProfessor,
): Promise<void> {
  await apiFetch(`/professores/${id}/conta`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function excluirProfessor(id: string): Promise<void> {
  await apiFetch(`/professores/${id}`, { method: "DELETE" });
}