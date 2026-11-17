import { apiFetch } from "../lib/api";
import type { Cargo, UsuarioLista } from "../types";

export async function buscarUsuarios(): Promise<UsuarioLista[]> {
  const resposta = await apiFetch("/users");
  return (await resposta.json()) as UsuarioLista[];
}

export async function concederCargo(
  id: string,
  cargo: "PROFESSOR" | "ADMIN" | "DEPPI",
  siape?: string,
): Promise<void> {
  await apiFetch("/admin/cadastro", {
    method: "POST",
    body: JSON.stringify({
      id,
      cargo,
      ...(cargo === "PROFESSOR" ? { siape } : {}),
    }),
  });
}

export async function excluirUsuario(id: string): Promise<void> {
  await apiFetch(`/users/${id}`, {
    method: "DELETE",
  });
}