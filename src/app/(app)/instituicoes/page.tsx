"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Instituicao } from "../../../types";
import { Icone } from "../../../components/ui/Icone";
import { buscarInstituicoes, criarInstituicao, atualizarInstituicao, excluirInstituicao } from "../../../lib/instituicoes-api";
import "./instituicoes.css";

type FormularioInstituicao = Pick<Instituicao, "nome" | "cidade" | "campus" | "cnpj">;
const FORM_VAZIO: FormularioInstituicao = { nome: "", cidade: "", campus: "", cnpj: "" };

function mascararCnpj(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 14);
  return n.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}

export default function InstituicoesPage() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [termo, setTermo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Instituicao | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Instituicao | null>(null);
  const [formulario, setFormulario] = useState<FormularioInstituicao>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true); setErro(null);
    try { setInstituicoes(await buscarInstituicoes()); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível carregar as instituições."); }
    finally { setCarregando(false); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  const filtradas = useMemo(() => {
    const busca = termo.trim().toLocaleLowerCase("pt-BR");
    if (!busca) return instituicoes;
    return instituicoes.filter((i) => [i.nome, i.campus, i.cidade, i.cnpj].some((v) => (v || "").toLocaleLowerCase("pt-BR").includes(busca)));
  }, [instituicoes, termo]);

  function abrirCadastro() { setEditando(null); setFormulario(FORM_VAZIO); setErro(null); setModalAberto(true); }
  function abrirEdicao(i: Instituicao) { setEditando(i); setFormulario({ nome: i.nome, campus: i.campus, cidade: i.cidade, cnpj: i.cnpj || "" }); setErro(null); setModalAberto(true); }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); setErro(null); setMensagem(null);
    if (formulario.cnpj.replace(/\D/g, "").length !== 14) { setErro("CNPJ incompleto — informe os 14 dígitos."); return; }
    setSalvando(true);
    try {
      const dados = { ...formulario, cnpj: mascararCnpj(formulario.cnpj) };
      if (editando) await atualizarInstituicao(editando.id, dados); else await criarInstituicao(dados);
      setModalAberto(false); setMensagem(editando ? "Instituição atualizada com sucesso." : "Instituição cadastrada com sucesso."); await carregar();
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível salvar a instituição."); }
    finally { setSalvando(false); }
  }

  async function remover() {
    if (!confirmarExclusao) return;
    setExcluindo(true); setErro(null); setMensagem(null);
    try { await excluirInstituicao(confirmarExclusao.id); setInstituicoes((lista) => lista.filter((i) => i.id !== confirmarExclusao.id)); setConfirmarExclusao(null); setMensagem("Instituição excluída com sucesso."); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível excluir a instituição."); }
    finally { setExcluindo(false); }
  }

  return <main className="pagina instituicoes-pagina">
    <div className="instituicoes-cabecalho">
      <div><h1>Instituições</h1><p>{instituicoes.length} {instituicoes.length === 1 ? "instituição cadastrada" : "instituições cadastradas"}</p></div>
      <button className="botao-primario" onClick={abrirCadastro}><Icone nome="add" tamanho={18} /> Nova instituição</button>
    </div>

    <label className="instituicoes-busca"><Icone nome="search" tamanho={19} /><input type="search" placeholder="Buscar por nome, campus ou cidade" value={termo} onChange={(e) => setTermo(e.target.value)} aria-label="Buscar por nome, campus ou cidade" />{termo && <button type="button" onClick={() => setTermo("")} aria-label="Limpar pesquisa"><Icone nome="close" /></button>}</label>

    {mensagem && <div className="instituicoes-alerta instituicoes-alerta--sucesso" role="status"><Icone nome="check_circle" />{mensagem}<button onClick={() => setMensagem(null)} aria-label="Fechar"><Icone nome="close" /></button></div>}
    {erro && !modalAberto && <div className="instituicoes-alerta instituicoes-alerta--erro" role="alert"><Icone nome="error" />{erro}<button onClick={() => void carregar()}>Tentar novamente</button></div>}

    <section className="instituicoes-lista" aria-label="Instituições cadastradas">
      {carregando ? <div className="instituicoes-estado"><span className="instituicoes-spinner" /><strong>Carregando instituições...</strong></div>
      : erro && instituicoes.length === 0 ? <div className="instituicoes-estado"><strong>Não foi possível carregar as instituições</strong><button className="botao-secundario" onClick={() => void carregar()}>Tentar novamente</button></div>
      : filtradas.length === 0 ? <div className="instituicoes-estado"><strong>{termo ? "Nenhuma instituição encontrada" : "Nenhuma instituição cadastrada"}</strong><span>{termo ? "Tente outro termo de pesquisa." : "Cadastre a primeira instituição."}</span></div>
      : <div className="instituicoes-tabela-wrap"><table className="instituicoes-tabela"><thead><tr><th>Nome</th><th>Campus</th><th>Cidade</th><th>CNPJ</th><th aria-label="Ações" /></tr></thead><tbody>
        {filtradas.map((i) => <tr key={i.id}><td>{i.nome}</td><td>{i.campus}</td><td className="instituicoes-cidade">{i.cidade}</td><td><span className="instituicoes-cnpj">{i.cnpj || "—"}</span></td><td><div className="instituicoes-acoes"><button className="instituicoes-acao" onClick={() => abrirEdicao(i)} title="Editar" aria-label={`Editar ${i.nome} - ${i.campus}`}><Icone nome="edit" tamanho={17} /></button><button className="instituicoes-acao instituicoes-acao--perigo" onClick={() => setConfirmarExclusao(i)} title="Excluir" aria-label={`Excluir ${i.nome} - ${i.campus}`}><Icone nome="delete" tamanho={17} /></button></div></td></tr>)}
      </tbody></table></div>}
    </section>

    {modalAberto && <div className="instituicoes-modal-fundo" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !salvando) setModalAberto(false); }}><section className="instituicoes-modal" role="dialog" aria-modal="true" aria-labelledby="instituicoes-modal-titulo">
      <div className="instituicoes-modal__topo"><h2 id="instituicoes-modal-titulo">{editando ? "Editar instituição" : "Nova instituição"}</h2><button className="instituicoes-fechar" onClick={() => setModalAberto(false)} disabled={salvando} aria-label="Fechar"><Icone nome="close" /></button></div>
      <form onSubmit={salvar}>
        <label className="instituicoes-campo"><span>Nome</span><input autoFocus required maxLength={160} value={formulario.nome} onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })} placeholder="Nome da instituição" /></label>
        <div className="instituicoes-campos-duplos"><label className="instituicoes-campo"><span>Campus</span><input required maxLength={120} value={formulario.campus} onChange={(e) => setFormulario({ ...formulario, campus: e.target.value })} placeholder="Nome do campus" /></label><label className="instituicoes-campo"><span>Cidade</span><input required maxLength={100} value={formulario.cidade} onChange={(e) => setFormulario({ ...formulario, cidade: e.target.value })} placeholder="Cidade" /></label></div>
        <label className="instituicoes-campo"><span>CNPJ</span><input required inputMode="numeric" value={formulario.cnpj} onChange={(e) => setFormulario({ ...formulario, cnpj: mascararCnpj(e.target.value) })} placeholder="00.000.000/0000-00" maxLength={18} /></label>
        {erro && <div className="instituicoes-alerta instituicoes-alerta--erro" role="alert">{erro}</div>}
        <div className="instituicoes-modal__rodape"><button type="button" className="botao-secundario" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</button><button type="submit" className="botao-primario" disabled={salvando}><Icone nome={salvando ? "progress_activity" : editando ? "check" : "add"} />{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar instituição"}</button></div>
      </form>
    </section></div>}

    {confirmarExclusao && <div className="instituicoes-modal-fundo" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !excluindo) setConfirmarExclusao(null); }}><section className="instituicoes-modal instituicoes-modal--excluir" role="alertdialog" aria-modal="true" aria-labelledby="instituicoes-excluir-titulo" aria-describedby="instituicoes-excluir-descricao">
      <div className="instituicoes-modal__topo"><div><h2 id="instituicoes-excluir-titulo">Excluir instituição</h2><p id="instituicoes-excluir-descricao"><strong>{confirmarExclusao.nome} · Campus {confirmarExclusao.campus}</strong> será removida. Esta ação não pode ser desfeita.</p></div><button className="instituicoes-fechar" onClick={() => setConfirmarExclusao(null)} disabled={excluindo} aria-label="Fechar"><Icone nome="close" /></button></div>
      {erro && <div className="instituicoes-alerta instituicoes-alerta--erro" role="alert">{erro}</div>}
      <div className="instituicoes-modal__rodape"><button className="botao-secundario" onClick={() => setConfirmarExclusao(null)} disabled={excluindo}>Voltar</button><button className="botao-excluir" onClick={() => void remover()} disabled={excluindo}><Icone nome="delete" />{excluindo ? "Excluindo..." : "Excluir instituição"}</button></div>
    </section></div>}
  </main>;
}
