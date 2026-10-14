
import type { Cargo } from "../../types";

export interface ItemMenu {
  rotulo: string;
  icone: string;
  caminho: string;
}

const ITENS = {
  inicio: {
    rotulo: "Início",
    icone: "home",
    caminho: "/inicio",
  },
} satisfies Record<string, ItemMenu>;

const MENU: Record<Cargo, (keyof typeof ITENS)[]> = {
  ALUNO: ["inicio"],
  PROFESSOR: ["inicio"],
  DEPPI: ["inicio"],
  ADMIN: ["inicio"],
};

export function menuDoPapel(papel: Cargo): ItemMenu[] {
  return MENU[papel].map((chave) => ITENS[chave]);
}
