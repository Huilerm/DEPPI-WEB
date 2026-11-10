"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  ResumoSistema,
  StatusCurso,
  StatusInscricao,
  UsuarioSessao,
} from "../../../types";
import { buscarResumoSistema } from "../../../lib/api";
import {
  dataPorExtenso,
  formatarNumero,
  primeiroNome,
  saudacao,
} from "../../../lib/formatadores";
import { Icone } from "../../../components/ui/Icone";

export const INSCRICOES: Record<
  StatusInscricao,
  { rotulo: string; icone: string; cor: string }
> = {
  PENDENTE: { rotulo: "Pendente", icone: "schedule", cor: "#b45309" },
  DEFERIDO: { rotulo: "Deferida", icone: "check_circle", cor: "#15803d" },
  INDEFERIDO: { rotulo: "Indeferida", icone: "cancel", cor: "#c0392b" },
  CANCELADO: { rotulo: "Cancelada", icone: "block", cor: "#737373" },
};

export const CURSOS: Record<
  StatusCurso,
  { rotulo: string; icone: string; cor: string }
> = {
  ANALISE: { rotulo: "Em análise", icone: "hourglass_top", cor: "#b45309" },
  ANDAMENTO: { rotulo: "Em andamento", icone: "play_circle", cor: "#15803d" },
  CONCLUIDO: { rotulo: "Concluído", icone: "check_circle", cor: "#1d4ed8" },
  FECHADO: { rotulo: "Fechado", icone: "lock", cor: "#6b6b6b" },
};

export const ROSCA_CORES: Record<StatusCurso, string> = {
  ANALISE: "#b45309",
  ANDAMENTO: "#15803d",
  CONCLUIDO: "#1d4ed8",
  FECHADO: "#9ca3af",
};

export const ORDEM_INSCRICAO: StatusInscricao[] = [
  "PENDENTE",
  "DEFERIDO",
  "INDEFERIDO",
  "CANCELADO",
];

export const ORDEM_CURSO: StatusCurso[] = [
  "ANALISE",
  "ANDAMENTO",
  "CONCLUIDO",
  "FECHADO",
];

export function quantidade<S extends string>(
  lista: { status: S; quantidade: number }[],
  status: S,
) {
  return lista.find((i) => i.status === status)?.quantidade ?? 0;
}

export function Rosca({
  fatias,
  centro,
}: {
  fatias: { cor: string; valor: number }[];
  centro: number;
}) {
  const tamanho = 170;
  const raio = 71;
  const circ = 2 * Math.PI * raio;
  const soma = fatias.reduce((s, f) => s + f.valor, 0);
  let acumulado = 0;

  return (
    <div className="relative size-[170px] flex-none">
      <svg
        width={tamanho}
        height={tamanho}
        viewBox={`0 0 ${tamanho} ${tamanho}`}
        role="img"
        aria-label="Cursos por situação"
      >
        <g transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}>
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke="var(--trilho)"
            strokeWidth={28}
          />

          {soma > 0 &&
            fatias.map((f, i) => {
              const comprimento = (f.valor / soma) * circ;

              const elemento = (
                <circle
                  key={i}
                  cx={tamanho / 2}
                  cy={tamanho / 2}
                  r={raio}
                  fill="none"
                  stroke={f.cor}
                  strokeWidth={28}
                  strokeDasharray={`${Math.max(comprimento - 2, 0)} ${circ}`}
                  strokeDashoffset={-acumulado}
                />
              );

              acumulado += comprimento;
              return elemento;
            })}
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center leading-[1.1]">
        <span className="font-titulo text-[28px] font-bold">{formatarNumero(centro)}</span>
        <span className="text-xs text-texto-2">cursos</span>
      </div>
    </div>
  );
}

export function InicioAdmin({
  usuario,
}: {
  usuario: UsuarioSessao;
}) {
  const [resumo, setResumo] = useState<ResumoSistema | null>(null); //Guarda
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarResumo() {
      try {
        const dados = await buscarResumoSistema(); //Solicita a API

        if (!ativo) return;

        setResumo(dados); //Recebe e guarda
        setErro(null);
      } catch {
        if (!ativo) return;

        setResumo(null);
        setErro(
          "Não foi possível carregar os dados do sistema. Verifique sua conexão com a API e tente novamente.",
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarResumo();

    return () => {
      ativo = false;
    };
  }, []);

  const totais = resumo //Preenche os cards
    ? [
        { rotulo: "Usuários", valor: resumo.totais.usuarios },
        { rotulo: "Alunos", valor: resumo.totais.alunos },
        { rotulo: "Professores", valor: resumo.totais.professores },
        { rotulo: "Cursos", valor: resumo.totais.cursos },
        { rotulo: "Inscrições", valor: resumo.totais.inscricoes },
        { rotulo: "Instituições", valor: resumo.totais.instituicoes },
        {
          rotulo: "Vagas restantes",
          valor: resumo.totais.vagasRestantes,
          destaque: true,
        },
      ]
    : [];

  const maiorInscricao = resumo
    ? Math.max(
        1,
        ...ORDEM_INSCRICAO.map((s) =>
          quantidade(resumo.inscricoesPorSituacao, s),
        ),
      )
    : 1;

  return (
    <div className="flex flex-col gap-6 px-8 py-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-titulo text-[28px] font-bold leading-[1.2] tracking-[-0.01em]">
            {saudacao()}, {primeiroNome(usuario.nome)}
          </h1>

          <p className="mt-1 text-texto-2">{dataPorExtenso()}</p>
        </div>

        <Link href="/relatorios" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-borda bg-cartao px-4 text-sm font-medium text-texto hover:bg-trilho">
          <Icone nome="bar_chart" tamanho={18} />
          Ver relatórios
        </Link>
      </div>

      {carregando && (
        <p className="text-xs text-texto-3">Carregando resumo…</p>
      )}

      {erro && (
        <p className="text-xs text-texto-3" role="alert">
          {erro}
        </p>
      )}

      {resumo && (
        <>
          <section className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-px overflow-hidden rounded-[10px] border border-borda bg-borda">
            {totais.map((t) => (
              <div key={t.rotulo} className="flex flex-col gap-0.5 bg-cartao px-[18px] pb-4 pt-3.5">
                <span className="text-xs text-texto-2">{t.rotulo}</span>

                <span
                  className={`font-titulo text-[28px] font-bold leading-[1.2] tracking-[-0.02em]${
                    t.destaque ? " text-acento" : ""
                  }`}
                >
                  {formatarNumero(t.valor ?? 0)}
                </span>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 gap-4 min-[961px]:grid-cols-[1.3fr_1fr]">
            <section className="rounded-xl border border-borda bg-cartao px-6 py-[22px]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-titulo text-base font-semibold">
                  Inscrições por situação
                </h2>

                <Link href="/relatorios" className="text-[13px] font-medium text-link underline">
                  Detalhes
                </Link>
              </div>

              <div className="flex flex-col gap-3.5">
                {ORDEM_INSCRICAO.map((status) => {
                  const q = quantidade(
                    resumo.inscricoesPorSituacao ?? [],
                    status,
                  );

                  const info = INSCRICOES[status];

                  return (
                    <div key={status} className="grid grid-cols-[110px_1fr_56px] items-center gap-4">
                      <span
                        className="flex items-center gap-2"
                        style={{ color: info.cor }}
                      >
                        <Icone nome={info.icone} tamanho={18} />
                        {info.rotulo}
                      </span>

                      <div className="h-6 overflow-hidden rounded-[5px] bg-trilho">
                        <div
                          className="h-full rounded-[5px]"
                          style={{
                            width: `${(q / maiorInscricao) * 100}%`,
                            background: info.cor,
                          }}
                        />
                      </div>

                      <span className="text-right font-mono text-[13px] font-medium">
                        {formatarNumero(q)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-borda bg-cartao px-6 py-[22px]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-titulo text-base font-semibold">
                  Cursos por situação
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <Rosca
                  centro={resumo.totais.cursos ?? 0}
                  fatias={ORDEM_CURSO.map((s) => ({
                    cor: ROSCA_CORES[s],
                    valor: quantidade(
                      resumo.cursosPorSituacao ?? [],
                      s,
                    ),
                  }))}
                />

                <div className="flex min-w-[150px] flex-1 flex-col gap-3.5">
                  {ORDEM_CURSO.map((status) => {
                    const info = CURSOS[status];

                    return (
                      <div
                        key={status}
                        className="flex items-center gap-2"
                        style={{ color: info.cor }}
                      >
                        <Icone nome={info.icone} tamanho={18} />

                        <span className="">
                          {info.rotulo}
                        </span>

                        <span
                          className="text-right font-mono text-[13px] font-medium text-texto"
                        >
                          {formatarNumero(
                            quantidade(
                              resumo.cursosPorSituacao ?? [],
                              status,
                            ),
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}