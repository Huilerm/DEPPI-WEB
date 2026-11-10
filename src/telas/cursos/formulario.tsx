"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Curso, Instituicao } from "../../types";
import {
  atualizarCurso, buscarInstituicoes, criarCurso, enviarCapa,
} from "../../lib/api";
import { dataParaApi, horaParaApi, hora } from "./util";
import {
  AVISO, AVISO_ERRO, BTN, BTN_PRIM, CAMPO_INPUT, CAMPO_LABEL, CAMPO_SELECT, LAYOUT2, PAINEL, PAINEL_TITULO, PAGINA, TOPO,
} from "../../components/ui/estilos";

export function FormularioCurso({ curso }: { curso?: Curso }) {
  const router = useRouter();
  const editando = !!curso;
  const [insts, setInsts] = useState<Instituicao[] | null>(null);
  const [listaFalhou, setListaFalhou] = useState(false);
  const [f, setF] = useState({
    nome: curso?.nome ?? "",
    fkInstituicao: curso?.Instituicao?.id ?? "",
    carga: String(curso?.carga_horaria ?? ""),
    vagas: String(curso?.vagas ?? ""),
    inicio: curso?.dataInicio.slice(0, 10) ?? "",
    fim: curso?.dataFim.slice(0, 10) ?? "",
    hIni: curso ? hora(curso.horarioInicio) : "",
    hFim: curso ? hora(curso.horarioFim) : "",
  });
  const [capa, setCapa] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const inputArq = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    buscarInstituicoes().then(setInsts).catch(() => setListaFalhou(true));
  }, []);

  const erroData = f.inicio && f.fim && f.fim < f.inicio
    ? "A data de fim deve ser igual ou posterior à de início." : null;

  function escolherArquivo(a?: File) {
    if (!a) return;
    if (!["image/jpeg", "image/png"].includes(a.type) || a.size > 5 * 1024 * 1024) {
      setErro("A capa deve ser JPG ou PNG de até 5 MB.");
      return;
    }
    setErro(null);
    setCapa(a);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (erroData) return;
    setSalvando(true);
    setErro(null);
    try {
      const corpo = {
        nome: f.nome.trim(),
        carga_horaria: Number(f.carga),
        vagas: Number(f.vagas),
        dataInicio: dataParaApi(f.inicio),
        dataFim: dataParaApi(f.fim),
        horarioInicio: horaParaApi(f.hIni),
        horarioFim: horaParaApi(f.hFim),
      };
      const salvo = editando
        ? await atualizarCurso(curso!.id, corpo)
        : await criarCurso({ ...corpo, fkInstituicao: f.fkInstituicao });
      if (capa) await enviarCapa(salvo.id ?? curso!.id, capa);
      router.push(`/cursos/${salvo.id ?? curso!.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar o curso.");
      setSalvando(false);
    }
  }

  return (
    <form className={PAGINA} onSubmit={enviar}>
      <div className={TOPO}>
        <div>
          <h1>{editando ? "Editar curso" : "Novo curso"}</h1>
          {!editando && <p>O curso é criado com status “Em análise”.</p>}
        </div>
      </div>

      {!editando && listaFalhou && (
        <div className={AVISO}>P6 · Se a lista de instituições não carregar, o campo vira texto para você informar o ID da instituição.</div>
      )}
      {erro && <div className={AVISO_ERRO}>{erro}</div>}

      <div className={LAYOUT2}>
        <div className={PAINEL}>
          <h2 className={PAINEL_TITULO}>Informações</h2>
          <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-2">
            <div className="col-span-full">
              <label className={CAMPO_LABEL}>Nome do curso</label>
              <input className={CAMPO_INPUT} required value={f.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>

            {!editando && (
              <div className="col-span-full">
                <label className={CAMPO_LABEL}>Instituição</label>
                {insts && !listaFalhou ? (
                  <select className={CAMPO_SELECT} required value={f.fkInstituicao} onChange={(e) => set("fkInstituicao", e.target.value)}>
                    <option value="">Selecione…</option>
                    {insts.map((i) => (
                      <option key={i.id} value={i.id}>{i.nome} · {i.campus}</option>
                    ))}
                  </select>
                ) : (
                  <input className={CAMPO_INPUT} required placeholder={listaFalhou ? "ID da instituição" : "Carregando…"}
                    disabled={!listaFalhou} value={f.fkInstituicao}
                    onChange={(e) => set("fkInstituicao", e.target.value)} />
                )}
              </div>
            )}

            <div><label className={CAMPO_LABEL}>Carga horária (horas)</label>
              <input className={CAMPO_INPUT} required type="number" min={1} value={f.carga} onChange={(e) => set("carga", e.target.value)} /></div>
            <div><label className={CAMPO_LABEL}>Vagas</label>
              <input className={CAMPO_INPUT} required type="number" min={1} value={f.vagas} onChange={(e) => set("vagas", e.target.value)} /></div>

            <div><label className={CAMPO_LABEL}>Data de início</label>
              <input className={CAMPO_INPUT} required type="date" value={f.inicio} onChange={(e) => set("inicio", e.target.value)} /></div>
            <div><label className={CAMPO_LABEL}>Data de fim</label>
              <input
                className={`${CAMPO_INPUT} ${erroData ? "border-[#b42318]!" : ""}`}
                required type="date" value={f.fim} onChange={(e) => set("fim", e.target.value)}
              />
              {erroData && <div className="mt-[5px] text-xs text-[#b42318]">{erroData}</div>}</div>

            <div><label className={CAMPO_LABEL}>Horário de início</label>
              <input className={CAMPO_INPUT} required type="time" value={f.hIni} onChange={(e) => set("hIni", e.target.value)} /></div>
            <div><label className={CAMPO_LABEL}>Horário de fim</label>
              <input className={CAMPO_INPUT} required type="time" value={f.hFim} onChange={(e) => set("hFim", e.target.value)} /></div>
          </div>
        </div>

        <div className={PAINEL}>
          <h2 className={PAINEL_TITULO}>Capa</h2>
          <div
            className="cursor-pointer rounded-[10px] border border-dashed border-borda px-4 py-9 text-center text-[13px] [&_small]:mt-2 [&_small]:block [&_small]:text-texto-3 [&_u]:font-semibold [&_u]:text-acento"
            onClick={() => inputArq.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); escolherArquivo(e.dataTransfer.files[0]); }}
          >
            {capa ? <b>{capa.name}</b> : <>Arraste a imagem aqui ou <u>escolha no computador</u></>}
            <small>JPG ou PNG · até 5 MB</small>
          </div>
          <input ref={inputArq} type="file" accept="image/png,image/jpeg" hidden
            onChange={(e) => escolherArquivo(e.target.files?.[0])} />
          <p className="mt-3 text-xs text-texto-2">Sem capa, o curso mostra as iniciais do nome.</p>
        </div>
      </div>

      <div className="flex justify-end gap-2.5">
        <button type="button" className={BTN} onClick={() => router.back()}>Cancelar</button>
        <button className={BTN_PRIM} disabled={salvando || !!erroData}>
          {salvando ? "Salvando…" : editando ? "Salvar alterações" : "+ Criar curso"}
        </button>
      </div>
    </form>
  );
}
