import type { Cargo } from "../../types";

export interface ItemMenu {
  rotulo: string;
  icone: string;
  caminho: string;
}

const ITENS = {
  inicio: { rotulo: "Início", icone: "home", caminho: "/inicio" },
  cursos: { rotulo: "Cursos", icone: "school", caminho: "/cursos" },
  instituicoes: { rotulo: "Instituições", icone: "apartment", caminho: "/instituicoes" },
  usuarios: { rotulo: "Usuários", icone: "group", caminho: "/usuarios" },
  relatorios: { rotulo: "Relatórios", icone: "bar_chart", caminho: "/relatorios" },
  perfil: { rotulo: "Perfil", icone: "person", caminho: "/perfil" },
} satisfies Record<string, ItemMenu>;

const MENU: Record<Cargo, (keyof typeof ITENS)[]> = {
  ALUNO: ["inicio"],
  PROFESSOR: ["inicio"],
  DEPPI: ["inicio"],
  ADMIN: ["inicio", "cursos", "instituicoes", "usuarios", "relatorios", "perfil"],
};

export function menuDoPapel(papel: Cargo): ItemMenu[] {
  return MENU[papel].map((chave) => ITENS[chave]);
}