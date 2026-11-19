import { apiFetch } from "../lib/api";

import type {
  InscricaoResumo,
  InscricaoDetalhe,
  HistoricoInscricao,
  DocumentoInscricao,
  MinhaInscricao,
  CategoriaDocumento,
} from "../types";

export async function buscarInscricoes(
  status?: string
): Promise<InscricaoResumo[]> {
  const caminho = status
    ? `/inscricoes?status=${encodeURIComponent(status)}`
    : "/inscricoes";

  const resposta = await apiFetch(caminho);
  const dados = await resposta.json();

  return dados.inscricoes ?? [];
}

export async function buscarInscricoesPendentes(): Promise<InscricaoResumo[]> {
  const resposta = await apiFetch("/inscricoes?status=PENDENTE");
  const dados = await resposta.json();

  return dados.inscricoes ?? [];
}

export async function buscarMinhasInscricoes(): Promise<MinhaInscricao[]> {
  const resposta = await apiFetch("/inscricoes/minhas");
  const dados = await resposta.json();

  return dados.inscricoes ?? [];
}

export async function criarInscricao(cursoId: string) {
  const resposta = await apiFetch("/inscricoes", {
    method: "POST",
    body: JSON.stringify({ cursoId }),
  });

  return resposta.json();
}

export async function buscarDetalhesInscricao(
  id: string
): Promise<InscricaoDetalhe> {
  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(id)}`
  );

  const dados = await resposta.json();

  return dados.inscricao;
}

export async function aprovarInscricao(id: string) {
  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(id)}/aprovar`,
    {
      method: "PATCH",
    }
  );

  const dados = await resposta.json();

  return dados.inscricao;
}

export async function rejeitarInscricao(
  id: string,
  motivo?: string
) {
  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(id)}/rejeitar`,
    {
      method: "PATCH",
      body: JSON.stringify({ motivo }),
    }
  );

  const dados = await resposta.json();

  return dados.inscricao;
}

export async function cancelarInscricao(
  id: string,
  motivo?: string
) {
  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(id)}/cancelar`,
    {
      method: "PATCH",
      body: JSON.stringify({ motivo }),
    }
  );

  const dados = await resposta.json();

  return dados.inscricao;
}

export async function buscarHistoricoInscricao(
  id: string
): Promise<HistoricoInscricao[]> {
  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(id)}/historico`
  );

  const dados = await resposta.json();

  return dados.historico ?? [];
}

export async function buscarDocumentosInscricao(
  id: string
): Promise<DocumentoInscricao[]> {
  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(id)}/documentos`
  );

  const dados = await resposta.json();

  return dados.documentos ?? [];
}

export async function enviarDocumentoInscricao(
  inscricaoId: string,
  arquivo: File,
  categoria: CategoriaDocumento
): Promise<DocumentoInscricao> {
  const formulario = new FormData();

  formulario.append("arquivo", arquivo);
  formulario.append("categoria", categoria);

  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(inscricaoId)}/documentos`,
    {
      method: "POST",
      body: formulario,
    }
  );

  const dados = await resposta.json();

  return dados.documento;
}

export async function removerDocumentoInscricao(
  documentoId: string
): Promise<void> {
  await apiFetch(
    `/documentos/${encodeURIComponent(documentoId)}`,
    {
      method: "DELETE",
    }
  );
}

export async function registrarRendaFamiliar(
  inscricaoId: string,
  dados: {
    rendaFamiliar: number;
    numeroPessoas: number;
  }
) {
  const resposta = await apiFetch(
    `/inscricoes/${encodeURIComponent(inscricaoId)}/renda`,
    {
      method: "POST",
      body: JSON.stringify(dados),
    }
  );

  const resultado = await resposta.json();

  return resultado.renda;
}
