"use client";

import { useEffect, useMemo, useState } from "react";
import type { Cargo, UsuarioLista } from "../../types";
import { buscarUsuarios, concederCargo } from "../../lib/api";
import { formatarNumero } from "../../lib/formatadores";
import { Avatar } from "../../components/ui/Avatar";
import { Icone } from "../../components/ui/Icone";
import "./usuarios.css";

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
    <div className="pagina">
      <h1 className="usr__titulo">Usuários</h1>
      <p className="usr__sub">
        {formatarNumero(usuarios.length)}{" "}
        {usuarios.length === 1 ? "usuário" : "usuários"}
      </p>

      <div className="usr__filtros">
        <div className="usr__busca-container">
          <Icone nome="search" tamanho={18} />
          <input
            className="usr__busca"
            placeholder="Buscar por nome ou e-mail"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <select
          className="usr__select"
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

      {carregando && <p className="usr__vazio">Carregando usuários…</p>}
      {erro && (
        <p className="usr__vazio" role="alert">
          Não foi possível carregar os usuários: {erro}
        </p>
      )}

      {!carregando && !erro && (
        <div className="usr__tabela">
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
                      <span className="usr__nome">
                        <Avatar nome={u.nome} tamanho={28} />
                        {u.nome}
                      </span>
                    </td>
                    <td className="usr__mono">{u.emailInstitucional}</td>
                    <td>
                      {cargos.map((c) => (
                        <span
                          key={c}
                          className={`usr__tag${c === "ADMIN" || c === "DEPPI" ? " usr__tag--dest" : ""}`}
                        >
                          {c}
                        </span>
                      ))}
                    </td>
                    <td className="usr__mono">
                      {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="usr__acao">
                      {!cargos.includes("ADMIN") && (
                        <button
                          className="botao-secundario"
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
                  <td colSpan={5} className="usr__vazio">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="usr__rodape">
            <span>
              Mostrando {visiveis.length} de {formatarNumero(filtrados.length)}
            </span>
            <span className="usr__pag">
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
        <div className="usr__fundo" onClick={() => !salvando && setAlvo(null)}>
          <div className="usr__modal" onClick={(e) => e.stopPropagation()}>
            <h2>Conceder cargo</h2>
            <p className="usr__sub">
              Escolha o cargo para <strong>{alvo.nome}</strong>. Os cargos
              atuais são mantidos.
            </p>

            {(["DEPPI", "ADMIN"] as const).map((c) => { //Renderiza as opções de cargo no modal
              const jaTem = alvo.cargos.some((x) => x.cargo === c);
              return (
                <label
                  key={c}
                  className={`usr__opcao${escolha === c ? " usr__opcao--sel" : ""}${jaTem ? " usr__opcao--off" : ""}`}
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

            <p className="usr__aviso">
              <Icone nome="warning" tamanho={16} /> Esta ação não pode ser
              desfeita pela interface.
            </p>
            {erroModal && (
              <p className="usr__erro" role="alert">
                {erroModal}
              </p>
            )}

            <div className="usr__botoes">
              <button
                className="botao-secundario usr__cancelar"
                disabled={salvando}
                onClick={() => setAlvo(null)}
              >
                Cancelar
              </button>
              <button
                className="usr__confirmar"
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