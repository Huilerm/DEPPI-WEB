import type { StatusCurso } from "../../types";

export const STATUS: Record<StatusCurso, { rotulo: string; icone: string; classe: string }> = {
  ANDAMENTO: { rotulo: "Em andamento", icone: "play_circle", classe: "bg-[#e3f4e8] text-[#15803d]" },
  ANALISE: { rotulo: "Em análise", icone: "hourglass_top", classe: "bg-[#fdf0d8] text-[#b45309]" },
  CONCLUIDO: { rotulo: "Concluído", icone: "task_alt", classe: "bg-[#e3ecfd] text-[#1d4ed8]" },
  FECHADO: { rotulo: "Fechado", icone: "lock", classe: "bg-[#ecebe8] text-[#444]" },
};

export function dataBR(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}
export const hora = (iso: string) => iso.slice(11, 16);

export const dataParaApi = (d: string) => `${d}T00:00:00.000Z`;
export const horaParaApi = (h: string) => `1970-01-01T${h}:00.000Z`;
