"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Professor } from "../../types";
import { buscarProfessores } from "../../services/professorService";
import { Icone } from "../../components/ui/Icone";
import { Avatar } from "../../components/ui/Avatar";
import { AVISO_ERRO, BTN, BTN_PRIM, CAMPO_SELECT, PAGINA, TOPO } from "../../components/ui/estilos";
import { TITULACOES } from "./util";

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const TABELA =
  "w-full border-collapse text-left text-[13px] max-[760px]:min-w-[640px] [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-borda [&_th]:bg-trilho [&_th]:px-[17px] [&_th]:py-2.5 [&_th]:text-[11px] [&_th]:font-medium [&_th]:text-texto-2 [&_td]:border-b [&_td]:border-borda [&_td]:px-[17px] [&_td]:py-[14px] [&_td]:align-middle [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover]:bg-trilho/40";

export function ProfessoresPage() {
  const router = useRouter();
  const [lista, setLista] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [termo, setTermo] = useState("");
  const [titulacao, setTitulacao] = useState("");

  function carregar() {
    setCarregando(true);
    setErro(null);
    buscarProfessores()
      .then(setLista)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const b = normalizar(termo.trim());
    return lista.filter(
      (p) =>
        (!titulacao || p.titulacao === titulacao) &&
        (!b ||
          [p.usuario.nome, p.siape, p.usuario.emailInstitucional].some((v) =>
            normalizar(v ?? "").includes(b)
          ))
    );
  }, [lista, termo, titulacao]);

  return (
    <main className={PAGINA}>
      <div className={TOPO}>
        <div>
          <h1>Professores</h1>
          <p>
            {lista.length} {lista.length === 1 ? "professor" : "professores"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex h-[42px] min-w-[240px] flex-1 items-center gap-2.5 rounded-lg border border-borda bg-cartao px-3 text-texto-3 focus-within:border-link">
          <Icone nome="search" tamanho={19} />
          <input
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por nome ou SIAPE"
            aria-label="Buscar por nome ou SIAPE"
            className="w-full min-w-0 border-0 bg-transparent text-sm text-texto outline-0"
          />
        </label>
        <div className="w-[210px] flex-none">
          <select
            className={CAMPO_SELECT}
            value={titulacao}
            onChange={(e) => setTitulacao(e.target.value)}
            aria-label="Filtrar por titulação"
          >
            <option value="">Titulação: Todas</option>
            {TITULACOES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {erro && (
        <div className={AVISO_ERRO} role="alert">
          <Icone nome="error" tamanho={18} />
          <span>{erro}</span>
          <button className={`${BTN} ml-auto`} onClick={carregar}>Tentar novamente</button>
        </div>
      )}

      <section className="min-w-0 overflow-hidden rounded-xl border border-borda bg-cartao">
        {carregando ? (
          <div className="grid min-h-[200px] place-items-center text-[13px] text-texto-2">
            Carregando professores...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="grid min-h-[200px] place-items-center text-[13px] text-texto-2">
            {lista.length === 0 ? "Nenhum professor cadastrado." : "Nenhum professor encontrado."}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className={TABELA}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>SIAPE</th>
                  <th>E-mail institucional</th>
                  <th>Titulação</th>
                  <th>PGD</th>
                  <th aria-label="Abrir" className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/professores/${p.id}`)}
                  >
                    <td>
                      <Link
                        href={`/professores/${p.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 font-medium"
                      >
                        <Avatar nome={p.usuario.nome} tamanho={26} />
                        {p.usuario.nome}
                      </Link>
                    </td>
                    <td className="font-mono text-xs">{p.siape}</td>
                    <td className="text-texto-2">{p.usuario.emailInstitucional}</td>
                    <td>{p.titulacao ?? "—"}</td>
                    <td>
                      {p.emPGD ? (
                        <span className="inline-flex items-center gap-1.5 text-[#166534]">
                          <Icone nome="check_circle" tamanho={16} /> Sim
                        </span>
                      ) : (
                        <span className="text-texto-2">— Não</span>
                      )}
                    </td>
                    <td className="text-texto-3">
                      <Icone nome="chevron_right" tamanho={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}