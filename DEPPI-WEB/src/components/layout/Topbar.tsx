"use client";

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
