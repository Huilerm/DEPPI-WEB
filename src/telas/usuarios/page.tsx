"use client";

import { useEffect, useMemo, useState } from "react";
import type { Cargo, UsuarioLista } from "../../types";
import { buscarUsuarios, concederCargo } from "../../lib/api";
import { formatarNumero } from "../../lib/formatadores";
import { Avatar } from "../../components/ui/Avatar";
import { Icone } from "../../components/ui/Icone";

const POR_PAGINA = 8;
const CARGOS: Cargo[] = ["ALUNO", "PROFESSOR", "DEPPI", "ADMIN"];
const DESCRICAO = {
  DEPPI: "Analisa inscrições e gerencia cursos e professores.",
  ADMIN: "Gerencia instituições, usuários e relatórios.",
} as const;

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Cargo | "">("");
  const [pagina, setPagina] = useState(1);
  const [alvo, setAlvo] = useState<UsuarioLista | null>(null);
  const [escolha, setEscolha] = useState<"DEPPI" | "ADMIN">("DEPPI");
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  useEffect(() => { //Busca os usuários ao carregar a página
    buscarUsuarios()
      .then(setUsuarios)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();

    return usuarios.filter((u) => {
      const correspondeBusca =
        !t ||
        u.nome.toLowerCase().includes(t) ||
        u.emailInstitucional.split("@")[0].toLowerCase().includes(t);

      const correspondeFiltro =
        !filtro || u.cargos.some((c) => c.cargo === filtro);

      return correspondeBusca && correspondeFiltro;
    });
  }, [usuarios, busca, filtro]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA,
  );

  function abrir(u: UsuarioLista) { //Abre o modal para conceder cargo a um usuário
    setEscolha(u.cargos.some((c) => c.cargo === "DEPPI") ? "ADMIN" : "DEPPI");
    setErroModal(null);
    setAlvo(u);
  }

  async function confirmar() {
    if (!alvo) return;
    setSalvando(true);
    setErroModal(null);
    try {
      await concederCargo(alvo.id, escolha); //Envia ID do usuário e o cargo a ser concedido, ou seja, envia a alteração para a API
      setUsuarios((lista) =>
        lista.map((u) =>
          u.id === alvo.id
            ? { ...u, cargos: [...u.cargos, { cargo: escolha }] }
            : u,
        ),
      );
      setAlvo(null);
    } catch (e) {
      setErroModal((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-7">
      <h1 className="m-0 font-titulo text-[28px]">Usuários</h1>
      <p className="m-0 text-sm text-texto-3">
        {formatarNumero(usuarios.length)}{" "}
        {usuarios.length === 1 ? "usuário" : "usuários"}
      </p>

      <div className="m-0 flex gap-3">
        <div className="relative flex flex-1 items-center">
          <Icone nome="search" tamanho={18} className="pointer-events-none absolute left-3 text-[#888]" />
          <input
            className="h-10 w-full min-w-0 flex-1 rounded-[10px] border border-borda bg-cartao pl-[38px] pr-3 text-texto"
            placeholder="Buscar por nome ou e-mail"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <select
          className="h-10 w-[140px] flex-shrink-0 rounded-[10px] border border-borda bg-cartao px-3 text-texto seta-select"
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value as Cargo | "");
            setPagina(1);
          }}
        >
          <option value="">Cargo: Todos</option>
          {CARGOS.map((c) => (
            <option key={c} value={c}>
              Cargo: {c}
            </option>
          ))}
        </select>
      </div>

      {carregando && <p className="p-6 text-center text-texto-3">Carregando usuários…</p>}
      {erro && (
        <p className="p-6 text-center text-texto-3" role="alert">
          Não foi possível carregar os usuários: {erro}
        </p>
      )}

      {!carregando && !erro && (
        <div className="overflow-x-auto rounded-xl border border-borda bg-cartao [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:bg-sidebar [&_th]:px-[18px] [&_th]:py-3 [&_th]:text-left [&_th]:font-medium [&_th]:text-texto-3 [&_td]:border-t [&_td]:border-borda [&_td]:px-[18px] [&_td]:py-2.5">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cargos</th>
                <th>Criado em</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visiveis.map((u) => {
                const cargos = u.cargos.map((c) => c.cargo);
                return (
                  <tr key={u.id}>
                    <td>
                      <span className="flex items-center gap-3 font-medium">
                        <Avatar nome={u.nome} tamanho={28} />
                        {u.nome}
                      </span>
                    </td>
                    <td className="font-mono text-[13px]">{u.emailInstitucional}</td>
                    <td>
                      {cargos.map((c) => (
                        <span
                          key={c}
                          className={`mr-1.5 inline-block rounded px-2 py-0.5 font-mono text-[11px] ${c === "ADMIN" || c === "DEPPI" ? "bg-[#fdeee6] text-acento" : "bg-trilho"}`}
                        >
                          {c}
                        </span>
                      ))}
                    </td>
                    <td className="font-mono text-[13px]">
                      {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="text-right">
                      {!cargos.includes("ADMIN") && (
                        <button
                          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-borda bg-cartao px-[18px] text-[13px] font-medium text-texto transition-colors hover:bg-sidebar"
                          onClick={() => abrir(u)}
                        >
                          <Icone nome="shield_person" tamanho={18} />
                          Conceder cargo
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-texto-3">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-borda bg-sidebar px-[18px] py-3 text-[13px] text-texto-3">
            <span>
              Mostrando {visiveis.length} de {formatarNumero(filtrados.length)}
            </span>
            <span className="flex items-center gap-2.5 font-mono [&_button]:size-7 [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:border [&_button]:border-borda [&_button]:bg-cartao [&_button]:text-texto [&_button:disabled]:cursor-default [&_button:disabled]:opacity-40">
              <button
                disabled={paginaAtual <= 1}
                onClick={() => setPagina(paginaAtual - 1)}
                aria-label="Página anterior"
              >
                ‹
              </button>
              {paginaAtual} / {totalPaginas}
              <button
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPagina(paginaAtual + 1)}
                aria-label="Próxima página"
              >
                ›
              </button>
            </span>
          </div>
        </div>
      )}

      {alvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={() => !salvando && setAlvo(null)}>
          <div className="w-[min(480px,92vw)] rounded-[14px] bg-cartao p-[22px] [&_h2]:m-0 [&_h2]:font-titulo [&_h2]:text-xl" onClick={(e) => e.stopPropagation()}>
            <h2>Conceder cargo</h2>
            <p className="m-0 text-sm text-texto-3">
              Escolha o cargo para <strong>{alvo.nome}</strong>. Os cargos
              atuais são mantidos.
            </p>

            {(["DEPPI", "ADMIN"] as const).map((c) => { //Renderiza as opções de cargo no modal
              const jaTem = alvo.cargos.some((x) => x.cargo === c);
              return (
                <label
                  key={c}
                  className={`mb-2.5 flex items-start gap-3 rounded-[10px] border px-3.5 py-3 [&_small]:text-texto-3 ${escolha === c ? "border-acento bg-[#fff3ec]" : "border-borda"} ${jaTem ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="radio"
                    name="cargo"
                    checked={escolha === c}
                    disabled={jaTem}
                    onChange={() => setEscolha(c)}
                  />
                  <span>
                    <strong>{c}</strong>
                    {jaTem && " (já possui)"}
                    <br />
                    <small>{DESCRICAO[c]}</small>
                  </span>
                </label>
              );
            })}

            <p className="flex items-center gap-2 rounded-lg border border-[#fed7aa] bg-[#fff3e6] px-3 py-2.5 text-[13px] text-[#9a3412]">
              <Icone nome="warning" tamanho={16} /> Esta ação não pode ser
              desfeita pela interface.
            </p>
            {erroModal && (
              <p className="text-[13px] text-[#c0392b]" role="alert">
                {erroModal}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2.5">
              <button
                className="h-[38px] cursor-pointer rounded-lg border border-borda bg-cartao px-4 font-medium text-texto transition-colors hover:bg-sidebar disabled:cursor-default disabled:opacity-50"
                disabled={salvando}
                onClick={() => setAlvo(null)}
              >
                Cancelar
              </button>
              <button
                className="h-[38px] cursor-pointer rounded-lg border-0 bg-acento px-4 font-semibold text-white disabled:cursor-default disabled:opacity-50"
                disabled={
                  salvando || alvo.cargos.some((x) => x.cargo === escolha)
                }
                onClick={confirmar}
              >
                {salvando ? "Salvando…" : `Conceder ${escolha}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}