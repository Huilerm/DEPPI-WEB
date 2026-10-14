"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Cargo } from "../../types";
import { limparSessao } from "../../lib/sessao";
import { Icone } from "../ui/Icone";
import { menuDoPapel } from "./menu";

interface Props {
  papel: Cargo;
  recolhida: boolean;
}

export function Sidebar({ papel, recolhida }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function sair() {
    limparSessao();
    router.replace("/login");
  }

  return (
    <aside className={`sidebar${recolhida ? " sidebar--recolhida" : ""}`}>
      <div className="logo">
        <div className="logo__marca">D</div>
        {!recolhida && (
          <div className="logo__texto">
            <span className="logo__nome">DEPPI</span>
            <span className="logo__sub">IFCE · Extensão</span>
          </div>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {menuDoPapel(papel).map((item) => {
          const ativo =
            pathname === item.caminho ||
            pathname.startsWith(`${item.caminho}/`);
          return (
            <Link
              key={item.caminho}
              href={item.caminho}
              className={`nav-item${ativo ? " ativo" : ""}`}
              title={recolhida ? item.rotulo : undefined}
            >
              <Icone nome={item.icone} />
              {!recolhida && <span>{item.rotulo}</span>}
            </Link>
          );
        })}
      </nav>

      <button type="button" className="nav-item nav-item--sair" onClick={sair} title="Sair">
        <Icone nome="logout" />
        {!recolhida && <span>Sair</span>}
      </button>
    </aside>
  );
}
