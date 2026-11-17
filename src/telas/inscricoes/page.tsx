"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InscricaoResumo, StatusInscricao } from "../../types";
import {
  aprovarInscricao,
  buscarDetalhesInscricao,
  cancelarInscricao,
  buscarHistoricoInscricao,
  buscarInscricoes,
  rejeitarInscricao,
  type HistoricoInscricao,
  type InscricaoDetalhe,
} from "../../lib/api";
import { Avatar } from "../../components/ui/Avatar";
import { Icone } from "../../components/ui/Icone";
import { useSessao } from "../../components/layout/SessaoContext";
import { MinhasInscricoesAlunoPage } from "./aluno";

const POR_PAGINA = 8;
const FILTROS: { valor: StatusInscricao | "TODAS"; rotulo: string }[] = [
  { valor: "PENDENTE", rotulo: "Pendentes" },
  { valor: "DEFERIDO", rotulo: "Deferidas" },
  { valor: "INDEFERIDO", rotulo: "Indeferidas" },
  { valor: "CANCELADO", rotulo: "Canceladas" },
  { valor: "TODAS", rotulo: "Todas" },
];

function dataCurta(valor?: string | null) {
  if (!valor) return "—";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleDateString("pt-BR");
}
function dataHora(valor?: string | null) {
  if (!valor) return "Não informada";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Não informada" : data.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function nomeStatus(status: StatusInscricao) {
  return ({ PENDENTE: "Pendente", DEFERIDO: "Deferida", INDEFERIDO: "Indeferida", CANCELADO: "Cancelada" })[status];
}
function classeStatus(status: StatusInscricao) {
  return ({
    PENDENTE: "bg-[#fff3df] text-[#b45309]",
    DEFERIDO: "bg-[#eaf7ef] text-[#187747]",
    INDEFERIDO: "bg-[#fff0ef] text-[#b42318]",
    CANCELADO: "bg-[#f0efec] text-[#66645f]",
  })[status];
}

export function InscricoesPage() {
  const { papel } = useSessao();
  if (papel === "ALUNO") return <MinhasInscricoesAlunoPage />;
  const [inscricoes, setInscricoes] = useState<InscricaoResumo[]>([]);
  const [status, setStatus] = useState<StatusInscricao | "TODAS">("PENDENTE");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<InscricaoDetalhe | null>(null);
  const [historico, setHistorico] = useState<HistoricoInscricao[]>([]);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [acao, setAcao] = useState<"APROVAR" | "REJEITAR" | "CANCELAR" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      // Carrega a coleção completa para que os contadores e as abas reflitam todos os status.
      setInscricoes(await buscarInscricoes());
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar as inscrições.");
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  const contagens = useMemo(() => ({
    PENDENTE: inscricoes.filter((i) => i.status === "PENDENTE").length,
    DEFERIDO: inscricoes.filter((i) => i.status === "DEFERIDO").length,
    INDEFERIDO: inscricoes.filter((i) => i.status === "INDEFERIDO").length,
    CANCELADO: inscricoes.filter((i) => i.status === "CANCELADO").length,
    TODAS: inscricoes.length,
  }), [inscricoes]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return inscricoes.filter((i) => {
      const correspondeStatus = status === "TODAS" || i.status === status;
      const correspondeBusca = !termo || [i.aluno?.usuario?.nome, i.aluno?.usuario?.emailInstitucional, i.curso?.nome]
        .some((v) => (v ?? "").toLocaleLowerCase("pt-BR").includes(termo));
      return correspondeStatus && correspondeBusca;
    });
  }, [inscricoes, status, busca]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  async function abrirDetalhes(item: InscricaoResumo) {
    setCarregandoDetalhes(true);
    setErroAcao(null);
    setMensagem(null);
    setAcao(null);
    try {
      const [detalhe, eventos] = await Promise.all([
        buscarDetalhesInscricao(item.id),
        buscarHistoricoInscricao(item.id),
      ]);
      setSelecionada(detalhe);
      setHistorico(eventos);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível consultar os detalhes.");
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  async function confirmarAcao() {
    if (!selecionada || !acao || processando) return;
    if (acao === "REJEITAR" && motivo.trim().length < 3) {
      setErroAcao("Informe um motivo com pelo menos 3 caracteres.");
      return;
    }
    setProcessando(true);
    setErroAcao(null);
    try {
      if (acao === "APROVAR") await aprovarInscricao(selecionada.id);
      else if (acao === "REJEITAR") await rejeitarInscricao(selecionada.id, motivo.trim());
      else await cancelarInscricao(selecionada.id, motivo.trim() || undefined);
      setMensagem(acao === "APROVAR" ? "Inscrição deferida com sucesso." : acao === "REJEITAR" ? "Inscrição indeferida com sucesso." : "Inscrição cancelada com sucesso.");
      setAcao(null);
      setMotivo("");
      await carregar();
      const [detalhe, eventos] = await Promise.all([
        buscarDetalhesInscricao(selecionada.id),
        buscarHistoricoInscricao(selecionada.id),
      ]);
      setSelecionada(detalhe);
      setHistorico(eventos);
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : "Não foi possível concluir a operação.");
    } finally {
      setProcessando(false);
    }
  }

  const fecharDetalhes = () => {
    if (!processando) {
      setSelecionada(null);
      setAcao(null);
      setMotivo("");
      setErroAcao(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-8 py-7 max-[760px]:px-4 max-[760px]:py-5">
      <header className="flex items-end justify-between gap-4 max-[650px]:flex-col max-[650px]:items-stretch">
        <div>
          <h1 className="font-titulo text-[28px] font-bold leading-tight tracking-[-0.025em]">Inscrições</h1>
          <p className="mt-1 text-sm text-texto-2">Analise, defira ou indefira as inscrições dos alunos.</p>
        </div>
        <button type="button" onClick={() => void carregar()} disabled={carregando}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-borda bg-cartao px-4 text-sm font-medium transition hover:bg-trilho disabled:opacity-60">
          <Icone nome="refresh" tamanho={17} /> Atualizar
        </button>
      </header>

      {mensagem && <div role="status" className="rounded-lg border border-[#b9e4c9] bg-[#eff9f2] px-4 py-3 text-sm text-[#187747]">{mensagem}</div>}
      {erro && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f4c7c4] bg-[#fff4f3] px-4 py-3 text-sm text-[#a32620]">{erro}<button type="button" onClick={() => void carregar()} className="font-semibold underline">Tentar novamente</button></div>}

      <section className="flex flex-wrap items-center justify-between gap-4 border-b border-borda" aria-label="Filtros por situação">
        <div className="flex min-w-0 flex-wrap gap-x-7 gap-y-1">
          {FILTROS.map((f) => {
            const ativo = status === f.valor;
            return <button key={f.valor} type="button" onClick={() => { setStatus(f.valor); setPagina(1); }}
              className={`relative flex h-11 items-center gap-2 whitespace-nowrap text-sm transition ${ativo ? "font-semibold text-texto after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-acento" : "text-texto-2 hover:text-texto"}`}>
              {f.rotulo}<span className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${ativo ? "bg-[#f5e2d6] text-acento" : "bg-trilho text-texto-2"}`}>{contagens[f.valor]}</span>
            </button>;
          })}
        </div>
        <label className="mb-2 flex h-10 min-w-[250px] flex-1 items-center gap-2 rounded-lg border border-borda bg-cartao px-3 text-texto-3 focus-within:border-link max-[650px]:w-full">
          <Icone nome="search" tamanho={18} />
          <input className="w-full min-w-0 bg-transparent text-[13px] text-texto outline-none placeholder:text-texto-3" type="search"
            placeholder="Buscar aluno ou curso" value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
        </label>
      </section>

      <section className="overflow-hidden rounded-xl border border-borda bg-cartao" aria-label="Lista de inscrições">
        {carregando ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-sm text-texto-2"><span className="size-6 animate-spin rounded-full border-2 border-[#e7e3dc] border-t-acento" />Carregando inscrições...</div>
        ) : filtradas.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-3 grid size-12 place-items-center rounded-full bg-trilho text-texto-3"><Icone nome="fact_check" tamanho={25} /></span>
            <strong className="font-titulo text-base font-semibold">Nenhuma inscrição encontrada</strong>
            <p className="mt-1 text-sm text-texto-2">Não há inscrições para os filtros selecionados.</p>
          </div>
        ) : <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-[13px]">
              <thead><tr className="bg-[#f7f6f3] text-[12px] font-medium text-texto-2">
                <th className="px-5 py-3">Aluno</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Curso</th><th className="px-4 py-3">Data ↑</th><th className="px-4 py-3">Status</th><th className="w-10 px-3 py-3" />
              </tr></thead>
              <tbody>{visiveis.map((i) => <tr key={i.id} onClick={() => void abrirDetalhes(i)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void abrirDetalhes(i); } }}
                className="cursor-pointer border-t border-borda transition hover:bg-[#faf8f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-acento">
                <td className="px-5 py-3"><div className="flex min-w-0 items-center gap-2.5"><Avatar nome={i.aluno?.usuario?.nome || "Aluno"} tamanho={30} /><span className="max-w-[180px] truncate font-medium text-texto">{i.aluno?.usuario?.nome || "Nome não informado"}</span></div></td>
                <td className="max-w-[220px] truncate px-4 py-3 text-texto-2">{i.aluno?.usuario?.emailInstitucional || "E-mail não informado"}</td>
                <td className="max-w-[210px] px-4 py-3"><span className="block truncate font-medium">{i.curso?.nome || "Curso não informado"}</span></td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-texto-2">{dataCurta(i.data)}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${classeStatus(i.status)}`}><Icone nome={i.status === "PENDENTE" ? "schedule" : i.status === "DEFERIDO" ? "check_circle" : i.status === "INDEFERIDO" ? "cancel" : "info"} tamanho={13} />{nomeStatus(i.status)}</span></td>
                <td className="px-3 py-3 text-right text-texto-3"><Icone nome="chevron_right" tamanho={19} /></td>
              </tr>)}</tbody>
            </table>
          </div>
          <footer className="flex items-center justify-between gap-3 border-t border-borda px-5 py-3 text-xs text-texto-2">
            <span>Mostrando {Math.min((paginaAtual - 1) * POR_PAGINA + 1, filtradas.length)}–{Math.min(paginaAtual * POR_PAGINA, filtradas.length)} de {filtradas.length} {status === "PENDENTE" ? "pendentes" : "inscrições"}</span>
            <div className="flex items-center gap-3"><button type="button" disabled={paginaAtual <= 1} onClick={() => setPagina((p) => Math.max(1, p - 1))} className="grid size-7 place-items-center rounded-md hover:bg-trilho disabled:opacity-30" aria-label="Página anterior"><Icone nome="chevron_left" tamanho={18} /></button><span className="min-w-12 text-center font-mono">{paginaAtual} / {totalPaginas}</span><button type="button" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} className="grid size-7 place-items-center rounded-md hover:bg-trilho disabled:opacity-30" aria-label="Próxima página"><Icone nome="chevron_right" tamanho={18} /></button></div>
          </footer>
        </>}
      </section>

      {carregandoDetalhes && <div className="fixed inset-0 z-40 grid place-items-center bg-black/35 p-4"><div className="rounded-xl bg-cartao px-6 py-5 text-sm shadow-xl">Carregando detalhes da inscrição...</div></div>}

      {selecionada && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#171615]/45 p-4 sm:p-7" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) fecharDetalhes(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-inscricao" className="my-auto w-full max-w-[980px] rounded-xl border border-borda bg-fundo shadow-2xl">
          <div className="flex items-center justify-between border-b border-borda px-6 py-4">
            <div className="flex min-w-0 items-center gap-3 text-sm"><button type="button" onClick={fecharDetalhes} disabled={processando} className="text-texto-2 hover:text-texto">Inscrições</button><Icone nome="chevron_right" tamanho={16} /><span className="truncate font-medium">{selecionada.aluno?.usuario?.nome || "Detalhes"}</span></div>
            <button type="button" onClick={fecharDetalhes} disabled={processando} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-trilho" aria-label="Fechar detalhes"><Icone nome="close" tamanho={19} /></button>
          </div>
          <div className="p-7 max-[650px]:p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0"><div className="mb-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${classeStatus(selecionada.status)}`}><Icone nome="schedule" tamanho={13} />{nomeStatus(selecionada.status)}</span></div>
                <h2 id="titulo-detalhes-inscricao" className="font-titulo text-[25px] font-bold leading-tight tracking-[-0.02em]">{selecionada.aluno?.usuario?.nome || "Aluno não informado"}</h2>
                <p className="mt-1 text-sm text-texto-2">{selecionada.curso?.nome || "Curso não informado"} · inscrita em {dataCurta(selecionada.data)}</p>
              </div>
              {selecionada.status === "PENDENTE" && <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setAcao("CANCELAR"); setMotivo(""); setErroAcao(null); }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-borda bg-cartao px-3.5 text-sm font-medium hover:bg-trilho"><Icone nome="block" tamanho={16} />Cancelar</button>
                <button type="button" onClick={() => { setAcao("REJEITAR"); setMotivo(""); setErroAcao(null); }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e6aaa5] bg-cartao px-3.5 text-sm font-medium text-[#b42318] hover:bg-[#fff4f3]"><Icone nome="cancel" tamanho={16} />Indeferir</button>
                <button type="button" onClick={() => { setAcao("APROVAR"); setErroAcao(null); }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#b83d0b] px-4 text-sm font-semibold text-white hover:bg-[#9f3308]"><Icone nome="check_circle" tamanho={16} />Deferir</button>
              </div>}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-xl border border-borda bg-cartao p-5"><h3 className="font-titulo text-sm font-semibold">Aluno</h3><dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <div><dt className="text-xs text-texto-3">E-mail</dt><dd className="mt-1 break-all text-[13px] font-medium">{selecionada.aluno?.usuario?.emailInstitucional || "Não informado"}</dd></div>
                <div><dt className="text-xs text-texto-3">Identificador</dt><dd className="mt-1 break-all font-mono text-[12px]">{selecionada.aluno?.usuario?.id || "—"}</dd></div>
                <div><dt className="text-xs text-texto-3">Data da inscrição</dt><dd className="mt-1 text-[13px] font-medium">{dataHora(selecionada.data)}</dd></div>
                <div><dt className="text-xs text-texto-3">ID da inscrição</dt><dd className="mt-1 break-all font-mono text-[12px]">{selecionada.id}</dd></div>
              </dl></section>
              <section className="rounded-xl border border-borda bg-cartao p-5"><h3 className="font-titulo text-sm font-semibold">Curso</h3><dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><dt className="text-xs text-texto-3">Curso</dt><dd className="mt-1 text-[13px] font-medium">{selecionada.curso?.nome || "Não informado"}</dd></div>
                <div><dt className="text-xs text-texto-3">Vagas</dt><dd className="mt-1 text-[13px] font-medium">{selecionada.curso?.vagas ?? "—"}</dd></div>
                <div><dt className="text-xs text-texto-3">Status</dt><dd className="mt-1 text-[13px] font-medium">{nomeStatus(selecionada.status)}</dd></div>
              </dl></section>
              {selecionada.rendaFamiliar && <section className="rounded-xl border border-borda bg-cartao p-5 md:col-span-2"><h3 className="font-titulo text-sm font-semibold">Renda familiar</h3><dl className="mt-3 grid grid-cols-2 gap-4"><div><dt className="text-xs text-texto-3">Renda mensal da família</dt><dd className="mt-1 text-sm font-semibold">{Number(selecionada.rendaFamiliar.rendaFamiliar).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt className="text-xs text-texto-3">Pessoas na casa</dt><dd className="mt-1 text-sm font-semibold">{selecionada.rendaFamiliar.numeroPessoas}</dd></div></dl></section>}
            </div>

            <section className="mt-4 rounded-xl border border-borda bg-cartao p-5"><h3 className="font-titulo text-sm font-semibold">Histórico da inscrição</h3>
              {historico.length === 0 ? <p className="mt-3 text-sm text-texto-2">Nenhuma alteração registrada.</p> : <ol className="mt-4 space-y-4">{historico.map((h, n) => <li key={h.id || `${h.dataModificacao}-${n}`} className="relative border-l-2 border-[#e9d4c8] pl-4"><span className="absolute -left-[5px] top-1 size-2 rounded-full bg-acento" /><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-[13px]">{h.alteracao} · {h.statusAnterior} → {h.statusAtual}</strong><span className="font-mono text-[11px] text-texto-3">{dataHora(h.dataModificacao)}</span></div><p className="mt-1 text-[13px] text-texto-2">{h.descricao}</p>{h.usuario?.nome && <p className="mt-1 text-xs text-texto-3">Por {h.usuario.nome}</p>}</li>)}</ol>}
            </section>
          </div>
        </section>
      </div>}

      {acao && selecionada && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !processando) setAcao(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao" className="w-full max-w-[500px] overflow-hidden rounded-xl border border-borda bg-cartao shadow-2xl">
          <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5"><div><h3 id="titulo-confirmacao" className="font-titulo text-lg font-semibold">{acao === "APROVAR" ? "Deferir inscrição" : acao === "REJEITAR" ? "Indeferir inscrição" : "Cancelar inscrição"}</h3><p className="mt-2 text-sm leading-relaxed text-texto-2">A inscrição de <strong className="text-texto">{selecionada.aluno?.usuario?.nome || "Aluno"}</strong> em <strong className="text-texto">{selecionada.curso?.nome || "este curso"}</strong> {acao === "APROVAR" ? "passará para “Deferida”." : acao === "REJEITAR" ? "passará para “Indeferida”. O motivo ficará registrado no histórico." : "será cancelada. Esta alteração ficará registrada no histórico."}</p></div><button type="button" onClick={() => setAcao(null)} disabled={processando} className="grid size-7 shrink-0 place-items-center rounded-md text-texto-3 hover:bg-trilho" aria-label="Fechar"><Icone nome="close" tamanho={18} /></button></div>
          <div className="px-6 pb-5">
            {acao === "APROVAR" ? (selecionada.curso?.vagas <= 0 ? <div className="flex items-center gap-2 rounded-lg border border-[#f4c7c4] bg-[#fff4f3] px-3.5 py-3 text-[13px] text-[#a32620]"><Icone nome="error" tamanho={17} />Não há vagas disponíveis neste curso.</div> : <div className="flex items-center gap-2 rounded-lg border border-[#b9e4c9] bg-[#eff9f2] px-3.5 py-3 text-[13px] text-[#187747]"><Icone nome="check_circle" tamanho={17} />Confirme para registrar o deferimento desta inscrição.</div>) : <label className="block"><span className="mb-2 block text-sm font-medium">Motivo (opcional)</span><textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={255} rows={4} placeholder={acao === "REJEITAR" ? "Descreva o motivo do indeferimento" : "Descreva o motivo do cancelamento"} className="w-full resize-y rounded-lg border border-borda bg-fundo px-3 py-2.5 text-sm outline-none focus:border-link" /><span className="mt-1 flex justify-between text-[11px] text-texto-3"><span>Entre 3 e 255 caracteres, se informado</span><span className="font-mono">{motivo.length} / 255</span></span></label>}
            {erroAcao && <p role="alert" className="mt-3 rounded-lg border border-[#f4c7c4] bg-[#fff4f3] px-3 py-2 text-sm text-[#a32620]">{erroAcao}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-borda px-6 py-4"><button type="button" disabled={processando} onClick={() => { setAcao(null); setMotivo(""); setErroAcao(null); }} className="h-10 rounded-lg border border-borda bg-cartao px-4 text-sm font-medium hover:bg-trilho">Voltar</button><button type="button" disabled={processando || (acao === "APROVAR" && selecionada.curso?.vagas <= 0) || (acao === "REJEITAR" && motivo.trim().length > 0 && motivo.trim().length < 3) || (acao === "CANCELAR" && motivo.trim().length > 0 && motivo.trim().length < 3)} onClick={() => void confirmarAcao()} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50 ${acao === "APROVAR" ? "bg-[#b83d0b] hover:bg-[#9f3308]" : "bg-[#b42318] hover:bg-[#941d14]"}`}>{processando ? "Processando..." : <><Icone nome={acao === "APROVAR" ? "check_circle" : acao === "REJEITAR" ? "cancel" : "block"} tamanho={16} />{acao === "APROVAR" ? "Deferir inscrição" : acao === "REJEITAR" ? "Indeferir inscrição" : "Cancelar inscrição"}</>}</button></div>
        </section>
      </div>}
    </main>
  );
}
