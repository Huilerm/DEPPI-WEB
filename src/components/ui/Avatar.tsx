import { iniciais } from "../../lib/formatadores";

interface Props {
  nome: string;
  tamanho?: 34 | 32 | 28;
}

export function Avatar({ nome, tamanho = 34 }: Props) {
  return (
    <span
      className="avatar"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho >= 34 ? 12 : 11 }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}
