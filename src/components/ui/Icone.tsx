interface Props {
  nome: string;
  tamanho?: number;
  className?: string;
  cor?: string;
}

export function Icone({ nome, tamanho, className = "", cor }: Props) {
  return (
    <span
      className={`inline-block select-none whitespace-nowrap font-icone text-xl font-normal normal-case not-italic leading-none tracking-normal antialiased [direction:ltr] [font-feature-settings:'liga'] ${className}`.trim()}
      style={{ fontSize: tamanho, color: cor }}
      aria-hidden="true"
    >
      {nome}
    </span>
  );
}
