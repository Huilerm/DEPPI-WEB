// Estrutura geral

import "./globals.css"; // Carrega o css

export default function RootLayout({ // Define o layout principal
  children, // Recebe o conteúdo das páginas
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
      <body>{children}</body>
    </html>
  );
}