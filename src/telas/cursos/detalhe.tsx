"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Curso, StatusCurso } from "../../types";
import {
  buscarCurso,
  buscarUrlCapa,
  enviarCapa,
  excluirCurso,
  atualizarCurso,
} from "../../lib/api";
import { Icone } from "../../components/ui/Icone";
import { STATUS, dataBR, hora } from "./util";
import {
  AVISO_ERRO, BTN, BTN_PERIGO, BTN_PERIGO_O, CAMPO_SELECT, CAPA_FUNDO, LAYOUT2, PAINEL, PAGINA, SELO, TITULO_CURSO,
} from "../../components/ui/estilos";

export function CursoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [capaUrl, setCapaUrl] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const arq = useRef<HTMLInputElement>(null);
  const [capaFalhou, setCapaFalhou] = useState(false);

  const carregarCapa = () => {
    setCapaFalhou(false);
    return buscarUrlCapa(id).then(setCapaUrl).catch(() => setCapaUrl(null));
  };

  useEffect(() => {
    buscarCurso(id).then(setCurso).catch((e: Error) => setErro(e.message));
    void carregarCapa();
  }, [id]);

  async function trocarCapa(a?: File) {
    if (!a) return;
    try { await enviarCapa(id, a); await carregarCapa(); }
    catch (e) { setErro(e instanceof Error ? e.message : "Falha ao enviar a capa."); }
  }

async function alterarStatus(novoStatus: StatusCurso) {
  if (!curso || salvandoStatus) return;

  if (novoStatus === curso.status) return;

  const cursoAnterior = curso;

  setCurso({
    ...curso,
    status: novoStatus,
  });

  setSalvandoStatus(true);
  setErro(null);

  try {
    const atualizado = await atualizarCurso(id, {
      status: novoStatus,
    });

    // Atualiza os dados sem perder as informações complementares.
    setCurso((anterior) => {
      if (!anterior) return atualizado;

      return {
        ...anterior,
        ...atualizado,

        Instituicao: atualizado.Instituicao ?? anterior.Instituicao,
        vagasDisponiveis:
          atualizado.vagasDisponiveis ?? anterior.vagasDisponiveis,
        vagasOcupadas:
          atualizado.vagasOcupadas ?? anterior.vagasOcupadas,
      };
    });

  } catch (e) {
    setCurso(cursoAnterior);

    setErro(
      e instanceof Error
        ? e.message
        : "Não foi possível atualizar o status do curso."
    );
  } finally {
    setSalvandoStatus(false);
  }
}

  async function excluir() {
    setExcluindo(true);
    setErroExcluir(null);
    try { await excluirCurso(id); router.push("/cursos"); }
    catch (e) {
      const m = e instanceof Error ? e.message : "";
      setErroExcluir(m.includes("inscrições")
        ? "Não foi possível excluir: este curso tem inscrições vinculadas." : m || "Não foi possível excluir.");
      setExcluindo(false);
    }
  }

  if (erro && !curso) return <div className={PAGINA}><div className={AVISO_ERRO}>{erro}</div></div>;
  if (!curso) return <div className={PAGINA}><p>Carregando…</p></div>;

  const s = STATUS[curso.status];
  const inst = `${curso.Instituicao.nome} · ${curso.Instituicao.campus} — ${curso.Instituicao.cidade}`;
  const itens: [string, string, string][] = [
    ["calendar_month", "Período", `${dataBR(curso.dataInicio)} a ${dataBR(curso.dataFim)}`],
    ["schedule", "Horário", `${hora(curso.horarioInicio)} às ${hora(curso.horarioFim)}`],
    ["timer", "Carga horária", `${curso.carga_horaria} horas`],
    ["location_on", "Instituição", inst],
    ["group", "Vagas", `${curso.vagas} no total · ${curso.vagasDisponiveis} disponíveis`],
    ["fact_check", "Inscrições", `${curso.vagasOcupadas} recebidas`],
  ];

  return (
    <div className={PAGINA}>
      {erro && <div className={AVISO_ERRO}>{erro}</div>}
      <div className={`${CAPA_FUNDO} h-[180px] rounded-xl border border-borda px-3.5 py-2.5`}>
        {capaUrl && !capaFalhou ? (
          <img
            className="absolute inset-0 z-0 size-full object-cover"
            src={capaUrl}
            alt={`Capa do curso ${curso.nome}`}
            onError={() => setCapaFalhou(true)}
          />
        ) : (
          <b className="relative z-[1] max-w-[75%] font-titulo text-[clamp(24px,3vw,40px)] font-bold leading-[1.15] text-texto-3 opacity-75 [overflow-wrap:anywhere]">
            {curso.nome}
          </b>
        )}
        <button className={`${BTN} absolute bottom-4 right-4 z-[2]`} onClick={() => arq.current?.click()}>
          <Icone nome="add_photo_alternate" /> Enviar capa
        </button>
        <input ref={arq} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => trocarCapa(e.target.files?.[0])} />
      </div>

      <div className={LAYOUT2}>
        <div className="flex flex-col gap-3.5">
          <span className={`${SELO} ${s.classe} self-start`}><Icone nome={s.icone} tamanho={14} />{s.rotulo}</span>
          <h1 className={TITULO_CURSO}>{curso.nome}</h1>
          <p className="text-texto-2">{inst}</p>
          <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-borda bg-cartao [&>div:nth-child(odd)]:border-r [&>div:nth-child(odd)]:border-borda [&>div:nth-last-child(-n+2)]:border-b-0 [&>div]:border-b [&>div]:border-borda [&>div]:px-4 [&>div]:py-3.5">
            {itens.map(([ic, rot, val]) => (
              <div key={rot}>
                <small className="flex items-center gap-1.5 text-xs text-texto-2">
                  <Icone nome={ic} tamanho={16} className="text-acento" />{rot}
                </small>
                <strong className="mt-[3px] block font-semibold">{val}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className={`${PAINEL} flex flex-col gap-2.5`}>
          <h2 className="font-titulo text-[15px] font-semibold">Gerenciar curso</h2>
          <label className="text-[13px]">Status</label>

          <select
            className={CAMPO_SELECT}
            value={curso.status}
            disabled={salvandoStatus}
            onChange={(e) => alterarStatus(e.target.value as StatusCurso)}
          >
            {Object.entries(STATUS).map(([valor, info]) => (
              <option key={valor} value={valor}>
                {info.rotulo}
              </option>
            ))}
          </select>

          <small className="text-texto-2">
            {salvandoStatus
              ? "Salvando alteração..."
              : "Selecione um novo status para o curso."}
          </small>
          <button className={BTN} onClick={() => router.push(`/cursos/${id}/editar`)}><Icone nome="edit" /> Editar curso</button>
          <button className={BTN_PERIGO_O} onClick={() => { setErroExcluir(null); setModal(true); }}><Icone nome="delete" /> Excluir curso</button>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onClick={() => setModal(false)}>
          <div
            className="flex w-[min(480px,100%)] flex-col gap-3.5 rounded-[14px] bg-cartao p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-titulo text-lg font-semibold">Excluir curso</h2>
            <p><b>{curso.nome}</b> será excluído permanentemente.</p>
            {erroExcluir && <div className={AVISO_ERRO}>{erroExcluir}</div>}
            <div className="flex justify-end gap-2.5">
              <button className={BTN} onClick={() => setModal(false)}>Voltar</button>
              <button className={BTN_PERIGO} disabled={excluindo} onClick={excluir}>
                <Icone nome="delete" /> {excluindo ? "Excluindo…" : "Excluir curso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
