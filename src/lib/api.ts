import { lerToken } from "./sessao";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://deppiapi-q96m.onrender.com"
).replace(/\/$/, "");

export async function apiFetch(
  caminho: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = lerToken();

  if (
    init.body &&
    !(typeof FormData !== "undefined" && init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers,
  });

  if (!resposta.ok) {
    let mensagem = `Erro ${resposta.status}`;

    try {
      const corpo: unknown = await resposta.json();

      if (corpo && typeof corpo === "object") {
        const dados = corpo as {
          mensagem?: string;
          msg?: string;
          error?: string;
          erro?: string;
          erros?: { message?: string }[];
        };

        mensagem =
          dados.mensagem ??
          dados.msg ??
          dados.error ??
          dados.erro ??
          dados.erros?.[0]?.message ??
          mensagem;
      }
    } catch {

    }

    throw new Error(mensagem);
  }

  return resposta;
}