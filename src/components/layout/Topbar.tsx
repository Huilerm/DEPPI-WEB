"use client";

import { useEffect, useState } from "react";
import type { Cargo, UsuarioSessao } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Icone } from "../ui/Icone";

const BTN_ICONE =
  "grid size-8 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-inherit hover:bg-black/5 disabled:cursor-default disabled:opacity-70 dark:hover:bg-white/[0.07]";

interface Props {
  titulo: string;
  usuario: UsuarioSessao;
  papel: Cargo;
  aoAlternarSidebar: () => void;
}

export function Topbar({ titulo, usuario, papel, aoAlternarSidebar }: Props) {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("tema") === "escuro";
    setEscuro(salvo);
    document.documentElement.dataset.tema = salvo ? "escuro" : "claro";
  }, []);

  function alternarTema() {
    const proximo = !escuro;
    setEscuro(proximo);
    document.documentElement.dataset.tema = proximo ? "escuro" : "claro";
    localStorage.setItem("tema", proximo ? "escuro" : "claro");
  }

  return (
    <header className="flex h-[58px] flex-none items-center justify-between border-b border-borda bg-fundo px-7">
      <div className="flex items-center gap-2 text-[13px] text-texto-3">
        <button type="button" className={BTN_ICONE} onClick={aoAlternarSidebar} aria-label="Recolher ou expandir o menu">
          <Icone nome="menu" />
        </button>
        <span>{titulo}</span>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className={BTN_ICONE} onClick={alternarTema} aria-label="Alternar tema claro/escuro">
          <Icone nome={escuro ? "light_mode" : "dark_mode"} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col items-end gap-[3px]">
            <span className="text-[13px] font-semibold leading-none">{usuario.nome}</span>
            <span
              className={`font-mono text-[10px] font-medium leading-none tracking-[0.06em] ${
                papel === "DEPPI" ? "text-link" : "text-acento"
              }`}
            >
              {papel}
            </span>
          </div>
          <Avatar nome={usuario.nome} tamanho={34} />
        </div>
      </div>
    </header>
  );
}
