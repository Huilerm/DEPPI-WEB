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
import "./inicio-admin.css";

const INSCRICOES: Record<
  StatusInscricao,
  { rotulo: string; icone: string; cor: string }
> = {
  PENDENTE: { rotulo: "Pendente", icone: "schedule", cor: "#b45309" },
  DEFERIDO: { rotulo: "Deferida", icone: "check_circle", cor: "#15803d" },
  INDEFERIDO: { rotulo: "Indeferida", icone: "cancel", cor: "#c0392b" },
  CANCELADO: { rotulo: "Cancelada", icone: "block", cor: "#737373" },
};

const CURSOS: Record<
  StatusCurso,
  { rotulo: string; icone: string; cor: string }
> = {
  ANALISE: { rotulo: "Em análise", icone: "hourglass_top", cor: "#b45309" },
  ANDAMENTO: { rotulo: "Em andamento", icone: "play_circle", cor: "#15803d" },
  CONCLUIDO: { rotulo: "Concluído", icone: "check_circle", cor: "#1d4ed8" },
  FECHADO: { rotulo: "Fechado", icone: "lock", cor: "#6b6b6b" },
};

const ROSCA_CORES: Record<StatusCurso, string> = {
  ANALISE: "#b45309",
  ANDAMENTO: "#15803d",
  CONCLUIDO: "#1d4ed8",
  FECHADO: "#9ca3af",
};

const ORDEM_INSCRICAO: StatusInscricao[] = [
  "PENDENTE",
  "DEFERIDO",
  "INDEFERIDO",
  "CANCELADO",
];

const ORDEM_CURSO: StatusCurso[] = [
  "ANALISE",
  "ANDAMENTO",
  "CONCLUIDO",
  "FECHADO",
];

function quantidade<S extends string>(
  lista: { status: S; quantidade: number }[],
  status: S,
) {
  return lista.find((i) => i.status === status)?.quantidade ?? 0;
}

function Rosca({
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
    <div className="rosca">
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

      <div className="rosca__centro">
        <span className="rosca__total">{formatarNumero(centro)}</span>
        <span className="rosca__sub">cursos</span>
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
    <div className="pagina">
      <div className="saudacao">
        <div>
          <h1 className="saudacao__titulo">
            {saudacao()}, {primeiroNome(usuario.nome)}
          </h1>

          <p className="saudacao__data">{dataPorExtenso()}</p>
        </div>

        <Link href="/relatorios" className="botao-secundario">
          <Icone nome="bar_chart" tamanho={18} />
          Ver relatórios
        </Link>
      </div>

      {carregando && (
        <p className="aviso-exemplo">Carregando resumo…</p>
      )}

      {erro && (
        <p className="aviso-exemplo" role="alert">
          {erro}
        </p>
      )}

      {resumo && (
        <>
          <section className="resumo">
            {totais.map((t) => (
              <div key={t.rotulo} className="resumo__item">
                <span className="resumo__rotulo">{t.rotulo}</span>

                <span
                  className={`resumo__valor${
                    t.destaque ? " resumo__valor--destaque" : ""
                  }`}
                >
                  {formatarNumero(t.valor ?? 0)}
                </span>
              </div>
            ))}
          </section>

          <div className="graficos">
            <section className="cartao">
              <div className="cartao__cabecalho">
                <h2 className="cartao__titulo">
                  Inscrições por situação
                </h2>

                <Link href="/relatorios" className="cartao__link">
                  Detalhes
                </Link>
              </div>

              <div className="barras">
                {ORDEM_INSCRICAO.map((status) => {
                  const q = quantidade(
                    resumo.inscricoesPorSituacao ?? [],
                    status,
                  );

                  const info = INSCRICOES[status];

                  return (
                    <div key={status} className="barra">
                      <span
                        className="barra__rotulo"
                        style={{ color: info.cor }}
                      >
                        <Icone nome={info.icone} />
                        {info.rotulo}
                      </span>

                      <div className="barra__trilho">
                        <div
                          className="barra__preenchimento"
                          style={{
                            width: `${(q / maiorInscricao) * 100}%`,
                            background: info.cor,
                          }}
                        />
                      </div>

                      <span className="numero">
                        {formatarNumero(q)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="cartao">
              <div className="cartao__cabecalho">
                <h2 className="cartao__titulo">
                  Cursos por situação
                </h2>
              </div>

              <div className="rosca-bloco">
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

                <div className="legenda">
                  {ORDEM_CURSO.map((status) => {
                    const info = CURSOS[status];

                    return (
                      <div
                        key={status}
                        className="legenda__linha"
                        style={{ color: info.cor }}
                      >
                        <Icone nome={info.icone} />

                        <span className="legenda__rotulo">
                          {info.rotulo}
                        </span>

                        <span
                          className="numero"
                          style={{ color: "var(--texto)" }}
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