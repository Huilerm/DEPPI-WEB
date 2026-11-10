// Classes Tailwind reutilizadas em várias telas.

export const PAGINA = "flex flex-col gap-6 px-8 py-7";

const BTN_BASE =
  "inline-flex min-h-[39px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-60";

export const BTN = `${BTN_BASE} border-borda bg-cartao text-texto hover:bg-trilho`;
export const BTN_PRIM = `${BTN_BASE} border-acento bg-acento text-white hover:bg-[#9a3412]`;
export const BTN_PERIGO = `${BTN_BASE} border-[#b42318] bg-[#b42318] text-white hover:bg-[#991b1b]`;
export const BTN_PERIGO_O = `${BTN_BASE} border-[#b42318] bg-cartao text-[#b42318]`;

const AVISO_BASE = "flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-[13px]";
export const AVISO = `${AVISO_BASE} border-[#f3cfa5] bg-[#fdebd7] text-[#9a3412]`;
export const AVISO_ERRO = `${AVISO_BASE} border-[#f5c2bd] bg-[#fdecea] text-[#b42318]`;

export const TOPO =
  "flex items-center justify-between gap-5 [&_h1]:font-titulo [&_h1]:text-[clamp(25px,2.2vw,30px)] [&_h1]:font-bold [&_h1]:leading-[1.2] [&_h1]:tracking-[-0.03em] [&_p]:mt-[5px] [&_p]:text-[13px] [&_p]:text-texto-2";
export const TITULO_CURSO =
  "font-titulo text-[clamp(25px,2.2vw,30px)] font-bold leading-[1.2] tracking-[-0.03em]";

export const PAINEL = "rounded-xl border border-borda bg-cartao p-5";
export const PAINEL_TITULO = "mb-3.5 font-titulo text-[15px] font-semibold";
export const LAYOUT2 =
  "grid grid-cols-1 items-start gap-6 min-[901px]:grid-cols-[minmax(0,1fr)_320px]";

export const CAMPO_LABEL = "mb-1.5 block text-[13px] font-medium";
export const CAMPO_INPUT =
  "h-[42px] w-full rounded-lg border border-borda bg-fundo px-3 text-sm text-texto";
export const CAMPO_SELECT = `${CAMPO_INPUT} seta-select pr-6`;

export const SELO =
  "inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11.5px] font-semibold";

export const CAPA_FUNDO =
  "relative flex items-end overflow-hidden bg-cover bg-center bg-[repeating-linear-gradient(135deg,var(--trilho)_0_14px,transparent_14px_28px)]";
