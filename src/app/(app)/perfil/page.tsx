"use client";

import { useState, type FormEvent } from "react";
import { useSessao } from "../../../components/layout/SessaoContext";
import { Avatar } from "../../../components/ui/Avatar";
import { Icone } from "../../../components/ui/Icone";
import { papelPrincipal } from "../../../lib/sessao";
import "./perfil.css";

export default function PerfilPage() {
  const { usuario, papel } = useSessao();
  const [nome, setNome] = useState(usuario.nome ?? "");
  const [nomeSocial, setNomeSocial] = useState(
    (usuario as typeof usuario & { nomeSocial?: string }).nomeSocial ?? "",
  );
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function salvar(evento: FormEvent<HTMLFormElement>) {
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

    // O endpoint de atualização de perfil ainda precisa ser confirmado no backend.
    // Não simulamos uma gravação remota: os dados continuam na sessão atual.
    setMensagem(
      "Formulário validado. Para salvar no sistema, ainda precisamos conectar o endpoint de atualização de perfil da API.",
    );
  }

  const usuarioComDados = usuario as typeof usuario & {
    siape?: string;
    criadoEm?: string;
    dataCriacao?: string;
    nomeSocial?: string;
  };
  const criadoEm = usuarioComDados.criadoEm ?? usuarioComDados.dataCriacao;

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
            <Avatar nome={nome || usuario.nome} tamanho={56} />
            <div className="perfil-identidade__texto">
              <h2>{nome || usuario.nome}</h2>
              <p>{usuario.email}</p>
            </div>
          </div>

          <div className="perfil-divisor" />

          <dl className="perfil-detalhes">
            <div>
              <dt>SIAPE</dt>
              <dd>{usuarioComDados.siape || "Não informado"}</dd>
            </div>
            <div>
              <dt>Cargos</dt>
              <dd className="perfil-cargos">
                {usuario.cargos?.length
                  ? usuario.cargos.map((cargo) => <span key={cargo}>{cargo}</span>)
                  : <span>{papel}</span>}
              </dd>
            </div>
            <div>
              <dt>Conta criada em</dt>
              <dd>
                {criadoEm
                  ? new Date(criadoEm).toLocaleDateString("pt-BR")
                  : "Não informado"}
              </dd>
            </div>
          </dl>
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
              <button type="submit" className="perfil-botao">
                <Icone nome="check" tamanho={18} />
                Salvar alterações
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
