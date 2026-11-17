"use client";

import type { ReactNode } from "react";
import { Icone } from "../../components/ui/Icone";
import { CAMPO_INPUT, CAMPO_LABEL, PAINEL, PAINEL_TITULO } from "../../components/ui/estilos";

export const TITULACOES = ["Graduação", "Especialização", "Mestrado", "Doutorado"];
export const ESCOLARIDADES = ["Graduação", "Pós-graduação"];

export const SUCESSO =
  "flex items-center gap-2.5 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-3 text-[13px] text-[#166534]";

export function mascararTelefone(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n ? `(${n}` : "";
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

export const limparTelefones = (l: string[]) => l.map((t) => t.trim()).filter(Boolean);

export function Campo({
  rotulo, opcional, dica, children,
}: { rotulo: string; opcional?: boolean; dica?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={CAMPO_LABEL}>
        {rotulo}
        {opcional && <span className="font-normal text-texto-3"> (opcional)</span>}
      </span>
      {children}
      {dica && <span className="mt-1.5 block text-xs text-texto-2">{dica}</span>}
    </label>
  );
}

export function Toggle({
  marcado, aoMudar, titulo, descricao,
}: { marcado: boolean; aoMudar: (v: boolean) => void; titulo: string; descricao: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-borda px-3.5 py-3">
      <div>
        <div className="text-[13px] font-medium">{titulo}</div>
        <div className="text-xs text-texto-2">{descricao}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={marcado}
        onClick={() => aoMudar(!marcado)}
        className={`relative h-6 w-11 flex-none cursor-pointer rounded-full border-0 transition-colors ${marcado ? "bg-acento" : "bg-borda"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${marcado ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Grupo({
  titulo, lista, aoMudar,
}: { titulo: string; lista: string[]; aoMudar: (l: string[]) => void }) {
  return (
    <div>
      <div className={CAMPO_LABEL}>{titulo}</div>
      <div className="flex flex-col gap-2">
        {lista.map((tel, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={`${CAMPO_INPUT} font-mono`}
              inputMode="tel"
              placeholder="(85) 90000-0000"
              value={tel}
              onChange={(e) =>
                aoMudar(lista.map((t, j) => (j === i ? mascararTelefone(e.target.value) : t)))
              }
            />
            <button
              type="button"
              aria-label="Remover telefone"
              className="grid size-8 flex-none cursor-pointer place-items-center rounded-md border-0 bg-transparent text-texto-2 hover:bg-trilho"
              onClick={() => aoMudar(lista.filter((_, j) => j !== i))}
            >
              <Icone nome="close" tamanho={18} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-semibold text-acento"
        onClick={() => aoMudar([...lista, ""])}
      >
        <Icone nome="add" tamanho={16} /> Adicionar telefone
      </button>
    </div>
  );
}

export function TelefonesCard({
  institucionais, pessoais, aoMudarInst, aoMudarPess,
}: {
  institucionais: string[];
  pessoais: string[];
  aoMudarInst: (l: string[]) => void;
  aoMudarPess: (l: string[]) => void;
}) {
  return (
    <section className={PAINEL}>
      <h2 className={PAINEL_TITULO}>Telefones</h2>
      <Grupo titulo="Institucionais" lista={institucionais} aoMudar={aoMudarInst} />
      <hr className="my-4 border-borda" />
      <Grupo titulo="Pessoais" lista={pessoais} aoMudar={aoMudarPess} />
    </section>
  );
}