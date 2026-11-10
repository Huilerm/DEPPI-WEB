"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { lerToken, lerUsuario, papelPrincipal } from "../../lib/sessao";
import { SessaoProvider, type SessaoAtual } from "./SessaoContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { menuDoPapel } from "./menu";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [recolhida, setRecolhida] = useState(false);
  const [sessao, setSessao] = useState<SessaoAtual | null>(null);

  useEffect(() => {
    const usuario = lerUsuario();
    const papel = papelPrincipal(usuario?.cargos);
    if (lerToken() && usuario && papel) setSessao({ usuario, papel });
    else router.replace("/login");
  }, [router]);

  if (!sessao) return null;

  const atual = menuDoPapel(sessao.papel).find(
    (i) => pathname === i.caminho || pathname.startsWith(`${i.caminho}/`),
  );

  return (
    <SessaoProvider value={sessao}>
      <div className="app flex min-h-screen bg-fundo font-corpo text-sm leading-normal text-texto">
        <Sidebar papel={sessao.papel} recolhida={recolhida} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            titulo={atual?.rotulo ?? "Início"}
            usuario={sessao.usuario}
            papel={sessao.papel}
            aoAlternarSidebar={() => setRecolhida((r) => !r)}
          />
          {children}
        </div>
      </div>
    </SessaoProvider>
  );
}
