"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Cargo } from "../../types";
import { limparSessao } from "../../lib/sessao";
import { Icone } from "../ui/Icone";
import { menuDoPapel } from "./menu";

const ITEM =
  "flex h-[38px] w-full cursor-pointer items-center gap-3 rounded-[7px] border-0 bg-transparent px-2.5 text-left text-sm font-medium";

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
    <aside
      className={`sticky top-0 flex h-screen flex-none flex-col gap-1 border-r border-borda bg-sidebar px-3 py-4 transition-[width] duration-150 ${
        recolhida ? "w-[68px]" : "w-[232px]"
      }`}
    >
      <div className="flex items-center gap-2.5 px-1.5 pb-5 pt-1">
        <div className="grid size-[30px] flex-none place-items-center rounded-[7px] bg-acento font-titulo text-[15px] font-bold text-white">
          D
        </div>
        {!recolhida && (
          <div className="flex flex-col leading-[1.3]">
            <span className="font-titulo text-sm font-bold tracking-[0.04em]">DEPPI</span>
            <span className="text-[11px] text-texto-3">IFCE · Extensão</span>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {menuDoPapel(papel).map((item) => {
          const ativo =
            pathname === item.caminho || pathname.startsWith(`${item.caminho}/`);
          return (
            <Link
              key={item.caminho}
              href={item.caminho}
              title={recolhida ? item.rotulo : undefined}
              className={`${ITEM} ${
                ativo
                  ? "bg-acento/10 text-black dark:text-white"
                  : "text-texto-2 hover:bg-black/5 dark:hover:bg-white/[0.07]"
              }`}
            >
              <Icone nome={item.icone} className={ativo ? "text-acento" : "text-texto-3"} />
              {!recolhida && <span>{item.rotulo}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={sair}
        title="Sair"
        className={`${ITEM} mt-auto text-texto-2 hover:bg-black/5 dark:hover:bg-white/[0.07]`}
      >
        <Icone nome="logout" className="text-texto-3" />
        {!recolhida && <span>Sair</span>}
      </button>
    </aside>
  );
}
