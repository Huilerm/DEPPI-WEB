# DEPPI-WEB

Frontend do **DEPPI — sistema de gerenciamento de cursos, inscrições e usuários**.

> As operações disponíveis dependem do cargo do usuário e das permissões validadas pela API.

## Tecnologias

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Pré-requisitos

Antes de executar o projeto, instale:

- [Node.js](https://nodejs.org/) (versão LTS recomendada).
- npm, que é instalado junto com o Node.js.
- Git, caso queira clonar o repositório.

Para conferir se Node.js e npm estão instalados:

```bash
node -v
npm -v
```

## Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Huilerm/DEPPI-WEB.git
```

### 2. Entre na pasta do projeto

```bash
cd DEPPI-WEB
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure a URL da API (opcional)

O frontend utiliza a API do DeppiAPI. Para apontar para outra instância, crie um arquivo chamado `.env.local` na raiz do projeto e informe:

```env
NEXT_PUBLIC_API_URL=https://deppiapi-q96m.onrender.com
```

A aplicação já possui essa URL como padrão em sua configuração; portanto, se ela continuar sendo a API utilizada, essa variável pode ser omitida. Em desenvolvimento, altere o valor caso esteja executando a API em outro endereço.

**Não envie arquivos `.env.local` com credenciais ou configurações privadas para o GitHub.**

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Abra no navegador o endereço indicado pelo terminal. Normalmente:

```text
http://localhost:3000
```

Para encerrar o servidor, pressione `Ctrl + C` no terminal.
