"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Curso, StatusCurso } from "../../types";
import { buscarCursos, buscarUrlCapa } from "../../lib/api";
import { Icone } from "../../components/ui/Icone";
import { STATUS, dataBR, hora } from "./util";
import { AVISO_ERRO, BTN_PRIM, PAGINA, SELO, TOPO, CAPA_FUNDO } from "../../components/ui/estilos";

const FILTRO_SELECT =
  "h-10 rounded-lg border border-borda bg-cartao pl-3 pr-6 text-[13px] text-texto seta-select";

const FILTRO_SELECT_INST =
  "h-10 w-[175px] min-w-[175px] shrink-0 rounded-lg border border-borda bg-cartao pl-3 pr-7 text-[13px] text-texto seta-select";

export function CursosPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState<"" | StatusCurso>("");
  const [inst, setInst] = useState("");
  const [capas, setCapas] = useState<Record<string, string>>({});
  const [capasComErro, setCapasComErro] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let ativo = true;

    async function carregarCursos() {
      try {
        const dados = await buscarCursos();

        if (!ativo) return;

        setCursos(dados);

        // Busca a capa de cada curso.
        const resultados = await Promise.all(
          dados.map(async (curso) => {
            try {
              const url = await buscarUrlCapa(curso.id);

              return [curso.id, url] as const;
            } catch {
              return [curso.id, null] as const;
            }
          })
        );

        if (!ativo) return;

        const mapa: Record<string, string> = {};

        resultados.forEach(([id, url]) => {
          if (url) {
            mapa[id] = url;
          }
        });

        setCapas(mapa);

      } catch (e) {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar os cursos."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarCursos();

    return () => {
      ativo = false;
    };
  }, []);

  const instituicoes = useMemo(() => {
    const m = new Map<string, string>();
    cursos.forEach((c) => m.set(c.Instituicao.id, `${c.Instituicao.nome} · ${c.Instituicao.campus}`));
    return [...m];
  }, [cursos]);

  const filtrados = cursos.filter((c) =>
    c.nome.toLowerCase().includes(termo.toLowerCase()) &&
    (!status || c.status === status) && (!inst || c.Instituicao.id === inst));

  return (
    <div className={PAGINA}>
      <div className={TOPO}>
        <div>
          <h1>Cursos</h1>
          <p>{cursos.length} cursos em {instituicoes.length} instituições</p>
        </div>
        <button className={BTN_PRIM} onClick={() => router.push("/cursos/novo")}>+ Novo curso</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="h-10 min-w-[200px] flex-1 rounded-lg border border-borda bg-cartao px-3 text-[13px] text-texto"
          placeholder="Buscar por nome"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        <select
          className={FILTRO_SELECT}
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusCurso | "")}
        >
          <option value="">Status: Todos</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}
        </select>
        <select
          className={FILTRO_SELECT_INST}
          value={inst}
          onChange={(e) => setInst(e.target.value)}
        >
          <option value="">Instituição: Todas</option>
          {instituicoes.map(([id, nome]) => (
            <option key={id} value={id}>{nome}</option>
          ))}
        </select>
      </div>

      {erro && <div className={AVISO_ERRO}>{erro}</div>}
      {carregando && <p>Carregando cursos…</p>}
      {!carregando && !erro && filtrados.length === 0 && <p>Nenhum curso encontrado.</p>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-[18px]">
        {filtrados.map((c) => {
          const s = STATUS[c.status];
          const lotado = c.vagasDisponiveis <= 0;
          const pct = Math.min(100, (c.vagasOcupadas / c.vagas) * 100);
          return (
            <article
              key={c.id}
              className="flex cursor-pointer flex-col overflow-hidden rounded-[10px] border border-borda bg-cartao"
              onClick={() => router.push(`/cursos/${c.id}`)}
            >
              <div className={`${CAPA_FUNDO} h-[110px] px-3.5 py-2.5`}>
                {capas[c.id] && !capasComErro[c.id] ? (
                  <img
                    className="absolute inset-0 z-0 size-full object-cover"
                    src={capas[c.id]}
                    alt={`Capa do curso ${c.nome}`}
                    onError={() =>
                      setCapasComErro((anterior) => ({
                        ...anterior,
                        [c.id]: true,
                      }))
                    }
                  />
                ) : (
                  <b className="relative z-[1] max-w-[calc(100%-10px)] font-titulo text-lg font-semibold leading-[1.25] text-texto-3 opacity-85 [overflow-wrap:anywhere]">
                    {c.nome}
                  </b>
                )}

                <span className={`${SELO} ${s.classe} absolute bottom-2.5 right-3 z-[2]`}>
                  <Icone nome={s.icone} tamanho={14} />
                  {s.rotulo}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3.5">
                <h3 className="font-titulo text-[15px] font-semibold leading-[1.3]">{c.nome}</h3>
                <small className="text-xs text-texto-2">{c.Instituicao.nome} · {c.Instituicao.campus}</small>
                <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-texto-2 [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[5px]">
                  <span><Icone nome="calendar_month" tamanho={14} />{dataBR(c.dataInicio)} – {dataBR(c.dataFim)}</span>
                  <span><Icone nome="schedule" tamanho={14} />{hora(c.horarioInicio)}–{hora(c.horarioFim)}</span>
                  <span><Icone nome="timer" tamanho={14} />{c.carga_horaria} h</span>
                </div>
                <div className="flex justify-between text-xs text-texto-2">
                  <span>Vagas</span>
                  <code className="font-mono text-texto">{c.vagasOcupadas}/{c.vagas}{lotado ? " · lotado" : ""}</code>
                </div>
                <div className="h-1.5 overflow-hidden rounded-[9px] bg-trilho">
                  <i className={`block h-full ${lotado ? "bg-[#6b6b6b]" : "bg-acento"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
