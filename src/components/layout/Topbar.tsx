"use client";

import { useEffect, useState } from "react";
import type { Cargo, UsuarioSessao } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Icone } from "../ui/Icone";

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
    <header className="topbar">
      <div className="topbar__esq">
        <button
          type="button"
          className="icone-botao"
          onClick={aoAlternarSidebar}
          aria-label="Recolher ou expandir o menu"
        >
          <Icone nome="menu" />
        </button>
        <span>{titulo}</span>
      </div>

      <div className="topbar__dir">
        <button
          type="button"
          className="icone-botao"
          onClick={alternarTema}
          aria-label="Alternar tema claro/escuro"
        >
          <Icone nome={escuro ? "light_mode" : "dark_mode"} />
        </button>
        <div className="usuario-chip">
          <div className="usuario-chip__textos">
            <span className="usuario-chip__nome">{usuario.nome}</span>
            <span
              className={`usuario-chip__papel${papel === "DEPPI" ? " usuario-chip__papel--deppi" : ""}`}
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