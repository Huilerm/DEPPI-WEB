"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Curso, StatusCurso } from "../../types";
import { useSessao } from "../../components/layout/SessaoContext";
import {
  buscarCurso,
  buscarUrlCapa,
  enviarCapa,
  excluirCurso,
  atualizarCurso,
  criarInscricao,
  buscarMinhasInscricoes,
} from "../../lib/api";
import { Icone } from "../../components/ui/Icone";
import { STATUS, dataBR, hora } from "./util";
import {
  AVISO_ERRO, BTN, BTN_PRIM, BTN_PERIGO, BTN_PERIGO_O, CAMPO_SELECT, CAPA_FUNDO, LAYOUT2, PAINEL, PAGINA, SELO, TITULO_CURSO,
} from "../../components/ui/estilos";

export function CursoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { papel } = useSessao();
  const ehAluno = papel === "ALUNO";
  const [inscrevendo, setInscrevendo] = useState(false);
  const [mensagemInscricao, setMensagemInscricao] = useState<string | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [capaUrl, setCapaUrl] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [modalInscricao, setModalInscricao] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const arq = useRef<HTMLInputElement>(null);
  const [capaFalhou, setCapaFalhou] = useState(false);
  const [jaInscrito, setJaInscrito] = useState(false);
  const [verificandoInscricao, setVerificandoInscricao] = useState(true);
  const [falhaVerificacaoInscricao, setFalhaVerificacaoInscricao] = useState(false);

  const carregarCapa = () => {
    setCapaFalhou(false);
    return buscarUrlCapa(id).then(setCapaUrl).catch(() => setCapaUrl(null));
  };

  useEffect(() => {
    buscarCurso(id).then(setCurso).catch((e: Error) => setErro(e.message));
    void carregarCapa();
  }, [id]);
  useEffect(() => {
  if (!ehAluno) return;

  let ativo = true;

  async function verificarInscricao() {
    setVerificandoInscricao(true);
    setFalhaVerificacaoInscricao(false);

    try {
      const inscricoes = await buscarMinhasInscricoes();

      if (ativo) {
        const inscrito = inscricoes.some(
          (inscricao) => String(inscricao.curso.id) === String(id)
        );

        setJaInscrito(inscrito);
      }
    } catch {
      if (ativo) {
        setFalhaVerificacaoInscricao(true);
        setErro("Não foi possível verificar sua inscrição. Atualize a página e tente novamente.");
      }
    } finally {
      if (ativo) setVerificandoInscricao(false);
    }
  }

  void verificarInscricao();

  return () => {
    ativo = false;
  };
}, [id, ehAluno]);
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

  async function inscrever() {
  if (!curso || inscrevendo || jaInscrito) return;

  setInscrevendo(true);
  setErro(null);
  setMensagemInscricao(null);

  try {
    console.log("Enviando inscrição para o curso:", curso.id);

    const resposta = await criarInscricao(curso.id);

    console.log("Resposta da API:", resposta);

    setJaInscrito(true);
    setModalInscricao(false);

    setMensagemInscricao("Inscrição realizada com sucesso!");
  } catch (e) {
    console.error("Erro ao realizar inscrição:", e);

    setErro(
      e instanceof Error
        ? e.message
        : "Erro ao realizar inscrição. Tente novamente."
    );
  } finally {
    setInscrevendo(false);
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
      {mensagemInscricao && <div className="rounded-lg border border-[#a7dfbd] bg-[#effaf3] px-4 py-3 text-sm text-[#176b3a]">{mensagemInscricao}</div>}
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
        {!ehAluno && <button className={`${BTN} absolute bottom-4 right-4 z-[2]`} onClick={() => arq.current?.click()}>
          <Icone nome="add_photo_alternate" /> Enviar capa
        </button>}
        {!ehAluno && <input ref={arq} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => trocarCapa(e.target.files?.[0])} />}
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

        {ehAluno ? (
          <div className={`${PAINEL} flex flex-col gap-3`}>
            <h2 className="font-titulo text-[15px] font-semibold">Inscrição no curso</h2>
            <p className="text-sm text-texto-2">Faça sua inscrição para participar deste curso. A solicitação ficará pendente até a análise do DEPPI.</p>
            <p className="text-sm">{curso.vagasDisponiveis > 0 ? `${curso.vagasDisponiveis} vaga(s) disponível(is)` : "Não há vagas disponíveis"}</p>
            <button
  className={BTN_PRIM}
  disabled={
    verificandoInscricao ||
    falhaVerificacaoInscricao ||
    jaInscrito ||
    inscrevendo ||
    curso.vagasDisponiveis <= 0 ||
    curso.status !== "ANDAMENTO"
  }
  onClick={() => setModalInscricao(true)}
>
  <Icone nome={jaInscrito ? "check_circle" : "person_add"} />

  {verificandoInscricao
    ? "Verificando inscrição..."
    : falhaVerificacaoInscricao
      ? "Não foi possível verificar"
      : jaInscrito
        ? "Você já está inscrito"
        : "Inscrever-se"}
</button>
          </div>
        ) : <div className={`${PAINEL} flex flex-col gap-2.5`}>
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
        </div>}
      </div>

      {modalInscricao && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4"
          role="presentation"
          onClick={() => !inscrevendo && setModalInscricao(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmar-inscricao"
            className="w-[min(504px,100%)] overflow-hidden rounded-[14px] border border-borda bg-cartao shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-5">
              <div>
                <h2 id="titulo-confirmar-inscricao" className="font-titulo text-lg font-semibold">Confirmar inscrição</h2>
                <p className="mt-2 text-sm leading-relaxed text-texto-2">Você vai se inscrever em <strong className="font-semibold text-texto">{curso.nome}</strong>. Depois, informe a renda familiar e envie seus documentos.</p>
              </div>
              <button type="button" aria-label="Fechar" disabled={inscrevendo} onClick={() => setModalInscricao(false)} className="grid size-8 shrink-0 place-items-center rounded-md text-texto-3 hover:bg-trilho"><Icone nome="close" /></button>
            </div>
            <div className="grid grid-cols-2 gap-5 border-b border-t border-borda px-6 py-4 max-[430px]:grid-cols-1 max-[430px]:gap-3">
              <div>
                <span className="block text-xs text-texto-2">Período</span>
                <strong className="mt-1 block font-mono text-[13px] font-medium">{dataBR(curso.dataInicio)} a {dataBR(curso.dataFim)}</strong>
              </div>
              <div>
                <span className="block text-xs text-texto-2">Horário</span>
                <strong className="mt-1 block font-mono text-[13px] font-medium">{hora(curso.horarioInicio)} às {hora(curso.horarioFim)}</strong>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2.5 px-6 py-4">
              <button type="button" className={BTN} disabled={inscrevendo} onClick={() => setModalInscricao(false)}>Voltar</button>
              <button type="button" className={BTN_PRIM} disabled={inscrevendo} onClick={async () => { await inscrever(); }}>
                <Icone nome="person_add" /> {inscrevendo ? "Enviando inscrição…" : "Confirmar inscrição"}
              </button>
            </div>
          </section>
        </div>
      )}

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
