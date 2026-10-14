"use client";

import { createContext, useContext } from "react";
import type { Cargo, UsuarioSessao } from "../../types";

export interface SessaoAtual {
  usuario: UsuarioSessao;
  papel: Cargo;
}

const Contexto = createContext<SessaoAtual | null>(null);

export const SessaoProvider = Contexto.Provider;

export function useSessao(): SessaoAtual {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useSessao deve ser usado dentro do AppShell.");
  return valor;
}
