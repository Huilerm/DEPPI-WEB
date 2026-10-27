import type { ReactNode } from "react";
import { Space_Grotesk, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "../../styles/deppi.css";
import { AppShell } from "../../components/layout/AppShell";

const fonteTitulo = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--fonte-titulo" });
const fonteCorpo = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fonte-corpo" });
const fonteMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--fonte-mono" });

export default function LayoutLogado({ children }: { children: ReactNode }) {
  return (
    <div className={`${fonteTitulo.variable} ${fonteCorpo.variable} ${fonteMono.variable}`}>
      <AppShell>{children}</AppShell>
    </div>
  );
}
