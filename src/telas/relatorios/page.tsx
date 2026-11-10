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

const ICONE_STATUS =
    "flex size-[18px] flex-none items-center justify-center";

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
        <div className="flex flex-col gap-6 px-8 py-7">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-titulo text-[28px] font-bold leading-[1.2] tracking-[-0.01em]">Relatórios</h1>
                    <p className="mt-1 text-texto-2">
                        {resumo
                            ? `Gerado em ${new Date(resumo.geradoEm).toLocaleString("pt-BR")}`
                            : "—"}
                    </p>
                </div>
                <div className="flex gap-2.5">
                    <button
                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-borda bg-cartao px-4 text-sm font-medium text-texto hover:bg-trilho"
                        onClick={carregar}
                        disabled={carregando}
                        aria-label="Atualizar"
                    >
                        <Icone nome="refresh" tamanho={18} />
                    </button>
                    <button className="flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-acento px-4 font-semibold text-white disabled:opacity-60" onClick={baixar} disabled={exportando}>
                        <Icone nome="download" tamanho={18} />
                        {exportando ? "Exportando…" : "Exportar CSV"}
                    </button>
                </div>
            </div>

            {carregando && <p className="text-xs text-texto-3">Carregando relatórios…</p>}
            {erro && (
                <p className="text-xs text-texto-3" role="alert">
                    Erro: {erro}
                </p>
            )}

            {resumo && (
                <>
                    <section className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-px overflow-hidden rounded-[10px] border border-borda bg-borda">
                        {cards.map(([rotulo, valor]) => (
                            <div key={rotulo} className="flex flex-col gap-0.5 bg-cartao px-[18px] pb-4 pt-3.5">
                                <span className="text-xs text-texto-2">{rotulo}</span>
                                <span
                                    className={`font-titulo text-[28px] font-bold leading-[1.2] tracking-[-0.02em]${rotulo === "Vagas restantes" ? " text-acento" : ""}`}
                                >
                                    {formatarNumero(valor ?? 0)}
                                </span>
                            </div>
                        ))}
                    </section>

                    <div className="grid grid-cols-1 gap-4 min-[961px]:grid-cols-[1.3fr_1fr]">
                        <section className="rounded-xl border border-borda bg-cartao px-6 py-[22px]">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="font-titulo text-base font-semibold">Inscrições por situação</h2>
                            </div>
                            <div className="flex flex-col gap-3.5">
                                {ORDEM_INSCRICAO.map((s) => {
                                    const q = quantidade(resumo.inscricoesPorSituacao, s);
                                    const info = INSCRICOES[s];
                                    return (
                                        <div key={s} className="grid grid-cols-[110px_1fr_56px] items-center gap-4">
                                            <span
                                                className="flex items-center gap-2"
                                                style={{ color: info.cor }}
                                            >
                                                <span className={ICONE_STATUS}>
                                                    <Icone nome={info.icone} tamanho={18} />
                                                </span>

                                                {info.rotulo}
                                            </span>
                                            <div className="h-6 overflow-hidden rounded-[5px] bg-trilho">
                                                <div
                                                    className="h-full rounded-[5px]"
                                                    style={{
                                                        width: `${(q / maior) * 100}%`,
                                                        background: info.cor,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-right font-mono text-[13px] font-medium">{formatarNumero(q)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-xl border border-borda bg-cartao px-6 py-[22px]">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="font-titulo text-base font-semibold">Cursos por situação</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-8">
                                <Rosca
                                    centro={resumo.totais.cursos}
                                    fatias={ORDEM_CURSO.map((s) => ({
                                        cor: ROSCA_CORES[s],
                                        valor: quantidade(resumo.cursosPorSituacao, s),
                                    }))}
                                />
                                <div className="flex min-w-[150px] flex-1 flex-col gap-3.5">
                                    {ORDEM_CURSO.map((s) => {
                                        const info = CURSOS[s];
                                        return (
                                            <div
                                                key={s}
                                                className="flex items-center gap-2"
                                                style={{ color: info.cor }}
                                            >
                                                <span className={ICONE_STATUS}>
                                                    <Icone nome={info.icone} tamanho={18} />
                                                </span>

                                                <span>{info.rotulo}</span>
                                                <span
                                                    className="text-right font-mono text-[13px] font-medium text-texto"
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

                    <div className="overflow-x-auto rounded-xl border border-borda bg-cartao [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:px-[18px] [&_th]:py-3 [&_th]:text-left [&_th]:font-medium [&_th]:text-texto-3 [&_td]:border-t [&_td]:border-borda [&_td]:px-[18px] [&_td]:py-3">
                        <table>
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Status</th>
                                    <th className="text-right!">Inscritos ↓</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.nome}</td>
                                        <td style={{ color: CURSOS[c.status].cor }}>
                                            <span className="inline-flex items-center gap-2">
                                                <span className={ICONE_STATUS}>
                                                    <Icone nome={CURSOS[c.status].icone} tamanho={18} />
                                                </span>

                                                {CURSOS[c.status].rotulo}
                                            </span>
                                        </td>
                                        <td className="text-right! font-mono text-[13px] font-medium">
                                            {formatarNumero(c._count.inscricao)}
                                        </td>
                                    </tr>
                                ))}
                                {cursos.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center text-texto-3">
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