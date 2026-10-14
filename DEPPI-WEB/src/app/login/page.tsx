"use client";

// Pagina principal

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Space_Grotesk, Inter_Tight } from "next/font/google";
import "./login.css";

const fonteTitulo = Space_Grotesk({
    subsets: ["latin"],
    weight: ["600", "700"],
    variable: "--fonte-titulo",
});

const fonteCorpo = Inter_Tight({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--fonte-corpo",
});

function IconeErro() {
    return (
        <svg
            className="login-erro-icone"
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
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
        <main
            className={`login-pagina ${fonteTitulo.variable} ${fonteCorpo.variable}`}
        >
            <section className="login-painel-marca">
                <div className="login-marca">
                    <div className="login-logo">D</div>
                    <div className="login-marca-textos">
                        <span className="login-marca-nome">DEPPI</span>
                        <span className="login-marca-sub">IFCE · Extensão</span>
                    </div>
                </div>

                <div className="login-chamada">
                    <h1 className="login-chamada-titulo">
                        Cursos de extensão do IFCE, num só lugar.
                    </h1>
                    <p className="login-chamada-texto">
                        Inscreva-se, envie seus documentos e acompanhe a análise
                        da sua inscrição.
                    </p>
                </div>
            </section>

            <section className="login-painel-form">
                <form className="login-formulario" onSubmit={fazerLogin}>
                    <div className="login-cabecalho">
                        <h2 className="login-titulo">Entrar</h2>
                        <span className="login-subtitulo">
                            Use seu e-mail institucional.
                        </span>
                    </div>

                    {mensagem && (
                        <div className="login-erro" role="alert">
                            <IconeErro />
                            {mensagem}
                        </div>
                    )}

                    <div className="login-campo">
                        <label className="login-rotulo" htmlFor="email">
                            E-mail institucional
                        </label>
                        <div className="login-caixa">
                            <input
                                id="email"
                                className="login-entrada"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(evento) => setEmail(evento.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-campo">
                        <label className="login-rotulo" htmlFor="senha">
                            Senha
                        </label>
                        <div className={`login-caixa login-caixa-senha`}>
                            <input
                                id="senha"
                                className={`login-entrada ${
                                    mostrarSenha ? "" : "login-entrada-senha-oculta"
                                }`}
                                type={mostrarSenha ? "text" : "password"}
                                autoComplete="current-password"
                                value={senha}
                                onChange={(evento) => setSenha(evento.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="login-botao-olho"
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
                        className="login-botao-entrar"
                        disabled={carregando}
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>

                    <div className="login-divisor">ou</div>

                    <p className="login-rodape">
                        Ainda não tem conta?{" "}
                        <Link className="login-link" href="/register">
                            Crie sua conta
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
}