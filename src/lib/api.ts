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

export async function abrirDocumento(documentoId: string) {

  const aba = window.open("", "_blank"); //Abre nova aba
  try {
    const resposta = await apiFetch(`/documentos/${documentoId}/url`); //Faz a requisição no back
    const { url } = (await resposta.json()) as { url: string }; //Transforma a resposta em JSON
    if (aba) aba.location.href = url; //Direciona nova aba para o documento
    else window.location.href = url;
  } catch (erro) { //Trata erros
    aba?.close();
    throw erro;
  }
}