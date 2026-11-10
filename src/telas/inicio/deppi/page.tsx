"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Curso, InscricaoResumo, UsuarioSessao } from "../../../types";
import { buscarCursos, buscarInscricoesPendentes, contarProfessores } from "../..//../lib/api";
import { dataPorExtenso, formatarNumero, primeiroNome, saudacao } from "../../../lib/formatadores";
import { Avatar } from "../../../components/ui/Avatar";
import { Icone } from "../../../components/ui/Icone";

function haQuantoTempo(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "hoje";
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

export function InicioDeppi({ usuario }: { usuario: UsuarioSessao }) {
  const [pendentes, setPendentes] = useState<InscricaoResumo[]>([]);
  const [cursosAnalise, setCursosAnalise] = useState<Curso[]>([]);
  const [professores, setProfessores] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([buscarInscricoesPendentes(), buscarCursos(), contarProfessores()])
      .then(([insc, cursos, profs]) => {
        if (!ativo) return;
        setPendentes(insc);
        setCursosAnalise(cursos.filter((c) => c.status === "ANALISE"));
        setProfessores(profs);
      })
      .catch(() => ativo && setErro("Não foi possível carregar os dados. Tente novamente."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const maisAntigas = [...pendentes]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 px-8 py-7">
      <div>
        <h1 className="font-titulo text-[28px] font-bold leading-[1.2] tracking-[-0.01em]">
          {saudacao()}, {primeiroNome(usuario.nome)}
        </h1>
        <p className="mt-1 text-texto-2">{dataPorExtenso()}</p>
      </div>

      {carregando && <p className="text-xs text-texto-3">Carregando…</p>}
      {erro && <p className="text-xs text-texto-3" role="alert">{erro}</p>}

      {!carregando && !erro && (
        <>
          <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
            <div className="flex flex-col justify-between gap-3 rounded-xl bg-acento px-[22px] py-5 text-white sm:col-span-2 lg:col-span-1">
              <span className="flex items-center gap-2 font-medium">
                <Icone nome="schedule" tamanho={18} /> Inscrições pendentes
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="font-titulo text-[56px] font-bold leading-none">{formatarNumero(pendentes.length)}</span>
                <Link href="/inscricoes?status=PENDENTE" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 font-semibold text-acento">
                  Analisar agora <Icone nome="arrow_forward" tamanho={16} />
                </Link>
              </div>
            </div>

            <Link href="/cursos?status=ANALISE" className="flex flex-col gap-1 rounded-xl border border-borda bg-cartao px-5 py-[18px] hover:bg-trilho">
              <span className="mb-3.5 grid size-[34px] place-items-center rounded-lg bg-trilho text-link"><Icone nome="school" /></span>
              <strong>Cursos em análise</strong>
              <span>{cursosAnalise.length} aguardando revisão</span>
            </Link>

            <Link href="/inscricoes" className="flex flex-col gap-1 rounded-xl border border-borda bg-cartao px-5 py-[18px] hover:bg-trilho">
              <span className="mb-3.5 grid size-[34px] place-items-center rounded-lg bg-trilho text-link"><Icone nome="fact_check" /></span>
              <strong>Todas as inscrições</strong>
              <span>Filtrar por status</span>
            </Link>

            <Link href="/professores" className="flex flex-col gap-1 rounded-xl border border-borda bg-cartao px-5 py-[18px] hover:bg-trilho">
              <span className="mb-3.5 grid size-[34px] place-items-center rounded-lg bg-trilho text-link"><Icone nome="badge" /></span>
              <strong>Professores</strong>
              <span>{formatarNumero(professores)} cadastrados</span>
            </Link>
          </section>

          <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[1.15fr_1fr]">
            <section className="overflow-hidden rounded-xl border border-borda bg-cartao">
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="font-titulo text-base font-semibold">Pendentes mais antigas</h2>
                <Link href="/inscricoes?status=PENDENTE" className="text-[13px] font-medium text-link underline">Ver todas</Link>
              </div>
              {maisAntigas.length === 0 && (
                <p className="px-6 pb-4 text-xs text-texto-3">
                  Nenhuma inscrição pendente.
                </p>
              )}              {maisAntigas.map((i) => (
                <div key={i.id} className="flex items-center gap-3 border-t border-borda px-6 py-3">
                  <Avatar nome={i.aluno.usuario.nome} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <strong>{i.aluno.usuario.nome}</strong>
                    <span>{i.curso.nome}</span>
                  </div>
                  <span className="font-mono text-xs text-texto-2">{haQuantoTempo(i.data)}</span>
                </div>
              ))}
            </section>

            <section className="overflow-hidden rounded-xl border border-borda bg-cartao">
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="font-titulo text-base font-semibold">Cursos em análise</h2>
                <Link href="/cursos?status=ANALISE" className="text-[13px] font-medium text-link underline">Ver cursos</Link>
              </div>
              {cursosAnalise.length === 0 && (
                <p className="px-6 pb-4 text-xs text-texto-3">
                  Nenhum curso em análise.
                </p>
              )}              {cursosAnalise.slice(0, 4).map((c) => (
                <Link key={c.id} href={`/cursos/${c.id}`} className="flex items-center gap-3 border-t border-borda px-6 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <strong>{c.nome}</strong>
                    <span>
                      {c.Instituicao.campus} · {c.carga_horaria} h
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3e2] px-2.5 py-1 text-xs font-medium text-[#b45309] dark:bg-amber-900/30 dark:text-amber-400">
                    <Icone nome="hourglass_top" tamanho={14} /> Em análise
                  </span>
                </Link>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
}