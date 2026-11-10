"use client";

import { useState, type FormEvent } from "react";
import { useSessao } from "../../components/layout/SessaoContext";
import { Avatar } from "../../components/ui/Avatar";
import { Icone } from "../../components/ui/Icone";

export function PerfilPage() {
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
    <main className="flex flex-col gap-[18px] px-8 py-7 max-[560px]:px-4 max-[560px]:py-[22px]">
      <div>
        <div>
          <h1 className="m-0 font-titulo text-[26px] font-semibold leading-[1.2] tracking-[-0.02em]">Perfil</h1>
          <p className="mt-1.5 text-sm text-texto-2">Seus dados e sua senha de acesso.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 min-[901px]:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-[11px] border border-borda bg-cartao p-5 max-[560px]:p-4" aria-label="Resumo do perfil">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar nome={nome || usuario.nome} tamanho={56} />
            <div className="min-w-0">
              <h2 className="m-0 font-titulo text-[17px] font-semibold leading-[1.3]">{nome || usuario.nome}</h2>
              <p className="mt-[3px] text-[13px] text-texto-2 [overflow-wrap:anywhere]">{usuario.email}</p>
            </div>
          </div>

          <div className="my-4 h-px bg-borda" />

          <dl className="m-0 flex flex-col gap-[13px] [&_dt]:mb-0.5 [&_dt]:text-xs [&_dt]:text-texto-2 [&_dd]:m-0 [&_dd]:font-mono [&_dd]:text-[13px] [&_dd]:font-medium [&_dd]:leading-normal [&_dd]:text-texto">
            <div>
              <dt>SIAPE</dt>
              <dd>{usuarioComDados.siape || "Não informado"}</dd>
            </div>
            <div>
              <dt>Cargos</dt>
              <dd className="flex flex-wrap gap-1.5 [&_span]:rounded-[5px] [&_span]:bg-acento/10 [&_span]:px-2 [&_span]:py-[3px] [&_span]:font-mono [&_span]:text-[11px] [&_span]:font-medium [&_span]:leading-[1.4] [&_span]:text-acento">
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

        <section className="min-w-0 rounded-[11px] border border-borda bg-cartao p-5 max-[560px]:p-4">
          <form onSubmit={salvar}>
            <h2 className="mb-3.5 font-titulo text-[15px] font-semibold leading-[1.3]">Editar perfil</h2>

            <div className="grid grid-cols-1 gap-3 min-[561px]:grid-cols-2 min-[561px]:gap-4">
              <label className="flex min-w-0 flex-col gap-[5px] text-[13px] font-medium text-texto [&_small]:text-xs [&_small]:font-normal [&_small]:text-texto-2">
                <span>Nome</span>
                <input
                  className="h-[42px] w-full min-w-0 rounded-lg border border-borda bg-fundo px-3 text-sm text-texto outline-none transition-[border-color,box-shadow] placeholder:text-texto-3 focus:border-link focus:shadow-[0_0_0_3px_rgba(217,119,6,0.14)]"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="flex min-w-0 flex-col gap-[5px] text-[13px] font-medium text-texto [&_small]:text-xs [&_small]:font-normal [&_small]:text-texto-2">
                <span>Nome social <small>(opcional)</small></span>
                <input
                  className="h-[42px] w-full min-w-0 rounded-lg border border-borda bg-fundo px-3 text-sm text-texto outline-none transition-[border-color,box-shadow] placeholder:text-texto-3 focus:border-link focus:shadow-[0_0_0_3px_rgba(217,119,6,0.14)]"
                  value={nomeSocial}
                  onChange={(evento) => setNomeSocial(evento.target.value)}
                  placeholder="Como prefere ser chamado(a)"
                  autoComplete="nickname"
                />
              </label>
            </div>

            <div className="my-4 h-px bg-borda" />

            <h2 className="mb-3.5 font-titulo text-[15px] font-semibold leading-[1.3]">Trocar senha</h2>
            <div className="grid grid-cols-1 gap-3 min-[561px]:grid-cols-2 min-[561px]:gap-4">
              <label className="flex min-w-0 flex-col gap-[5px] text-[13px] font-medium text-texto [&_small]:text-xs [&_small]:font-normal [&_small]:text-texto-2">
                <span>Nova senha</span>
                <span className="relative block">
                  <input
                    className="h-[42px] w-full min-w-0 rounded-lg border border-borda bg-fundo px-3 text-sm text-texto outline-none transition-[border-color,box-shadow] placeholder:text-texto-3 focus:border-link focus:shadow-[0_0_0_3px_rgba(217,119,6,0.14)] pr-[42px]"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    autoComplete="new-password"
                    placeholder="Digite uma nova senha"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 grid size-[30px] -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-texto-2 hover:bg-black/5 dark:hover:bg-white/[0.07]"
                    onClick={() => setMostrarSenha((valor) => !valor)}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <Icone nome={mostrarSenha ? "visibility_off" : "visibility"} />
                  </button>
                </span>
              </label>

              <label className="flex min-w-0 flex-col gap-[5px] text-[13px] font-medium text-texto [&_small]:text-xs [&_small]:font-normal [&_small]:text-texto-2">
                <span>Confirmar nova senha</span>
                <span className="relative block">
                  <input
                    className="h-[42px] w-full min-w-0 rounded-lg border border-borda bg-fundo px-3 text-sm text-texto outline-none transition-[border-color,box-shadow] placeholder:text-texto-3 focus:border-link focus:shadow-[0_0_0_3px_rgba(217,119,6,0.14)] pr-[42px]"
                    type={mostrarConfirmacao ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(evento) => setConfirmarSenha(evento.target.value)}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 grid size-[30px] -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-texto-2 hover:bg-black/5 dark:hover:bg-white/[0.07]"
                    onClick={() => setMostrarConfirmacao((valor) => !valor)}
                    aria-label={mostrarConfirmacao ? "Ocultar confirmação" : "Mostrar confirmação"}
                  >
                    <Icone nome={mostrarConfirmacao ? "visibility_off" : "visibility"} />
                  </button>
                </span>
              </label>
            </div>
            <p className="mt-1.5 text-xs text-texto-2">Mínimo de 8 caracteres.</p>

            {erro && <p className="mt-3 rounded-[7px] border border-[#e5b4b4] bg-[#fff4f4] px-[11px] py-[9px] text-xs text-[#a32121]" role="alert">{erro}</p>}
            {mensagem && <p className="mt-3 rounded-[7px] border border-[#e9c99c] bg-[#fff8ed] px-[11px] py-[9px] text-xs text-[#85500b]" role="status">{mensagem}</p>}

            <div className="mt-3.5 flex justify-end max-[560px]:w-full max-[560px]:[&>button]:w-full">
              <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-acento bg-acento px-4 text-[13px] font-semibold text-white hover:bg-[#a9360a]">
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
