"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icone } from "../../components/ui/Icone";
import { useSessao } from "../../components/layout/SessaoContext";
import { buscarMinhasInscricoes } from "../../services/inscricoesService";
import type { MinhaInscricao, StatusInscricao } from "../../types";

type Filtro = "TODAS" | StatusInscricao;
const STATUS: Record<StatusInscricao, { rotulo: string; classe: string; icone: string }> = {
  PENDENTE: { rotulo: "Pendente", classe: "bg-[#fff3df] text-[#a45b08]", icone: "schedule" },
  DEFERIDO: { rotulo: "Deferida", classe: "bg-[#eaf7ef] text-[#187747]", icone: "check_circle" },
  INDEFERIDO: { rotulo: "Indeferida", classe: "bg-[#fff0ef] text-[#b42318]", icone: "cancel" },
  CANCELADO: { rotulo: "Cancelada", classe: "bg-trilho text-texto-2", icone: "remove_circle" },
};

function dataBR(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleDateString("pt-BR");
}

type ItemTela = {
  id: string;
  curso: string;
  instituicao: string;
  data: string;
  situacao: StatusInscricao;
  documentos: number;
};

export function MinhasInscricoesAlunoPage() {
  const router = useRouter();
  const { usuario } = useSessao();
  const [dados, setDados] = useState<MinhaInscricao[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODAS");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await buscarMinhasInscricoes());
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar suas inscrições.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const todos: ItemTela[] = useMemo(() => dados.map((item) => ({
    id: item.id,
    curso: item.curso?.nome ?? "Curso não informado",
    instituicao: [item.curso?.Instituicao?.nome, item.curso?.Instituicao?.campus].filter(Boolean).join(" · ") || "Instituição não informada",
    data: dataBR(item.data),
    situacao: item.status,
    documentos: item.documentos?.length ?? 0,
  })), [dados]);

  const itens = useMemo(() => todos.filter((item) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const correspondeTexto = !termo || `${item.curso} ${item.instituicao}`.toLocaleLowerCase("pt-BR").includes(termo);
    return correspondeTexto && (filtro === "TODAS" || item.situacao === filtro);
  }), [todos, busca, filtro]);

  function abrirInscricao(id: string) {
    router.push(`/inscricoes/${encodeURIComponent(id)}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-8 py-7 max-[760px]:px-4 max-[760px]:py-5">
      <header>
        <h1 className="font-titulo text-[28px] font-bold leading-tight tracking-[-0.025em]">Minhas inscrições</h1>
        <p className="mt-1 text-sm text-texto-2">Acompanhe suas inscrições e consulte os documentos enviados.</p>
      </header>

      {erro && <div role="alert" className="flex flex-wrap items-center gap-2.5 rounded-lg border border-[#f1b8b5] bg-[#fff0ef] px-3.5 py-3 text-[13px] leading-relaxed text-[#b42318]"><Icone nome="warning" tamanho={18} /><span className="flex-1">{erro}</span><button type="button" className="underline" onClick={() => void carregar()}>Tentar novamente</button></div>}

      <section className="overflow-hidden rounded-xl border border-borda bg-cartao">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borda px-4 py-3.5">
          <div className="flex flex-wrap gap-2" aria-label="Filtrar inscrições">
            {(["TODAS", "PENDENTE", "DEFERIDO", "INDEFERIDO", "CANCELADO"] as const).map((valor) => {
              const ativo = filtro === valor;
              const rotulo = valor === "TODAS" ? "Todas" : STATUS[valor].rotulo;
              return <button key={valor} type="button" onClick={() => setFiltro(valor)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${ativo ? "bg-acento text-white" : "bg-trilho text-texto-2 hover:text-texto"}`}>{rotulo}</button>;
            })}
          </div>
          <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-borda bg-fundo px-3 text-texto-3 sm:max-w-[300px]">
            <Icone nome="search" tamanho={17} />
            <input aria-label="Buscar curso ou instituição" className="w-full min-w-0 bg-transparent text-[13px] text-texto outline-none placeholder:text-texto-3" placeholder="Buscar curso ou instituição" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
        </div>

        {carregando ? <div className="flex min-h-[230px] items-center justify-center gap-2 text-sm text-texto-2"><Icone nome="progress_activity" className="animate-spin" /> Carregando suas inscrições…</div> : itens.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-3 grid size-12 place-items-center rounded-full bg-trilho text-texto-3"><Icone nome="assignment" tamanho={24} /></span>
            <strong className="font-titulo text-base font-semibold">{dados.length === 0 ? "Você ainda não possui inscrições" : "Nenhuma inscrição encontrada"}</strong>
            <p className="mt-1 text-sm text-texto-2">{dados.length === 0 ? "Quando você se inscrever em um curso, ele aparecerá aqui." : "Tente alterar os filtros ou a busca."}</p>
          </div>
        ) : <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
              <thead className="bg-[#f5f4f1] text-xs font-medium text-texto-2 dark:bg-[#292825]"><tr>{["Curso", "Instituição", "Inscrita em", "Situação", "Documentos", ""].map((t, i) => <th key={i} className="px-4 py-3 font-medium">{t}</th>)}</tr></thead>
              <tbody>{itens.map((item) => { const status = STATUS[item.situacao]; return <tr key={item.id} className="border-t border-borda hover:bg-fundo/70">
                <td className="px-4 py-4 font-medium text-texto">{item.curso}</td><td className="px-4 py-4 text-texto-2">{item.instituicao}</td><td className="px-4 py-4 font-mono text-[12px]">{item.data}</td>
                <td className="px-4 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.classe}`}><Icone nome={status.icone} tamanho={13} />{status.rotulo}</span></td>
                <td className="px-4 py-4 font-mono text-[12px]">{item.documentos} enviado(s)</td><td className="px-4 py-4 text-right"><button type="button" aria-label={`Ver detalhes de ${item.curso}`} onClick={() => abrirInscricao(item.id)} className="grid size-8 place-items-center rounded-md text-texto-3 hover:bg-trilho hover:text-texto"><Icone nome="chevron_right" /></button></td>
              </tr>; })}</tbody>
            </table>
          </div>
          <div className="divide-y divide-borda md:hidden">{itens.map((item) => { const status = STATUS[item.situacao]; return <button key={item.id} type="button" onClick={() => abrirInscricao(item.id)} className="flex w-full flex-col gap-2.5 p-4 text-left hover:bg-fundo/70">
            <span className="font-semibold">{item.curso}</span><span className="text-xs text-texto-2">{item.instituicao}</span><span className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${status.classe}`}><Icone nome={status.icone} tamanho={13} />{status.rotulo}</span><span className="font-mono">{item.documentos} documento(s)</span></span>
          </button>; })}</div>
        </>}
      </section>

      <p className="text-xs text-texto-3">Área do aluno · {usuario.nome}</p>
    </main>
  );
}
