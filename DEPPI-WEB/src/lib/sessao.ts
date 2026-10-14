import type { Cargo, UsuarioSessao } from "../types";

export function lerToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
}

export function lerUsuario(): UsuarioSessao | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = sessionStorage.getItem("usuario");
    return bruto ? (JSON.parse(bruto) as UsuarioSessao) : null;
  } catch {
    return null;
  }
}

export function limparSessao() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("usuario");
}

const PRIORIDADE: Cargo[] = ["ADMIN", "DEPPI", "PROFESSOR", "ALUNO"];

export function papelPrincipal(cargos: Cargo[] | undefined): Cargo | null {
  if (!cargos?.length) return null;
  return PRIORIDADE.find((c) => cargos.includes(c)) ?? null;
}
