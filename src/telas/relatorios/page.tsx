"use client";

import { useEffect, useState } from "react";
import type { CursoRelatorio, ResumoSistema } from "../../types";
import {
    buscarCursosRelatorio,
    buscarResumoSistema,
    exportarCsv, //Importação da função exportarCsv do arquivo api.ts
} from "../../lib/api";
import { formatarNumero } from "../../lib/formatadores";
import { Icone } from "../../components/ui/Icone";
import {
    CURSOS,
    INSCRICOES,
    ORDEM_CURSO,
    ORDEM_INSCRICAO,
    ROSCA_CORES,
    Rosca,
    quantidade,
} from "../inicio/admin/page";
import "../inicio/admin/inicio-admin.css";
import "./relatorios.css";

export function RelatoriosPage() {
    const [resumo, setResumo] = useState<ResumoSistema | null>(null);
    const [cursos, setCursos] = useState<CursoRelatorio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [exportando, setExportando] = useState(false);

    async function carregar() { //Atualiza os dados do relatório
        setCarregando(true);
        setErro(null);
        try {
            const [r, c] = await Promise.all([
                buscarResumoSistema(),
                buscarCursosRelatorio(),
            ]);
            setResumo(r);
            setCursos([...c].sort((a, b) => b._count.inscricao - a._count.inscricao));
        } catch (e) {
            setErro((e as Error).message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    async function baixar() { //Baixa o relatório em CSV
        setExportando(true);
        try {
            await exportarCsv();
        } catch (e) {
            setErro((e as Error).message);
        } finally {
            setExportando(false);
        }
    }

    const t = resumo?.totais;
    const cards: [string, number | undefined][] = [
        ["Usuários", t?.usuarios],
        ["Alunos", t?.alunos],
        ["Professores", t?.professores],
        ["Cursos", t?.cursos],
        ["Inscrições", t?.inscricoes],
        ["Instituições", t?.instituicoes],
        ["Vagas restantes", t?.vagasRestantes],
    ];

    const maior = Math.max(
        1,
        ...ORDEM_INSCRICAO.map((s) =>
            quantidade(resumo?.inscricoesPorSituacao ?? [], s),
        ),
    );

    return (
        <div className="pagina">
            <div className="saudacao">
                <div>
                    <h1 className="saudacao__titulo">Relatórios</h1>
                    <p className="saudacao__data">
                        {resumo
                            ? `Gerado em ${new Date(resumo.geradoEm).toLocaleString("pt-BR")}`
                            : "—"}
                    </p>
                </div>
                <div className="rel__acoes">
                    <button
                        className="botao-secundario"
                        onClick={carregar}
                        disabled={carregando}
                        aria-label="Atualizar"
                    >
                        <Icone nome="refresh" tamanho={18} />
                    </button>
                    <button className="rel__csv" onClick={baixar} disabled={exportando}>
                        <Icone nome="download" tamanho={18} />
                        {exportando ? "Exportando…" : "Exportar CSV"}
                    </button>
                </div>
            </div>

            {carregando && <p className="aviso-exemplo">Carregando relatórios…</p>}
            {erro && (
                <p className="aviso-exemplo" role="alert">
                    Erro: {erro}
                </p>
            )}

            {resumo && (
                <>
                    <section className="resumo">
                        {cards.map(([rotulo, valor]) => (
                            <div key={rotulo} className="resumo__item">
                                <span className="resumo__rotulo">{rotulo}</span>
                                <span
                                    className={`resumo__valor${rotulo === "Vagas restantes" ? " resumo__valor--destaque" : ""}`}
                                >
                                    {formatarNumero(valor ?? 0)}
                                </span>
                            </div>
                        ))}
                    </section>

                    <div className="graficos">
                        <section className="cartao">
                            <div className="cartao__cabecalho">
                                <h2 className="cartao__titulo">Inscrições por situação</h2>
                            </div>
                            <div className="barras">
                                {ORDEM_INSCRICAO.map((s) => {
                                    const q = quantidade(resumo.inscricoesPorSituacao, s);
                                    const info = INSCRICOES[s];
                                    return (
                                        <div key={s} className="barra">
                                            <span
                                                className="barra__rotulo"
                                                style={{ color: info.cor }}
                                            >
                                                <Icone nome={info.icone} />
                                                {info.rotulo}
                                            </span>
                                            <div className="barra__trilho">
                                                <div
                                                    className="barra__preenchimento"
                                                    style={{
                                                        width: `${(q / maior) * 100}%`,
                                                        background: info.cor,
                                                    }}
                                                />
                                            </div>
                                            <span className="numero">{formatarNumero(q)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="cartao">
                            <div className="cartao__cabecalho">
                                <h2 className="cartao__titulo">Cursos por situação</h2>
                            </div>
                            <div className="rosca-bloco">
                                <Rosca
                                    centro={resumo.totais.cursos}
                                    fatias={ORDEM_CURSO.map((s) => ({
                                        cor: ROSCA_CORES[s],
                                        valor: quantidade(resumo.cursosPorSituacao, s),
                                    }))}
                                />
                                <div className="legenda">
                                    {ORDEM_CURSO.map((s) => {
                                        const info = CURSOS[s];
                                        return (
                                            <div
                                                key={s}
                                                className="legenda__linha"
                                                style={{ color: info.cor }}
                                            >
                                                <Icone nome={info.icone} />
                                                <span className="legenda__rotulo">{info.rotulo}</span>
                                                <span
                                                    className="numero"
                                                    style={{ color: "var(--texto)" }}
                                                >
                                                    {formatarNumero(
                                                        quantidade(resumo.cursosPorSituacao, s),
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="rel__tabela">
                        <table>
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Status</th>
                                    <th className="rel__dir">Inscritos ↓</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.nome}</td>
                                        <td style={{ color: CURSOS[c.status].cor }}>
                                            <Icone nome={CURSOS[c.status].icone} />{" "}
                                            {CURSOS[c.status].rotulo}
                                        </td>
                                        <td className="rel__dir numero">
                                            {formatarNumero(c._count.inscricao)}
                                        </td>
                                    </tr>
                                ))}
                                {cursos.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="rel__vazio">
                                            Nenhum curso cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}