"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent
} from "react";

import type { Instituicao } from "../../types";

import { Icone } from "../../components/ui/Icone";

import {
    buscarInstituicoes,
    criarInstituicao,
    atualizarInstituicao,
    excluirInstituicao
} from "../../lib/api";


type FormularioInstituicao = Pick<
    Instituicao,
    "nome" | "cidade" | "campus" | "cnpj"
>;

const FORM_VAZIO: FormularioInstituicao = {
    nome: "",
    cidade: "",
    campus: "",
    cnpj: ""
};

function mascararCnpj(valor: string) {
    const n = valor.replace(/\D/g, "").slice(0, 14);

    return n
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

export function InstituicoesPage() {
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [termo, setTermo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState<Instituicao | null>(null);
    const [confirmarExclusao, setConfirmarExclusao] =
        useState<Instituicao | null>(null);
    const [formulario, setFormulario] =
        useState<FormularioInstituicao>(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [mensagem, setMensagem] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            setInstituicoes(await buscarInstituicoes());
        } catch (e) {
            setErro(
                e instanceof Error
                    ? e.message
                    : "Não foi possível carregar as instituições."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const filtradas = useMemo(() => {
        const busca = termo.trim().toLocaleLowerCase("pt-BR");

        if (!busca) return instituicoes;

        return instituicoes.filter((i) =>
            [i.nome, i.campus, i.cidade, i.cnpj].some((v) =>
                (v || "").toLocaleLowerCase("pt-BR").includes(busca)
            )
        );
    }, [instituicoes, termo]);

    function abrirCadastro() {
        setEditando(null);
        setFormulario(FORM_VAZIO);
        setErro(null);
        setModalAberto(true);
    }

    function abrirEdicao(i: Instituicao) {
        setEditando(i);

        setFormulario({
            nome: i.nome,
            campus: i.campus,
            cidade: i.cidade,
            cnpj: i.cnpj || ""
        });

        setErro(null);
        setModalAberto(true);
    }

    async function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        setErro(null);
        setMensagem(null);

        if (formulario.cnpj.replace(/\D/g, "").length !== 14) {
            setErro("CNPJ incompleto — informe os 14 dígitos.");
            return;
        }

        setSalvando(true);

        try {
            const dados = {
                ...formulario,
                cnpj: mascararCnpj(formulario.cnpj)
            };

            if (editando) {
                await atualizarInstituicao(editando.id, dados);
            } else {
                await criarInstituicao(dados);
            }

            setModalAberto(false);

            setMensagem(
                editando
                    ? "Instituição atualizada com sucesso."
                    : "Instituição cadastrada com sucesso."
            );

            await carregar();
        } catch (e) {
            setErro(
                e instanceof Error
                    ? e.message
                    : "Não foi possível salvar a instituição."
            );
        } finally {
            setSalvando(false);
        }
    }

    async function remover() {
        if (!confirmarExclusao) return;

        setExcluindo(true);
        setErro(null);
        setMensagem(null);

        try {
            await excluirInstituicao(confirmarExclusao.id);

            setInstituicoes((lista) =>
                lista.filter((i) => i.id !== confirmarExclusao.id)
            );

            setConfirmarExclusao(null);
            setMensagem("Instituição excluída com sucesso.");
        } catch (e) {
            setErro(
                e instanceof Error
                    ? e.message
                    : "Não foi possível excluir a instituição."
            );
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <main className="flex flex-col gap-[18px] px-8 py-7 max-[760px]:px-4 max-[760px]:py-[22px]">
            <div className="flex items-center justify-between gap-5 max-[760px]:items-start [&_h1]:font-titulo [&_h1]:text-[clamp(25px,2.2vw,30px)] [&_h1]:font-bold [&_h1]:leading-[1.2] [&_h1]:tracking-[-0.03em] [&_p]:mt-[5px] [&_p]:text-[13px] [&_p]:text-texto-2">
                <div>
                    <h1>Instituições</h1>

                    <p>
                        {instituicoes.length}{" "}
                        {instituicoes.length === 1
                            ? "instituição cadastrada"
                            : "instituições cadastradas"}
                    </p>
                </div>

                <button
                    className="inline-flex min-h-[39px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold disabled:cursor-wait disabled:opacity-65 border-acento bg-acento text-white hover:bg-[#9a3412] max-[760px]:min-h-[38px] max-[760px]:px-2.5 max-[760px]:text-xs"
                    onClick={abrirCadastro}
                >
                    <Icone nome="add" tamanho={18} />
                    Nova instituição
                </button>
            </div>

            <label className="flex min-h-[38px] w-full items-center gap-2.5 rounded-lg border border-borda bg-cartao px-3 text-texto-3 focus-within:border-link focus-within:shadow-[0_0_0_3px_#d977061a] [&_input]:w-full [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:text-xs [&_input]:text-texto [&_input]:outline-0 [&_input]:placeholder:text-[#77736e] [&_button]:grid [&_button]:cursor-pointer [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-[3px]">
                <Icone nome="search" tamanho={19} />

                <input
                    type="search"
                    placeholder="Buscar por nome, campus ou cidade"
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    aria-label="Buscar por nome, campus ou cidade"
                />

                {termo && (
                    <button
                        type="button"
                        onClick={() => setTermo("")}
                        aria-label="Limpar pesquisa"
                    >
                        <Icone nome="close" />
                    </button>
                )}
            </label>

            {mensagem && (
                <div
                    className="flex items-center gap-[9px] rounded-[7px] border px-3 py-2.5 text-xs [&_button]:ml-auto [&_button]:inline-flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-[5px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-[5px] [&_button]:py-[3px] [&_button]:text-inherit border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
                    role="status"
                >
                    <Icone nome="check_circle" />

                    {mensagem}

                    <button
                        onClick={() => setMensagem(null)}
                        aria-label="Fechar"
                    >
                        <Icone nome="close" />
                    </button>
                </div>
            )}

            {erro && !modalAberto && (
                <div
                    className="flex items-center gap-[9px] rounded-[7px] border px-3 py-2.5 text-xs [&_button]:ml-auto [&_button]:inline-flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-[5px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-[5px] [&_button]:py-[3px] [&_button]:text-inherit border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                    role="alert"
                >
                    <Icone nome="error" />
                    {erro}

                    <button onClick={() => void carregar()}>
                        Tentar novamente
                    </button>
                </div>
            )}

            <section
                className="min-w-0 overflow-hidden rounded-[10px] border border-borda bg-cartao"
                aria-label="Instituições cadastradas"
            >
                {carregando ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 px-5 py-[30px] text-center [&_strong]:font-titulo [&_strong]:text-[15px] [&_strong]:font-semibold [&>span]:text-xs [&>span]:text-texto-2">
                        <span className="size-6 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-[#e7e3dc] border-t-acento" />
                        <strong>Carregando instituições...</strong>
                    </div>
                ) : erro && instituicoes.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 px-5 py-[30px] text-center [&_strong]:font-titulo [&_strong]:text-[15px] [&_strong]:font-semibold [&>span]:text-xs [&>span]:text-texto-2">
                        <strong>
                            Não foi possível carregar as instituições
                        </strong>

                        <button
                            className="inline-flex min-h-[39px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold disabled:cursor-wait disabled:opacity-65 border-borda bg-cartao text-texto hover:bg-trilho"
                            onClick={() => void carregar()}
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 px-5 py-[30px] text-center [&_strong]:font-titulo [&_strong]:text-[15px] [&_strong]:font-semibold [&>span]:text-xs [&>span]:text-texto-2">
                        <strong>
                            {termo
                                ? "Nenhuma instituição encontrada"
                                : "Nenhuma instituição cadastrada"}
                        </strong>

                        <span>
                            {termo
                                ? "Tente outro termo de pesquisa."
                                : "Cadastre a primeira instituição."}
                        </span>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse text-left text-[13px] max-[760px]:min-w-[720px] [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-borda [&_th]:bg-trilho [&_th]:px-[17px] [&_th]:py-2.5 [&_th]:text-[11px] [&_th]:font-medium [&_th]:text-texto-2 [&_td]:border-b [&_td]:border-borda [&_td]:px-[17px] [&_td]:py-[15px] [&_td]:align-middle [&_td]:text-texto [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover]:bg-trilho/40 [&_th:last-child]:w-[82px] [&_th:last-child]:pl-2 [&_td:last-child]:w-[82px] [&_td:last-child]:pl-2 max-[760px]:[&_th]:px-3 max-[760px]:[&_th]:py-3 max-[760px]:[&_td]:px-3 max-[760px]:[&_td]:py-3">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Campus</th>
                                    <th>Cidade</th>
                                    <th>ID</th>
                                    <th>CNPJ</th>
                                    <th aria-label="Ações" />
                                </tr>
                            </thead>

                            <tbody>
                                {filtradas.map((i) => (
                                    <tr key={i.id}>
                                        <td>{i.nome}</td>
                                        <td>{i.campus}</td>

                                        <td className="text-texto-3!">
                                            {i.cidade}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                title="Clique para copiar o ID"
                                                onClick={() => navigator.clipboard.writeText(i.id)}
                                                className="cursor-pointer border-0 bg-transparent p-0 font-mono text-xs text-texto-2"
                                            >
                                                {i.id}
                                            </button>
                                        </td>

                                        <td>
                                            <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.01em]">
                                                {i.cnpj || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="flex items-center justify-end gap-[7px]">
                                                <button
                                                    className="inline-grid h-[27px] w-6 cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-texto-2 hover:bg-trilho hover:text-texto"
                                                    onClick={() =>
                                                        abrirEdicao(i)
                                                    }
                                                    title="Editar"
                                                    aria-label={`Editar ${i.nome} - ${i.campus}`}
                                                >
                                                    <Icone
                                                        nome="edit"
                                                        tamanho={17}
                                                    />
                                                </button>

                                                <button
                                                    className="inline-grid h-[27px] w-6 cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-[#a32127] hover:bg-[#fff0ef] hover:text-[#8f171d]"
                                                    onClick={() =>
                                                        setConfirmarExclusao(i)
                                                    }
                                                    title="Excluir"
                                                    aria-label={`Excluir ${i.nome} - ${i.campus}`}
                                                >
                                                    <Icone
                                                        nome="delete"
                                                        tamanho={17}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {modalAberto && (
                <div
                    className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(25,22,19,0.42)] p-5 backdrop-blur-[1.5px]"
                    role="presentation"
                    onMouseDown={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            !salvando
                        ) {
                            setModalAberto(false);
                        }
                    }}
                >
                    <section
                        className="w-[min(510px,100%)] max-h-[calc(100vh-40px)] overflow-y-auto rounded-xl border border-borda bg-cartao shadow-[0_24px_70px_#00000026] [&_form]:px-[22px] [&_form]:pb-5 [&_form]:pt-[18px] max-[760px]:[&_form]:px-[18px]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="instituicoes-modal-titulo"
                    >
                        <div className="flex items-start justify-between gap-[15px] border-b border-borda px-[22px] pb-[17px] pt-5 max-[760px]:px-[18px] [&_h2]:font-titulo [&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-[1.3] [&_p]:mt-[7px] [&_p]:text-xs [&_p]:leading-normal [&_p]:text-texto-2 [&_p_strong]:font-semibold [&_p_strong]:text-texto">
                            <h2 id="instituicoes-modal-titulo">
                                {editando
                                    ? "Editar instituição"
                                    : "Nova instituição"}
                            </h2>

                            <button
                                className="grid size-[26px] flex-none cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-texto-2 hover:bg-trilho"
                                onClick={() => setModalAberto(false)}
                                disabled={salvando}
                                aria-label="Fechar"
                            >
                                <Icone nome="close" />
                            </button>
                        </div>

                        <form onSubmit={salvar}>
                            <label className="mb-[15px] flex flex-col gap-[7px] [&>span]:text-xs [&>span]:font-medium [&>span]:text-texto [&_input]:min-h-10 [&_input]:w-full [&_input]:rounded-[7px] [&_input]:border [&_input]:border-borda [&_input]:bg-fundo [&_input]:px-[11px] [&_input]:text-xs [&_input]:text-texto [&_input]:outline-0 [&_input]:placeholder:text-[#a29c93] [&_input]:focus:border-link [&_input]:focus:bg-cartao [&_input]:focus:shadow-[0_0_0_3px_#d977061a]">
                                <span>Nome</span>

                                <input
                                    autoFocus
                                    required
                                    maxLength={160}
                                    value={formulario.nome}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            nome: e.target.value
                                        })
                                    }
                                    placeholder="Nome da instituição"
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1 max-[760px]:gap-0">
                                <label className="mb-[15px] flex flex-col gap-[7px] [&>span]:text-xs [&>span]:font-medium [&>span]:text-texto [&_input]:min-h-10 [&_input]:w-full [&_input]:rounded-[7px] [&_input]:border [&_input]:border-borda [&_input]:bg-fundo [&_input]:px-[11px] [&_input]:text-xs [&_input]:text-texto [&_input]:outline-0 [&_input]:placeholder:text-[#a29c93] [&_input]:focus:border-link [&_input]:focus:bg-cartao [&_input]:focus:shadow-[0_0_0_3px_#d977061a]">
                                    <span>Campus</span>

                                    <input
                                        required
                                        maxLength={120}
                                        value={formulario.campus}
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                campus: e.target.value
                                            })
                                        }
                                        placeholder="Nome do campus"
                                    />
                                </label>

                                <label className="mb-[15px] flex flex-col gap-[7px] [&>span]:text-xs [&>span]:font-medium [&>span]:text-texto [&_input]:min-h-10 [&_input]:w-full [&_input]:rounded-[7px] [&_input]:border [&_input]:border-borda [&_input]:bg-fundo [&_input]:px-[11px] [&_input]:text-xs [&_input]:text-texto [&_input]:outline-0 [&_input]:placeholder:text-[#a29c93] [&_input]:focus:border-link [&_input]:focus:bg-cartao [&_input]:focus:shadow-[0_0_0_3px_#d977061a]">
                                    <span>Cidade</span>

                                    <input
                                        required
                                        maxLength={100}
                                        value={formulario.cidade}
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                cidade: e.target.value
                                            })
                                        }
                                        placeholder="Cidade"
                                    />
                                </label>
                            </div>

                            <label className="mb-[15px] flex flex-col gap-[7px] [&>span]:text-xs [&>span]:font-medium [&>span]:text-texto [&_input]:min-h-10 [&_input]:w-full [&_input]:rounded-[7px] [&_input]:border [&_input]:border-borda [&_input]:bg-fundo [&_input]:px-[11px] [&_input]:text-xs [&_input]:text-texto [&_input]:outline-0 [&_input]:placeholder:text-[#a29c93] [&_input]:focus:border-link [&_input]:focus:bg-cartao [&_input]:focus:shadow-[0_0_0_3px_#d977061a]">
                                <span>CNPJ</span>

                                <input
                                    required
                                    inputMode="numeric"
                                    value={formulario.cnpj}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            cnpj: mascararCnpj(e.target.value)
                                        })
                                    }
                                    placeholder="00.000.000/0000-00"
                                    maxLength={18}
                                />
                            </label>

                            {erro && (
                                <div
                                    className="flex items-center gap-[9px] rounded-[7px] border px-3 py-2.5 text-xs [&_button]:ml-auto [&_button]:inline-flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-[5px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-[5px] [&_button]:py-[3px] [&_button]:text-inherit border-[#fecaca] bg-[#fef2f2] text-[#991b1b] mb-3.5"
                                    role="alert"
                                >
                                    {erro}
                                </div>
                            )}

                            <div className="mt-1 flex justify-end gap-[9px] border-t border-borda px-[22px] pb-[17px] pt-3.5 max-[760px]:px-[18px]">
                                <button
                                    type="button"
                                    className="inline-flex min-h-[39px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold disabled:cursor-wait disabled:opacity-65 border-borda bg-cartao text-texto hover:bg-trilho"
                                    onClick={() => setModalAberto(false)}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex min-h-[39px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold disabled:cursor-wait disabled:opacity-65 border-acento bg-acento text-white hover:bg-[#9a3412]"
                                    disabled={salvando}
                                >
                                    <Icone
                                        nome={
                                            salvando
                                                ? "progress_activity"
                                                : editando
                                                    ? "check"
                                                    : "add"
                                        }
                                    />

                                    {salvando
                                        ? "Salvando..."
                                        : editando
                                            ? "Salvar alterações"
                                            : "Cadastrar instituição"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {confirmarExclusao && (
                <div
                    className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(25,22,19,0.42)] p-5 backdrop-blur-[1.5px]"
                    role="presentation"
                    onMouseDown={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            !excluindo
                        ) {
                            setConfirmarExclusao(null);
                        }
                    }}
                >
                    <section
                        className="w-[min(470px,100%)] max-h-[calc(100vh-40px)] overflow-y-auto rounded-xl border border-borda bg-cartao shadow-[0_24px_70px_#00000026]"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="instituicoes-excluir-titulo"
                        aria-describedby="instituicoes-excluir-descricao"
                    >
                        <div className="flex items-start justify-between gap-[15px] border-b border-borda px-[22px] pb-[17px] pt-5 max-[760px]:px-[18px] [&_h2]:font-titulo [&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-[1.3] [&_p]:mt-[7px] [&_p]:text-xs [&_p]:leading-normal [&_p]:text-texto-2 [&_p_strong]:font-semibold [&_p_strong]:text-texto">
                            <div>
                                <h2 id="instituicoes-excluir-titulo">
                                    Excluir instituição
                                </h2>

                                <p id="instituicoes-excluir-descricao">
                                    <strong>
                                        {confirmarExclusao.nome} · Campus{" "}
                                        {confirmarExclusao.campus}
                                    </strong>{" "}
                                    será removida. Esta ação não pode ser
                                    desfeita.
                                </p>
                            </div>

                            <button
                                className="grid size-[26px] flex-none cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-texto-2 hover:bg-trilho"
                                onClick={() =>
                                    setConfirmarExclusao(null)
                                }
                                disabled={excluindo}
                                aria-label="Fechar"
                            >
                                <Icone nome="close" />
                            </button>
                        </div>

                        {erro && (
                            <div
                                className="flex items-center gap-[9px] rounded-[7px] border px-3 py-2.5 text-xs [&_button]:ml-auto [&_button]:inline-flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-[5px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-[5px] [&_button]:py-[3px] [&_button]:text-inherit border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                                role="alert"
                            >
                                {erro}
                            </div>
                        )}

                        <div className="mt-1 flex justify-end gap-[9px] border-t border-borda px-[22px] pb-[17px] pt-[13px] max-[760px]:px-[18px]">
                            <button
                                className="inline-flex min-h-[39px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold disabled:cursor-wait disabled:opacity-65 border-borda bg-cartao text-texto hover:bg-trilho"
                                onClick={() =>
                                    setConfirmarExclusao(null)
                                }
                                disabled={excluindo}
                            >
                                Voltar
                            </button>

                            <button
                                className="inline-flex min-h-[39px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold disabled:cursor-wait disabled:opacity-65 border-[#b42318] bg-[#b42318] text-white hover:bg-[#991b1b]"
                                onClick={() => void remover()}
                                disabled={excluindo}
                            >
                                <Icone nome="delete" />

                                {excluindo
                                    ? "Excluindo..."
                                    : "Excluir instituição"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}