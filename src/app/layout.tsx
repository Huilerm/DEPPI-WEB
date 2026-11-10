// Estrutura geral

import "./globals.css";
import { Space_Grotesk, Inter_Tight, JetBrains_Mono } from "next/font/google";

const fonteTitulo = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--fonte-titulo" });
const fonteCorpo = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fonte-corpo" });
const fonteMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--fonte-mono" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..24,400,0,0"
        />
      </head>
      <body className={`${fonteTitulo.variable} ${fonteCorpo.variable} ${fonteMono.variable} font-corpo`}>
        {children}
      </body>
    </html>
  );
}
