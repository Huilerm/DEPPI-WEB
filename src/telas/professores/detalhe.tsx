"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Professor } from "../../types";
import {
  atualizarContaProfessor, atualizarProfessor, buscarProfessor, excluirProfessor,
} from "../../services/professorService";
import { Icone } from "../../components/ui/Icone";
import {
  AVISO_ERRO, BTN, BTN_PERIGO, BTN_PERIGO_O, BTN_PRIM, CAMPO_INPUT, CAMPO_SELECT,
  LAYOUT2, PAGINA, PAINEL, PAINEL_TITULO, TITULO_CURSO,
} from "../../components/ui/estilos";
import {
  Campo, ESCOLARIDADES, SUCESSO, TITULACOES, TelefonesCard, Toggle, limparTelefones,
} from "./util";

const paraFunc = (p: Professor) => ({
  siape: p.siape,
  titulacao: p.titulacao ?? "",
  escolaridade: p.escolaridade ?? "",
});

const paraConta = (p: Professor) => ({
  nomeUsual: p.usuario.nomeSocial ?? p.usuario.nome,
  emailInstitucional: p.usuario.emailInstitucional,
  emailSecundario: p.usuario.emailSecundario ?? "",
  emailSiape: p.emailSiape ?? "",
  emailNotificacoes: p.emailNotificacoes ?? "",
  emailClassroom: p.emailClassroom ?? "",
  emPGD: !!p.emPGD,
  tInst: p.telefonesInstitucionais ?? [],
  tPess: p.telefonesPessoais ?? [],
});

type FormFunc = ReturnType<typeof paraFunc>;
type FormConta = ReturnType<typeof paraConta>;

const ABAS = [
  { id: "funcionais", rotulo: "Dados funcionais" },
  { id: "conta", rotulo: "Dados de conta" },
] as const;

export function ProfessorDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [prof, setProf] = useState<Professor | null>(null);
  const [func, setFunc] = useState<FormFunc | null>(null);
  const [conta, setConta] = useState<FormConta | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [aba, setAba] = useState<"funcionais" | "conta">("funcionais");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function aplicar(p: Professor) {
    setProf(p);
    setFunc(paraFunc(p));
    setConta(paraConta(p));
  }

  useEffect(() => {
    buscarProfessor(id).then(aplicar).catch((e: Error) => setErroCarga(e.message));
  }, [id]);

  if (erroCarga) {
    return (
      <main className={PAGINA}>
        <div className={AVISO_ERRO} role="alert">{erroCarga}</div>
        <Link href="/professores" className={BTN}>Voltar</Link>
      </main>
    );
  }
  if (!prof || !func || !conta) {
    return <main className={PAGINA}><p className="text-[13px] text-texto-2">Carregando professor...</p></main>;
  }

  const setF = <K extends keyof FormFunc>(k: K, v: FormFunc[K]) => setFunc({ ...func, [k]: v });
  const setC = <K extends keyof FormConta>(k: K, v: FormConta[K]) => setConta({ ...conta, [k]: v });

  async function salvar() {
    if (!func || !conta) return;
    setSalvando(true);
    setErro(null);
    setOk(null);
    try {
      if (aba === "funcionais") {
        await atualizarProfessor(id, {
          siape: func.siape.trim(),
          titulacao: func.titulacao || null,
          escolaridade: func.escolaridade || null,
        });
      } else {
        await atualizarContaProfessor(id, {
          nomeUsual: conta.nomeUsual.trim(),
          emailInstitucional: conta.emailInstitucional.trim(),
          emailSecundario: conta.emailSecundario.trim(),
          emailSiape: conta.emailSiape.trim(),
          emailNotificacoes: conta.emailNotificacoes.trim(),
          emailClassroom: conta.emailClassroom.trim(),
          telefonesInstitucionais: limparTelefones(conta.tInst),
          telefonesPessoais: limparTelefones(conta.tPess),
          emPGD: conta.emPGD,
        });
      }
      aplicar(await buscarProfessor(id));
      setOk("Alterações salvas.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  function descartar() {
    if (prof) aplicar(prof);
    setErro(null);
    setOk(null);
  }

  async function remover() {
    setExcluindo(true);
    setErro(null);
    try {
      await excluirProfessor(id);
      router.push("/professores");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível excluir.");
      setExcluindo(false);
    }
  }

  const extras: [string, string | null][] = [
    ["Setor (SUAP)", prof.setorSuap],
    ["Lotação (SIAPE)", prof.lotacaoSiape],
    ["Situação", prof.situacao],
    ["Regime de trabalho", prof.regimeTrabalho],
    ["Jornada de trabalho", prof.jornadaTrabalho],
  ];

  return (
    <main className={PAGINA}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <Link href="/professores" className="mb-3 inline-flex items-center gap-1 text-[13px] text-texto-2 hover:text-texto">
            <Icone nome="arrow_back" tamanho={16} /> Professores
          </Link>
          <div className="font-mono text-[11px] tracking-[0.06em] text-texto-2">SIAPE {prof.siape}</div>
          <h1 className={TITULO_CURSO}>{prof.usuario.nome}</h1>
        </div>
        <button className={BTN_PERIGO_O} onClick={() => { setErro(null); setModal(true); }}>
          <Icone nome="delete" tamanho={18} /> Excluir
        </button>
      </div>

      <div className="flex gap-1 border-b border-borda">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => { setAba(a.id); setErro(null); setOk(null); }}
            className={`-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-2.5 text-[13px] ${
              aba === a.id ? "border-texto font-semibold" : "border-transparent text-texto-2"
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {ok && <div className={SUCESSO} role="status"><Icone nome="check_circle" tamanho={18} /> {ok}</div>}
      {erro && !modal && <div className={AVISO_ERRO} role="alert">{erro}</div>}

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => { e.preventDefault(); void salvar(); }}
      >
        {aba === "funcionais" ? (
          <>
            <section className={PAINEL}>
              <h2 className={PAINEL_TITULO}>Dados funcionais</h2>
              <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2">
                <Campo rotulo="SIAPE">
                  <input
                    required
                    inputMode="numeric"
                    className={`${CAMPO_INPUT} font-mono`}
                    value={func.siape}
                    onChange={(e) => setF("siape", e.target.value.replace(/\D/g, ""))}
                  />
                </Campo>
                <div />
                <Campo rotulo="Titulação" opcional>
                  <select className={CAMPO_SELECT} value={func.titulacao} onChange={(e) => setF("titulacao", e.target.value)}>
                    <option value="">Selecione</option>
                    {TITULACOES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Campo>
                <Campo rotulo="Escolaridade" opcional>
                  <select className={CAMPO_SELECT} value={func.escolaridade} onChange={(e) => setF("escolaridade", e.target.value)}>
                    <option value="">Selecione</option>
                    {ESCOLARIDADES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Campo>
              </div>
            </section>

            {extras.some(([, v]) => v) && (
              <section className={PAINEL}>
                <h2 className={PAINEL_TITULO}>Vínculo no SIAPE</h2>
                <dl className="grid grid-cols-1 gap-4 text-[13px] min-[640px]:grid-cols-2">
                  {extras.map(([rotulo, valor]) => (
                    <div key={rotulo}>
                      <dt className="text-xs text-texto-2">{rotulo}</dt>
                      <dd className="mt-0.5">{valor ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </>
        ) : (
          <div className={LAYOUT2}>
            <section className={PAINEL}>
              <h2 className={PAINEL_TITULO}>Conta</h2>
              <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2">
                <Campo rotulo="Nome usual">
                  <input required minLength={3} className={CAMPO_INPUT} value={conta.nomeUsual} onChange={(e) => setC("nomeUsual", e.target.value)} />
                </Campo>
                <Campo rotulo="E-mail institucional">
                  <input required type="email" className={CAMPO_INPUT} value={conta.emailInstitucional} onChange={(e) => setC("emailInstitucional", e.target.value)} />
                </Campo>
                <Campo rotulo="E-mail secundário">
                  <input required type="email" className={CAMPO_INPUT} value={conta.emailSecundario} onChange={(e) => setC("emailSecundario", e.target.value)} />
                </Campo>
                <Campo rotulo="E-mail SIAPE" opcional>
                  <input type="email" placeholder="nome@siape.gov.br" className={CAMPO_INPUT} value={conta.emailSiape} onChange={(e) => setC("emailSiape", e.target.value)} />
                </Campo>
                <Campo rotulo="E-mail de notificações" opcional>
                  <input type="email" className={CAMPO_INPUT} value={conta.emailNotificacoes} onChange={(e) => setC("emailNotificacoes", e.target.value)} />
                </Campo>
                <Campo rotulo="E-mail do Classroom" opcional>
                  <input type="email" className={CAMPO_INPUT} value={conta.emailClassroom} onChange={(e) => setC("emailClassroom", e.target.value)} />
                </Campo>
              </div>
              <div className="mt-4">
                <Toggle
                  marcado={conta.emPGD}
                  aoMudar={(v) => setC("emPGD", v)}
                  titulo="Participa do PGD"
                  descricao="Programa de Gestão e Desempenho"
                />
              </div>
            </section>

            <TelefonesCard
              institucionais={conta.tInst}
              pessoais={conta.tPess}
              aoMudarInst={(l) => setC("tInst", l)}
              aoMudarPess={(l) => setC("tPess", l)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2.5">
          <button type="button" className={BTN} onClick={descartar} disabled={salvando}>Descartar</button>
          <button type="submit" className={BTN_PRIM} disabled={salvando}>
            <Icone nome={salvando ? "progress_activity" : "check"} tamanho={18} />
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>

      {modal && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(25,22,19,0.42)] p-5"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !excluindo) setModal(false); }}
        >
          <section className="w-[min(470px,100%)] rounded-xl border border-borda bg-cartao shadow-[0_24px_70px_#00000026]" role="alertdialog" aria-modal="true">
            <div className="border-b border-borda px-[22px] py-5">
              <h2 className="font-titulo text-lg font-bold">Excluir professor</h2>
              <p className="mt-2 text-xs leading-normal text-texto-2">
                <strong className="font-semibold text-texto">{prof.usuario.nome}</strong> será removido
                da lista de professores. Esta ação não pode ser desfeita.
              </p>
            </div>
            {erro && <div className={`${AVISO_ERRO} m-4`} role="alert">{erro}</div>}
            <div className="flex justify-end gap-2.5 px-[22px] py-4">
              <button className={BTN} onClick={() => setModal(false)} disabled={excluindo}>Voltar</button>
              <button className={BTN_PERIGO} onClick={() => void remover()} disabled={excluindo}>
                <Icone nome="delete" tamanho={18} /> {excluindo ? "Excluindo..." : "Excluir professor"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}