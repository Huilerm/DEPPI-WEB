import { apiFetch } from "../lib/api";
import type { CursoRelatorio, ResumoSistema } from "../types";

export async function buscarResumoSistema(): Promise<ResumoSistema> {
  const resposta = await apiFetch("/admin/relatorios/resumo");
  return ((await resposta.json()) as { resumo: ResumoSistema }).resumo;
}

export async function buscarCursosRelatorio(): Promise<CursoRelatorio[]> {
  const resposta = await apiFetch("/admin/relatorios/cursos");
  return (await resposta.json()) as CursoRelatorio[];
}

export async function exportarCsv(): Promise<void> {
  const resposta = await apiFetch("/admin/relatorios/cursos/exportar");
  const url = URL.createObjectURL(await resposta.blob());
  const link = document.createElement("a");

  link.href = url;
  link.download = "relatorio_cursos_ifce.csv";
  link.click();

  URL.revokeObjectURL(url);
}