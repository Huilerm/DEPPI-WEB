interface Props {
  nome: string;
  tamanho?: number;
  className?: string;
  cor?: string;
}

export function Icone({ nome, tamanho, className = "", cor }: Props) {
  return (
    <span
      className={`icone ${className}`.trim()}
      style={{ fontSize: tamanho, color: cor }}
      aria-hidden="true"
    >
      {nome}
    </span>
  );
}
