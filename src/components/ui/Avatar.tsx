import { iniciais } from "../../lib/formatadores";

interface Props {
  nome: string;
  tamanho?: number;
}

export function Avatar({ nome, tamanho = 34 }: Props) {
  return (
    <span
      className="grid flex-none place-items-center rounded-full bg-[#ece9e4] font-titulo font-semibold dark:bg-[#33312d]"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho >= 48 ? 17 : tamanho >= 34 ? 12 : 11 }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}
