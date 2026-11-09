"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSessao } from "../../../components/layout/SessaoContext";
import { Avatar } from "../../../components/ui/Avatar";
import { Icone } from "../../../components/ui/Icone";
import { API_URL } from "../../../lib/api";
import { lerToken } from "../../../lib/sessao";
import "./perfil.css";

type PerfilApi = {
  nome?: string;
  nomeSocial?: string | null;
  emailInstitucional?: string;
  criadoEm?: string;
  professor?: { siape?: string } | null;
  cargos?: Array<{ cargo?: string } | string>;
};

function mensagemDaResposta(dados: unknown, fallback: string): string {
  if (dados && typeof dados === "object") {
    const objeto = dados as Record<string, unknown>;
    if (typeof objeto.mensagem === "string") return objeto.mensagem;
    if (typeof objeto.msg === "string") return objeto.msg;
  }
  return fallback;
}

export default function PerfilPage() {
  const { usuario, papel } = useSessao();
  const [nome, setNome] = useState(usuario.nome ?? "");
  const [nomeSocial, setNomeSocial] = useState("");
  const [siape, setSiape] = useState("");
  const [criadoEm, setCriadoEm] = useState("");
  const [cargos, setCargos] = useState<string[]>(usuario.cargos ?? []);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      try {
        const token = lerToken();
        if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

        const resposta = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const dados = await resposta.json().catch(() => null);
        if (!resposta.ok) {
          throw new Error(mensagemDaResposta(dados, `Não foi possível carregar o perfil (${resposta.status}).`));
        }

        const perfil = dados as PerfilApi;
        if (!ativo) return;
        if (perfil.nome) setNome(perfil.nome);
        setNomeSocial(perfil.nomeSocial ?? "");
        setSiape(perfil.professor?.siape ?? "");
        setCriadoEm(perfil.criadoEm ?? "");
        if (perfil.cargos?.length) {
          setCargos(perfil.cargos.map((cargo) =>
            typeof cargo === "string" ? cargo : cargo.cargo ?? ""
          ).filter(Boolean));
        }
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Erro ao carregar perfil.");
      } finally {
        if (ativo) setCarregandoPerfil(false);
      }
    }

    carregarPerfil();
    return () => { ativo = false; };
  }, []);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensagem("");
    setErro("");

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }
    if (senha && senha.length < 8) {
      setErro("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("A confirmação da senha não corresponde à nova senha.");
      return;
    }

    const corpo: { nome: string; nomeSocial: string; senha?: string } = {
      nome: nome.trim(),
      nomeSocial: nomeSocial.trim(),
    };
    if (senha) corpo.senha = senha;

    setSalvando(true);
    try {
      const token = lerToken();
      if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

      // Rota confirmada no backend: PATCH /users/atualizar.
      const resposta = await fetch(`${API_URL}/users/atualizar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(corpo),
      });
      const dados = await resposta.json().catch(() => null);
      if (!resposta.ok) {
        throw new Error(mensagemDaResposta(dados, `Não foi possível salvar as alterações (${resposta.status}).`));
      }

      const usuarioAtualizado = (dados as { usuario?: { nome?: string } } | null)?.usuario;
      const usuarioSessao = JSON.parse(sessionStorage.getItem("usuario") ?? "{}");
      sessionStorage.setItem("usuario", JSON.stringify({
        ...usuarioSessao,
        nome: usuarioAtualizado?.nome ?? corpo.nome,
      }));

      setNome(usuarioAtualizado?.nome ?? corpo.nome);
      setNomeSocial(corpo.nomeSocial);
      setSenha("");
      setConfirmarSenha("");
      setMensagem(mensagemDaResposta(dados, "Perfil atualizado com sucesso."));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  }

  const iniciaisNome = nome.trim() || usuario.nome;

  return (
    <main className="pagina perfil-pagina">
      <div className="perfil-cabecalho">
        <div>
          <h1>Perfil</h1>
          <p>Seus dados e sua senha de acesso.</p>
        </div>
      </div>

      <div className="perfil-grade">
        <section className="perfil-cartao perfil-resumo" aria-label="Resumo do perfil">
          <div className="perfil-identidade">
            <Avatar nome={iniciaisNome} tamanho={56} />
            <div className="perfil-identidade__texto">
              <h2>{nome || usuario.nome}</h2>
              <p>{usuario.email}</p>
            </div>
          </div>

          <div className="perfil-divisor" />

          <dl className="perfil-detalhes">
            <div>
              <dt>SIAPE</dt>
              <dd>{siape || "Não informado"}</dd>
            </div>
            <div>
              <dt>Cargos</dt>
              <dd className="perfil-cargos">
                {cargos.length
                  ? cargos.map((cargo) => <span key={cargo}>{cargo}</span>)
                  : <span>{papel}</span>}
              </dd>
            </div>
            <div>
              <dt>Conta criada em</dt>
              <dd>
                {criadoEm ? new Date(criadoEm).toLocaleDateString("pt-BR") : "Não informado"}
              </dd>
            </div>
          </dl>
          {carregandoPerfil && <p className="perfil-ajuda">Carregando informações do perfil...</p>}
        </section>

        <section className="perfil-cartao perfil-edicao">
          <form onSubmit={salvar}>
            <h2>Editar perfil</h2>

            <div className="perfil-campos">
              <label className="perfil-campo">
                <span>Nome</span>
                <input
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="perfil-campo">
                <span>Nome social <small>(opcional)</small></span>
                <input
                  value={nomeSocial}
                  onChange={(evento) => setNomeSocial(evento.target.value)}
                  placeholder="Como prefere ser chamado(a)"
                  autoComplete="nickname"
                />
              </label>
            </div>

            <div className="perfil-divisor perfil-divisor--form" />

            <h2 className="perfil-subtitulo">Trocar senha</h2>
            <div className="perfil-campos">
              <label className="perfil-campo">
                <span>Nova senha</span>
                <span className="perfil-senha">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    autoComplete="new-password"
                    placeholder="Digite uma nova senha"
                  />
                  <button
                    type="button"
                    className="perfil-olho"
                    onClick={() => setMostrarSenha((valor) => !valor)}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <Icone nome={mostrarSenha ? "visibility_off" : "visibility"} />
                  </button>
                </span>
              </label>

              <label className="perfil-campo">
                <span>Confirmar nova senha</span>
                <span className="perfil-senha">
                  <input
                    type={mostrarConfirmacao ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(evento) => setConfirmarSenha(evento.target.value)}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    className="perfil-olho"
                    onClick={() => setMostrarConfirmacao((valor) => !valor)}
                    aria-label={mostrarConfirmacao ? "Ocultar confirmação" : "Mostrar confirmação"}
                  >
                    <Icone nome={mostrarConfirmacao ? "visibility_off" : "visibility"} />
                  </button>
                </span>
              </label>
            </div>
            <p className="perfil-ajuda">Mínimo de 8 caracteres.</p>

            {erro && <p className="perfil-alerta perfil-alerta--erro" role="alert">{erro}</p>}
            {mensagem && <p className="perfil-alerta perfil-alerta--info" role="status">{mensagem}</p>}

            <div className="perfil-acoes">
              <button type="submit" className="perfil-botao" disabled={salvando}>
                <Icone nome="check" tamanho={18} />
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
