"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icone } from "../../components/ui/Icone";
import {
  buscarDocumentosInscricao,
  buscarMinhasInscricoes,
  enviarDocumentoInscricao,
  registrarRendaFamiliar,
  removerDocumentoInscricao,
  type CategoriaDocumento,
  type DocumentoInscricao,
  type MinhaInscricao,
} from "../../lib/api";
import type { StatusInscricao } from "../../types";

const CATEGORIAS: { valor: CategoriaDocumento; rotulo: string; obrigatoria: boolean }[] = [
  { valor: "RG", rotulo: "RG", obrigatoria: true },
  { valor: "CPF", rotulo: "CPF", obrigatoria: true },
  { valor: "COMPROVANTE_RESIDENCIA", rotulo: "Comprovante de residência", obrigatoria: true },
  { valor: "COMPROVANTE_RENDA", rotulo: "Comprovante de renda", obrigatoria: true },
  { valor: "HISTORICO_ESCOLAR", rotulo: "Histórico escolar", obrigatoria: true },
  { valor: "OUTRO", rotulo: "Outro (opcional)", obrigatoria: false },
];

const STATUS: Record<StatusInscricao, { rotulo: string; classe: string; icone: string }> = {
  PENDENTE: { rotulo: "Pendente", classe: "bg-[#fff4e5] text-[#a45b08]", icone: "schedule" },
  DEFERIDO: { rotulo: "Deferida", classe: "bg-[#eaf7ef] text-[#187747]", icone: "check_circle" },
  INDEFERIDO: { rotulo: "Indeferida", classe: "bg-[#fff0ef] text-[#b42318]", icone: "cancel" },
  CANCELADO: { rotulo: "Cancelada", classe: "bg-trilho text-texto-2", icone: "remove_circle" },
};

function dataBR(valor?: string | null) {
  if (!valor) return "—";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleDateString("pt-BR");
}

function dataHoraBR(valor?: string | null) {
  if (!valor) return "—";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function nomeCategoria(categoria: CategoriaDocumento | null) {
  return CATEGORIAS.find((item) => item.valor === categoria)?.rotulo.replace(" (opcional)", "") ?? "Outro";
}

function tamanhoDocumento(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valorInicialMoeda(valor?: number | null) {
  if (valor == null || !Number.isFinite(valor)) return "";
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function converterMoeda(valor: string) {
  const limpo = valor.trim().replace(/\./g, "").replace(",", ".");
  return Number(limpo);
}

function formatarCampoMoeda(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return "";
  return (Number(digitos) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function DetalheInscricaoAlunoPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const inputArquivo = useRef<HTMLInputElement>(null);
  const [inscricao, setInscricao] = useState<MinhaInscricao | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoInscricao[]>([]);
  const [categoria, setCategoria] = useState<CategoriaDocumento>("COMPROVANTE_RENDA");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [rendaFamiliar, setRendaFamiliar] = useState("");
  const [numeroPessoas, setNumeroPessoas] = useState("1");
  const [carregando, setCarregando] = useState(true);
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(true);
  const [salvandoRenda, setSalvandoRenda] = useState(false);
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);
  const [removendoDocumento, setRemovendoDocumento] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setCarregandoDocumentos(true);
      setErro(null);
      try {
        const [lista, arquivos] = await Promise.all([
          buscarMinhasInscricoes(),
          buscarDocumentosInscricao(id),
        ]);
        if (!ativo) return;
        const encontrada = lista.find((item) => item.id === id);
        if (!encontrada) throw new Error("Não foi possível localizar esta inscrição na sua conta.");
        setInscricao(encontrada);
        setDocumentos(arquivos);
        setRendaFamiliar(valorInicialMoeda(encontrada.rendaFamiliar?.rendaFamiliar));
        setNumeroPessoas(String(encontrada.rendaFamiliar?.numeroPessoas ?? 1));
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados da inscrição.");
      } finally {
        if (ativo) {
          setCarregando(false);
          setCarregandoDocumentos(false);
        }
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [id]);

  const categoriasEnviadas = useMemo(
    () => new Set(documentos.map((doc) => doc.categoria).filter((item): item is CategoriaDocumento => Boolean(item))),
    [documentos],
  );
  const categoriasObrigatorias = CATEGORIAS.filter((item) => item.obrigatoria);
  const quantidadeObrigatoria = categoriasObrigatorias.filter((item) => categoriasEnviadas.has(item.valor)).length;
  const rendaPorPessoa = Number.isFinite(converterMoeda(rendaFamiliar)) && converterMoeda(rendaFamiliar) > 0 && Number(numeroPessoas) > 0
    ? converterMoeda(rendaFamiliar) / Number(numeroPessoas)
    : 0;
  const status = inscricao ? STATUS[inscricao.status] : null;

  async function salvarRenda() {
    if (!inscricao || salvandoRenda) return;
    const renda = converterMoeda(rendaFamiliar);
    const pessoas = Number(numeroPessoas);
    if (!Number.isFinite(renda) || renda <= 0) {
      setErro("Informe uma renda familiar mensal maior que zero.");
      setSucesso(null);
      return;
    }
    if (!Number.isInteger(pessoas) || pessoas < 1) {
      setErro("Informe uma quantidade válida de pessoas na residência.");
      setSucesso(null);
      return;
    }
    setSalvandoRenda(true);
    setErro(null);
    setSucesso(null);
    try {
      const salva = await registrarRendaFamiliar(inscricao.id, { rendaFamiliar: renda, numeroPessoas: pessoas });
      setRendaFamiliar(valorInicialMoeda(salva.rendaFamiliar));
      setNumeroPessoas(String(salva.numeroPessoas));
      setInscricao((atual) => atual ? { ...atual, rendaFamiliar: { rendaFamiliar: salva.rendaFamiliar, numeroPessoas: salva.numeroPessoas } } : atual);
      setSucesso("Renda familiar salva com sucesso.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar a renda familiar.");
    } finally {
      setSalvandoRenda(false);
    }
  }

  function selecionarArquivo(file?: File) {
    if (!file) return;
    setErro(null);
    setSucesso(null);
    const tiposAceitos = ["application/pdf", "image/jpeg", "image/png"];
    const extensaoAceita = /\.(pdf|jpe?g|png)$/i.test(file.name);
    if (!tiposAceitos.includes(file.type) && !extensaoAceita) {
      setErro("Escolha um arquivo PDF, JPG ou PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErro("O arquivo deve ter no máximo 5 MB.");
      return;
    }
    setArquivo(file);
  }

  function aoSoltarArquivo(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastando(false);
    selecionarArquivo(evento.dataTransfer.files?.[0]);
  }

  async function enviarDocumento() {
    if (!inscricao || !arquivo || enviandoDocumento) return;
    setEnviandoDocumento(true);
    setErro(null);
    setSucesso(null);
    try {
      const enviado = await enviarDocumentoInscricao(inscricao.id, arquivo, categoria);
      setDocumentos((lista) => [enviado, ...lista.filter((item) => item.id !== enviado.id)]);
      setArquivo(null);
      if (inputArquivo.current) inputArquivo.current.value = "";
      setSucesso("Documento enviado com sucesso.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar o documento.");
    } finally {
      setEnviandoDocumento(false);
    }
  }

  async function removerDocumento(doc: DocumentoInscricao) {
    if (removendoDocumento) return;
    const confirmar = window.confirm(`Deseja remover o documento \"${doc.nomeOriginal}\"?`);
    if (!confirmar) return;
    setRemovendoDocumento(doc.id);
    setErro(null);
    setSucesso(null);
    try {
      await removerDocumentoInscricao(doc.id);
      setDocumentos((lista) => lista.filter((item) => item.id !== doc.id));
      setSucesso("Documento removido com sucesso.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível remover o documento.");
    } finally {
      setRemovendoDocumento(null);
    }
  }

  if (carregando) {
    return <main className="mx-auto flex min-h-[55vh] w-full max-w-[1500px] items-center justify-center px-8 text-sm text-texto-2"><Icone nome="progress_activity" className="mr-2 animate-spin" /> Carregando inscrição...</main>;
  }

  if (!inscricao) {
    return <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-8 py-7"><button type="button" onClick={() => router.push("/inscricoes")} className="flex w-fit items-center gap-2 text-sm text-texto-2 hover:text-texto"><Icone nome="arrow_back" tamanho={17} /> Voltar para minhas inscrições</button><div role="alert" className="rounded-lg border border-[#f1b8b5] bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318]">{erro ?? "Inscrição não encontrada."}</div></main>;
  }

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-8 py-6 max-[760px]:px-4 max-[760px]:py-5">
      <nav aria-label="Navegação estrutural" className="flex items-center gap-2 text-[13px] text-texto-2">
        <button type="button" onClick={() => router.push("/inscricoes")} className="hover:text-acento">Minhas inscrições</button>
        <Icone nome="chevron_right" tamanho={16} className="text-texto-3" />
        <span className="max-w-[55vw] truncate text-texto">{inscricao.curso?.nome ?? "Inscrição"}</span>
      </nav>

      <header className="mb-1">
        <p className="font-mono text-[12px] text-texto-3">Inscrição #{inscricao.id.slice(0, 9)}</p>
        <h1 className="mt-1 font-titulo text-[25px] font-bold leading-tight tracking-[-0.02em] max-[600px]:text-[21px]">{inscricao.curso?.nome ?? "Inscrição"}</h1>
      </header>

      {(erro || sucesso) && <div role={erro ? "alert" : "status"} className={`rounded-lg border px-4 py-2.5 text-[13px] ${erro ? "border-[#f1b8b5] bg-[#fff0ef] text-[#b42318]" : "border-[#b9e4c9] bg-[#eff9f2] text-[#187747]"}`}>{erro ?? sucesso}</div>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-borda bg-cartao p-5">
            <h2 className="font-titulo text-[15px] font-semibold">Situação</h2>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${status?.classe}`}><Icone nome={status?.icone ?? "info"} tamanho={14} />{status?.rotulo}</span>
            </div>
            <ol className="mt-4 space-y-4">
              <li className="relative flex gap-3">
                <span className="mt-[5px] size-2.5 shrink-0 rounded-full bg-[#b94b0b]" />
                <div className="min-w-0"><p className="text-[13px] font-medium">Inscrição realizada</p><p className="mt-0.5 font-mono text-[11px] text-texto-2">{dataHoraBR(inscricao.data)}</p></div>
              </li>
              <li className="relative flex gap-3">
                <span className={`mt-[4px] size-2.5 shrink-0 rounded-full border ${inscricao.status === "PENDENTE" ? "border-dashed border-texto-3" : "border-[#198754] bg-[#198754]"}`} />
                <div className="min-w-0"><p className="text-[13px] font-medium">{inscricao.status === "PENDENTE" ? "Análise do DEPPI" : `Análise ${status?.rotulo.toLowerCase()}`}</p><p className="mt-0.5 text-[11px] text-texto-2">{inscricao.status === "PENDENTE" ? "Aguardando conferência dos documentos e da renda" : "Etapa de análise atualizada"}</p></div>
              </li>
            </ol>
          </section>

          <section className="rounded-xl border border-borda bg-cartao p-5">
            <h2 className="font-titulo text-[15px] font-semibold">Renda familiar</h2>
            <form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); void salvarRenda(); }}>
              <label className="block text-[12px] font-medium text-texto">Renda mensal da família
                <div className="mt-1.5 flex h-11 items-center rounded-lg border border-borda bg-fundo px-3 focus-within:border-link">
                  <span className="mr-2 text-[12px] text-texto-2">R$</span>
                  <input type="text" inputMode="decimal" value={rendaFamiliar} onChange={(e) => setRendaFamiliar(formatarCampoMoeda(e.target.value))} placeholder="0,00" className="w-full min-w-0 bg-transparent font-mono text-[13px] text-texto outline-none" />
                </div>
              </label>
              <label className="block text-[12px] font-medium text-texto">Pessoas na casa
                <div className="mt-1.5 flex h-11 items-center rounded-lg border border-borda bg-fundo px-3">
                  <input type="number" min="1" step="1" value={numeroPessoas} onChange={(e) => setNumeroPessoas(e.target.value)} className="w-full min-w-0 bg-transparent font-mono text-[13px] text-texto outline-none" />
                  <button type="button" aria-label="Diminuir número de pessoas" onClick={() => setNumeroPessoas(String(Math.max(1, Number(numeroPessoas || 1) - 1)))} className="grid size-7 place-items-center rounded-md bg-trilho text-texto-2 hover:bg-borda"><Icone nome="remove" tamanho={17} /></button>
                  <button type="button" aria-label="Aumentar número de pessoas" onClick={() => setNumeroPessoas(String(Math.max(1, Number(numeroPessoas || 1) + 1)))} className="ml-1 grid size-7 place-items-center rounded-md bg-trilho text-texto-2 hover:bg-borda"><Icone nome="add" tamanho={17} /></button>
                </div>
              </label>
              <div className="flex items-center justify-between rounded-lg bg-[#f2f0ec] px-3.5 py-3 dark:bg-[#292825]">
                <span className="text-[12px] text-texto-2">Renda per capita</span>
                <strong className="font-mono text-[16px] font-bold text-texto">{rendaPorPessoa > 0 ? moeda(rendaPorPessoa) : "—"}</strong>
              </div>
              <button type="submit" disabled={salvandoRenda} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-borda bg-cartao px-4 text-[13px] font-semibold text-texto transition hover:bg-trilho disabled:opacity-60">
                {salvandoRenda ? <><Icone nome="progress_activity" className="animate-spin" /> Salvando...</> : "Salvar renda"}
              </button>
            </form>
          </section>
        </div>

        <section className="min-w-0 rounded-xl border border-borda bg-cartao p-5 max-[600px]:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-titulo text-[15px] font-semibold">Documentos</h2>
            <span className="text-[11px] text-texto-2">{quantidadeObrigatoria} de {categoriasObrigatorias.length} obrigatórios</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {CATEGORIAS.map((item) => {
              const enviado = categoriasEnviadas.has(item.valor);
              const selecionado = categoria === item.valor;
              return <button key={item.valor} type="button" onClick={() => setCategoria(item.valor)} className={`flex min-h-[53px] items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[12px] leading-tight transition ${enviado ? "border-[#c5e8d1] bg-[#f1faf4] text-[#176b43]" : selecionado ? "border-acento/50 bg-acento/[0.06] text-texto" : "border-borda bg-cartao text-texto-2 hover:bg-fundo"}`}>
                <Icone nome={enviado ? "check_circle" : selecionado ? "radio_button_checked" : "radio_button_unchecked"} tamanho={16} className="shrink-0" />
                <span>{item.rotulo}</span>
              </button>;
            })}
          </div>

          <div onDragOver={(e) => { e.preventDefault(); setArrastando(true); }} onDragLeave={() => setArrastando(false)} onDrop={aoSoltarArquivo}
            onClick={() => inputArquivo.current?.click()} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputArquivo.current?.click(); } }}
            className={`mt-4 flex min-h-[196px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-6 text-center transition ${arrastando ? "border-acento bg-acento/[0.06]" : "border-[#d8d2c8] bg-fundo/40 hover:border-acento/60 hover:bg-fundo"}`}>
            <span className="mb-2 grid size-11 place-items-center rounded-xl bg-[#f2f0ec] text-[#d97706] dark:bg-[#292825]"><Icone nome="upload_file" tamanho={24} /></span>
            <p className="text-[13px] font-medium text-texto">{arquivo ? arquivo.name : <>Arraste o arquivo aqui ou <span className="font-semibold text-acento">escolha no computador</span></>}</p>
            <p className="mt-1 text-[11px] text-texto-2">PDF, JPG ou PNG · até 5 MB</p>
            <input ref={inputArquivo} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(e) => selecionarArquivo(e.target.files?.[0])} />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
              <label className="sr-only" htmlFor="categoria-envio">Categoria do documento</label>
              <select id="categoria-envio" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)} className="h-9 max-w-full rounded-lg border border-borda bg-cartao px-3 text-[12px] text-texto outline-none focus:border-link">
                {CATEGORIAS.map((item) => <option key={item.valor} value={item.valor}>Categoria: {item.rotulo}</option>)}
              </select>
              {arquivo && <button type="button" onClick={enviarDocumento} disabled={enviandoDocumento} className="inline-flex h-9 items-center gap-2 rounded-lg bg-acento px-3.5 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">{enviandoDocumento ? "Enviando..." : "Enviar documento"}</button>}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-borda">
            {carregandoDocumentos ? <p className="px-4 py-5 text-center text-[12px] text-texto-2">Carregando documentos...</p> : documentos.length === 0 ? (
              <p className="px-4 py-5 text-center text-[12px] text-texto-2">Nenhum documento enviado até o momento.</p>
            ) : documentos.map((doc, indice) => <div key={doc.id} className={`flex flex-wrap items-center gap-3 px-3.5 py-3 ${indice > 0 ? "border-t border-borda" : ""}`}>
              <Icone nome={doc.tipoMime?.startsWith("image/") ? "image" : "picture_as_pdf"} tamanho={18} className="shrink-0 text-texto-3" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-texto">{doc.nomeOriginal}</p>
                <p className="mt-0.5 text-[10px] text-texto-2">{nomeCategoria(doc.categoria)}</p>
              </div>
              <span className="hidden whitespace-nowrap font-mono text-[11px] text-texto-2 sm:block">{dataBR(doc.criadoEm)}</span>
              <span className="hidden whitespace-nowrap font-mono text-[11px] text-texto-2 md:block">{tamanhoDocumento(doc.tamanho)}</span>
              <a href={doc.caminho} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex h-8 shrink-0 items-center rounded-lg bg-[#f2f0ec] px-3 text-[11px] font-medium text-texto hover:bg-trilho dark:bg-[#292825]">Abrir</a>
              <button type="button" title={`Remover ${doc.nomeOriginal}`} aria-label={`Remover ${doc.nomeOriginal}`} disabled={removendoDocumento !== null} onClick={() => void removerDocumento(doc)} className="grid size-8 shrink-0 place-items-center rounded-md text-[#b42318] hover:bg-[#fff0ef] disabled:opacity-40">{removendoDocumento === doc.id ? <Icone nome="progress_activity" tamanho={16} className="animate-spin" /> : <Icone nome="delete" tamanho={16} />}</button>
            </div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
