"use client";

// Pagina principal

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CAIXA =
    "flex h-11 items-center rounded-lg border border-[#e4e1db] bg-white transition-[border-color,box-shadow] duration-150 focus-within:border-[#d97706] focus-within:shadow-[0_0_0_3px_rgba(217,119,6,0.2)]";
const ENTRADA =
    "h-full min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3.5 text-sm text-[#1a1a1a] outline-0";

function IconeErro() {
    return (
        <svg
            className="size-[18px] shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
        </svg>
    );
}

function IconeOlho({ aberto }: { aberto: boolean }) {
    return (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {aberto ? (
                <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            ) : (
                <path d="M12 7a5 5 0 0 1 5 5c0 .65-.13 1.26-.36 1.83l2.92 2.92A11.8 11.8 0 0 0 23 12c-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7ZM2 4.27l2.28 2.28.46.46A11.8 11.8 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27ZM7.53 9.8l1.55 1.55A2.8 2.8 0 0 0 9 12a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55A4.99 4.99 0 0 1 7 12c0-.77.18-1.5.53-2.2Zm4.3-.78 3.15 3.15.02-.17a3 3 0 0 0-3-3l-.17.02Z" />
            )}
        </svg>
    );
}

export default function Login() { // Representa os componentes da página
    const [email, setEmail] = useState(""); // useState cria um estado que começa vazio
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const router = useRouter();

    async function fazerLogin(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        setMensagem("");
        setCarregando(true);

        try {
            const resposta = await fetch(
                "https://deppiapi-q96m.onrender.com/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        senha: senha,
                    }),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                setMensagem(dados.mensagem || "Não foi possível entrar.");
                return;
            }

            sessionStorage.setItem("token", dados.token);
            sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));

            router.push("/inicio");
        } catch (erro) {
            console.error("Erro ao conectar com a API:", erro);
            setMensagem("Falha na conexão. Abra o console para ver o erro.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="grid min-h-screen grid-cols-1 bg-[#faf9f7] font-corpo text-[#1a1a1a] min-[901px]:grid-cols-2">
            <section className="relative hidden flex-col justify-between border-r border-[#e4e1db] bg-[#f1efeb] p-12 min-[901px]:flex">
                <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-[#c2410c] font-titulo text-lg font-bold text-white">D</div>
                    <div className="flex flex-col">
                        <span className="font-titulo text-[17px] font-bold tracking-[0.04em]">DEPPI</span>
                        <span className="text-xs text-[#666]">IFCE · Extensão</span>
                    </div>
                </div>

                <div className="flex max-w-[420px] flex-col gap-3">
                    <h1 className="m-0 font-titulo text-[40px] font-semibold leading-[1.1] tracking-[-0.01em] text-balance">
                        Cursos de extensão do IFCE, num só lugar.
                    </h1>
                    <p className="m-0 text-[15px] leading-normal text-[#5c5c5c]">
                        Inscreva-se, envie seus documentos e acompanhe a análise
                        da sua inscrição.
                    </p>
                </div>
            </section>

            <section className="flex items-center justify-center p-12 max-[900px]:px-5 max-[900px]:py-10">
                <form className="flex w-[380px] max-w-full flex-col gap-6" onSubmit={fazerLogin}>
                    <div className="flex flex-col gap-1.5">
                        <h2 className="m-0 font-titulo text-[26px] font-semibold">Entrar</h2>
                        <span className="text-sm text-[#5c5c5c]">
                            Use seu e-mail institucional.
                        </span>
                    </div>

                    {mensagem && (
                        <div
                            className="flex items-start gap-2.5 rounded-lg border border-[rgba(242,116,116,0.3)] bg-[rgba(242,116,116,0.1)] px-3.5 py-3 text-[13px] leading-[1.4] text-[#b91c1c]"
                            role="alert"
                        >
                            <IconeErro />
                            {mensagem}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#333]" htmlFor="email">
                            E-mail institucional
                        </label>
                        <div className={CAIXA}>
                            <input
                                id="email"
                                className={ENTRADA}
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(evento) => setEmail(evento.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#333]" htmlFor="senha">
                            Senha
                        </label>
                        <div className={`${CAIXA} pr-1.5`}>
                            <input
                                id="senha"
                                className={`${ENTRADA} ${mostrarSenha ? "" : "text-base tracking-[0.2em]"}`}
                                type={mostrarSenha ? "text" : "password"}
                                autoComplete="current-password"
                                value={senha}
                                onChange={(evento) => setSenha(evento.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[#5c5c5c] hover:bg-[#f1efeb] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#d97706]"
                                onClick={() => setMostrarSenha((v) => !v)}
                                aria-label={
                                    mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                                }
                                aria-pressed={mostrarSenha}
                            >
                                <IconeOlho aberto={!mostrarSenha} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="h-11 cursor-pointer rounded-lg border-0 bg-[#c2410c] text-[15px] font-semibold text-white transition-[background,opacity] duration-150 hover:enabled:bg-[#a8380a] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgba(217,119,6,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={carregando}
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>

                    <div className="flex items-center gap-3 text-xs text-[#8a8a8a] before:h-px before:flex-1 before:bg-[#e4e1db] before:content-[''] after:h-px after:flex-1 after:bg-[#e4e1db] after:content-['']">
                        ou
                    </div>

                    <p className="m-0 text-center text-sm text-[#5c5c5c]">
                        Ainda não tem conta?{" "}
                        <Link className="font-semibold text-[#d97706] hover:underline" href="/register">
                            Crie sua conta
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
}
