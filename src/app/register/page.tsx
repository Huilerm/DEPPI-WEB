"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const INPUT_BASE =
  "box-border h-[42px] w-full appearance-none rounded-lg border bg-[#faf9f7] px-3 font-corpo text-sm text-[#1a1a1a] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#6b6b6b]";
const INPUT_OK =
  "border-[#e4e1db] focus:border-[#d97706] focus:shadow-[0_0_0_3px_rgba(217,119,6,0.2)]";
const INPUT_INVALIDO =
  "border-[#b91c1c] focus:border-[#b91c1c] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.15)]";
const DATA =
  "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-11 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-datetime-edit]:p-0";
const BTN =
  "inline-flex h-[42px] cursor-pointer items-center gap-1.5 rounded-lg font-corpo text-sm transition-[background,border-color] duration-150 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgba(217,119,6,0.4)]";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://deppiapi-q96m.onrender.com").replace(/\/$/, "");

const ENDERECO_ID = Number(process.env.NEXT_PUBLIC_ENDERECO_ID ?? 1);

type FieldName =
  | "nome" | "nomeSocial" | "dataNasc" | "naturalidade" | "sexo" | "raca" | "nomeMae" | "nomePai"
  | "rg" | "cpf" | "orgaoEmissor" | "estado" | "dataEmissao"
  | "tituloNumero" | "zonaEleitoral" | "secaoEleitoral" | "ufTitulo"
  | "email" | "senha" | "confirmarSenha";

type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const INITIAL: Values = {
  nome: "", nomeSocial: "", dataNasc: "", naturalidade: "", sexo: "", raca: "", nomeMae: "", nomePai: "",
  rg: "", cpf: "", orgaoEmissor: "", estado: "", dataEmissao: "",
  tituloNumero: "", zonaEleitoral: "", secaoEleitoral: "", ufTitulo: "",
  email: "", senha: "", confirmarSenha: "",
};

const STEPS = [
  { label: "Dados pessoais", title: "Seus dados pessoais" },
  { label: "Documento", title: "Seu documento de identidade" },
  { label: "Título de eleitor", title: "Seu título de eleitor" },
  { label: "Acesso", title: "Seu acesso ao sistema" },
] as const;

const STEP_FIELDS: FieldName[][] = [
  ["nome", "nomeSocial", "dataNasc", "naturalidade", "sexo", "raca", "nomeMae", "nomePai"],
  ["rg", "cpf", "orgaoEmissor", "estado", "dataEmissao"],
  ["tituloNumero", "zonaEleitoral", "secaoEleitoral", "ufTitulo"],
  ["email", "senha", "confirmarSenha"],
];

const UFS: [string, string][] = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"], ["BA", "Bahia"],
  ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"], ["GO", "Goiás"],
  ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"],
  ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"], ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"], ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"], ["SP", "São Paulo"],
  ["SE", "Sergipe"], ["TO", "Tocantins"],
];

const SEXOS = [["MASCULINO", "Masculino"], ["FEMININO", "Feminino"]];
const RACAS = [
  ["AMARELA", "Amarela"], ["BRANCA", "Branca"], ["PARDA", "Parda"], ["PRETA", "Preta"],
  ["INDIGENA", "Indígena"], ["NAO_DECLARADO", "Prefiro não declarar"],
];

function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function cpfValido(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (len: number) => {
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(d[i]) * (len + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

function validate(step: number, v: Values): Errors {
  const e: Errors = {};
  const req = (k: FieldName, msg = "Campo obrigatório.") => {
    if (!v[k].trim()) e[k] = msg;
  };

  if (step === 0) {
    if (v.nome.trim().length < 3) e.nome = "Informe o nome completo (mín. 3 caracteres).";
    if (v.naturalidade.trim().length < 2) e.naturalidade = "Informe sua naturalidade.";
    req("dataNasc", "Informe a data de nascimento.");
    req("sexo", "Selecione uma opção.");
    req("raca", "Selecione uma opção.");
    if (v.nomeMae.trim().length < 3) e.nomeMae = "Informe o nome da mãe (mín. 3 caracteres).";
    if (v.nomePai.trim().length < 3) e.nomePai = "Informe o nome do pai (mín. 3 caracteres).";
  }
  if (step === 1) {
    if (v.rg.trim().length < 5) e.rg = "RG inválido — confira o número.";
    if (!cpfValido(v.cpf)) e.cpf = "CPF inválido — confira os dígitos verificadores.";
    if (v.orgaoEmissor.trim().length < 2) e.orgaoEmissor = "Informe o órgão emissor.";
    req("estado", "Selecione o estado emissor.");
    req("dataEmissao", "Informe a data de emissão.");
  }
  if (step === 2) {
    req("tituloNumero", "Informe o número do título.");
    req("zonaEleitoral", "Informe a zona.");
    req("secaoEleitoral", "Informe a seção.");
    req("ufTitulo", "Selecione a UF do título.");
  }
  if (step === 3) {
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "E-mail inválido.";
    if (v.senha.length < 8) e.senha = "Mínimo de 8 caracteres.";
    if (v.confirmarSenha !== v.senha) e.confirmarSenha = "As senhas não são iguais.";
  }
  return e;
}

type IconName = "calendar" | "chevron" | "error" | "back" | "forward" | "check";

const ICON_PATHS: Record<IconName, ReactNode> = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.1" />
    </>
  ),
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  forward: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={`inline-block flex-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

type FieldProps = {
  name: FieldName;
  label: string;
  optional?: boolean;
  full?: boolean;
  values: Values;
  errors: Errors;
  onChange: (name: FieldName, value: string) => void;
};

function TextField({
  name, label, optional, full, values, errors, onChange,
  type = "text", mono, placeholder, autoComplete, mask, hint, inputMode,
}: FieldProps & {
  type?: "text" | "email" | "password" | "date";
  mono?: boolean;
  placeholder?: string;
  autoComplete?: string;
  mask?: (v: string) => string;
  hint?: string;
  inputMode?: "numeric" | "text";
}) {
  const error = errors[name];
  const isDate = type === "date";
  const handle = (ev: ChangeEvent<HTMLInputElement>) =>
    onChange(name, mask ? mask(ev.target.value) : ev.target.value);

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${full ? "col-span-full" : ""}`}>
      <label className="text-[13px] font-medium text-[#333]" htmlFor={name}>
        {label} {optional && <span className="font-normal text-[#6b6b6b]">(opcional)</span>}
      </label>
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type={type}
          value={values[name]}
          onChange={handle}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-erro` : undefined}
          className={[
            INPUT_BASE,
            error ? INPUT_INVALIDO : INPUT_OK,
            mono || isDate ? "font-mono text-[13px]" : "",
            isDate ? DATA : "",
            isDate || error ? "pr-[38px]" : "",
          ].join(" ")}
        />
        {isDate ? (
          <Icon name="calendar" className="pointer-events-none absolute right-3 text-[#6b6b6b]" />
        ) : (
          error && (
            <Icon name="error" className="pointer-events-none absolute right-3 text-[#b91c1c]" />
          )
        )}
      </div>
      {error ? (
        <span id={`${name}-erro`} className="text-xs text-[#b91c1c]">{error}</span>
      ) : (
        hint && <span className="text-xs text-[#6b6b6b]">{hint}</span>
      )}
    </div>
  );
}

function SelectField({
  name, label, full, values, errors, onChange, options, placeholder = "Selecione",
}: FieldProps & { options: [string, string][]; placeholder?: string }) {
  const error = errors[name];
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${full ? "col-span-full" : ""}`}>
      <label className="text-[13px] font-medium text-[#333]" htmlFor={name}>{label}</label>
      <div className="relative flex items-center">
        <select
          id={name}
          name={name}
          value={values[name]}
          onChange={(ev) => onChange(name, ev.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-erro` : undefined}
          className={`${INPUT_BASE} pr-[38px] ${error ? INPUT_INVALIDO : INPUT_OK}`}
          style={{ color: values[name] ? undefined : "#6b6b6b" }}
        >
          <option value="">{placeholder}</option>
          {options.map(([value, text]) => (
            <option key={value} value={value}>{text}</option>
          ))}
        </select>
        <Icon name="chevron" size={20} className="pointer-events-none absolute right-3 text-[#6b6b6b]" />
      </div>
      {error && <span id={`${name}-erro`} className="text-xs text-[#b91c1c]">{error}</span>}
    </div>
  );
}

export default function Cadastro() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [sending, setSending] = useState(false);

  const isLast = step === STEPS.length - 1;

  function setField(name: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  const common = { values, errors, onChange: setField };

  function voltar() {
    setServerError("");
    setStep((s) => Math.max(0, s - 1));
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (!isLast) {
      setServerError("");
      setStep(step + 1);
      return;
    }

    setSending(true);
    setServerError("");
    try {
      const res = await fetch(`${API_URL}/auth/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: values.nome.trim(),
          nomeSocial: values.nomeSocial.trim() || undefined,
          nomeMae: values.nomeMae.trim(),
          nomePai: values.nomePai.trim(),
          fkEndereco: ENDERECO_ID,
          dataNasc: values.dataNasc,
          naturalidade: values.naturalidade.trim(),
          email: values.email.trim(),
          senha: values.senha,
          sexo: values.sexo,
          raca: values.raca,
          cargo: "ALUNO", 
          rg: values.rg.trim(),
          cpf: values.cpf,
          orgaoEmissor: values.orgaoEmissor.trim(),
          estado: values.estado,
          dataEmissao: values.dataEmissao,
          tituloNumero: values.tituloNumero.trim(),
          zonaEleitoral: values.zonaEleitoral.trim(),
          secaoEleitoral: values.secaoEleitoral.trim(),
          ufTitulo: values.ufTitulo,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        router.push("/login");
        return;
      }

      if (Array.isArray(data.erros)) {
        const fromApi: Errors = {};
        for (const item of data.erros as { campo: string; mensagem: string }[]) {
          fromApi[item.campo as FieldName] = item.mensagem;
        }
        setErrors(fromApi);
        const first = STEP_FIELDS.findIndex((fields) => fields.some((f) => fromApi[f]));
        if (first >= 0) setStep(first);
      }
      setServerError(data.mensagem ?? "Não foi possível criar a conta. Tente novamente.");
    } catch {
      setServerError("Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.");
    } finally {
      setSending(false);
    }
  }

  let fields: ReactNode;
  if (step === 0) {
    fields = (
      <>
        <TextField {...common} name="nome" label="Nome completo" full autoComplete="name" />
        <TextField {...common} name="nomeSocial" label="Nome social" optional full />
        <TextField {...common} name="dataNasc" label="Data de nascimento" type="date" />
        <TextField {...common} name="naturalidade" label="Naturalidade" placeholder="Cidade onde nasceu" />
        <SelectField {...common} name="sexo" label="Sexo" options={SEXOS as [string, string][]} />
        <SelectField {...common} name="raca" label="Raça/cor" options={RACAS as [string, string][]} />
        <TextField {...common} name="nomeMae" label="Nome da mãe" />
        <TextField {...common} name="nomePai" label="Nome do pai" />
      </>
    );
  } else if (step === 1) {
    fields = (
      <>
        <TextField {...common} name="rg" label="RG" mono />
        <TextField {...common} name="cpf" label="CPF" mono mask={maskCPF} inputMode="numeric" placeholder="000.000.000-00" />
        <TextField {...common} name="orgaoEmissor" label="Órgão emissor" placeholder="Ex.: SSPDS" />
        <SelectField
          {...common}
          name="estado"
          label="Estado emissor"
          options={UFS.map(([uf, nome]) => [uf, `${uf} — ${nome}`])}
        />
        <TextField {...common} name="dataEmissao" label="Data de emissão" type="date" />
      </>
    );
  } else if (step === 2) {
    fields = (
      <>
        <TextField {...common} name="tituloNumero" label="Número do título" mono inputMode="numeric" />
        <SelectField
          {...common}
          name="ufTitulo"
          label="UF do título"
          options={UFS.map(([uf, nome]) => [uf, `${uf} — ${nome}`])}
        />
        <TextField {...common} name="zonaEleitoral" label="Zona" mono inputMode="numeric" />
        <TextField {...common} name="secaoEleitoral" label="Seção" mono inputMode="numeric" />
      </>
    );
  } else {
    fields = (
      <>
        <TextField {...common} name="email" label="E-mail" type="email" full autoComplete="email" />
        <TextField
          {...common}
          name="senha"
          label="Senha"
          type="password"
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres."
        />
        <TextField {...common} name="confirmarSenha" label="Confirmar senha" type="password" autoComplete="new-password" />
      </>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#faf9f7] px-4 py-10 font-corpo text-[#1a1a1a]">
      <div className="flex w-full max-w-[680px] flex-col gap-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-md bg-[#c2410c] font-titulo text-sm font-bold text-white" aria-hidden>D</div>
            <h1 className="m-0 font-titulo text-[15px] font-bold tracking-[0.04em]">DEPPI</h1>
          </div>
          <a className="text-[13px] text-[#d97706] hover:text-[#f59e0b]" href="/login">Já tenho conta</a>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="m-0 font-titulo text-[28px] font-semibold">Crie sua conta</h2>
          <p className="m-0 text-sm text-[#5c5c5c]">
            Você mesmo preenche seus dados — leva uns 5 minutos. Tenha seu RG, CPF e título de eleitor em mãos.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <div
            className="h-1 overflow-hidden rounded-sm bg-[#f1efeb]"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            aria-label={`Passo ${step + 1} de ${STEPS.length}`}
          >
            <div className="h-full bg-[#c2410c] transition-[width] duration-[250ms] ease-in-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <ol className="m-0 grid list-none grid-cols-4 gap-2 p-0">
            {STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <li
                  key={s.label}
                  className={`flex items-center gap-2 text-[13px] ${
                    state === "todo" ? "text-[#6b6b6b]" : "text-[#1a1a1a]"
                  }`}
                  aria-current={state === "active" ? "step" : undefined}
                >
                  <span
                    className={`grid size-[22px] flex-none place-items-center rounded-full border font-mono text-[11px] font-semibold ${
                      state === "done"
                        ? "border-[#c2410c] bg-[#c2410c] text-white"
                        : state === "todo"
                          ? "border-[#d3d0c9] bg-transparent text-[#6b6b6b]"
                          : "border-[#c2410c] bg-transparent text-[#c2410c]"
                    }`}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span>{s.label}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <form className="contents" onSubmit={onSubmit} noValidate>
          <div className="flex flex-col gap-5 rounded-[10px] border border-[#e4e1db] bg-white p-7">
            <h2 className="m-0 font-titulo text-lg font-semibold">{STEPS[step].title}</h2>

            {serverError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(185,28,28,0.25)] bg-[rgba(185,28,28,0.06)] px-3.5 py-3 text-[13px] leading-[1.4] text-[#b91c1c]" role="alert">
                <Icon name="error" />
                <span>{serverError}</span>
              </div>
            )}

            {sending && (
              <span className="text-xs text-[#6b6b6b]" role="status">
                Se o servidor estava inativo, o primeiro envio pode levar até um minuto.
              </span>
            )}

            <div className="grid grid-cols-1 gap-[18px] min-[561px]:grid-cols-2">{fields}</div>
          </div>

          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button type="button" className={`${BTN} border border-[#e4e1db] bg-transparent px-[18px] font-medium text-[#1a1a1a] hover:border-[#d3d0c9]`} onClick={voltar}>
                <Icon name="back" />
                Voltar
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className={`${BTN} border-0 bg-[#c2410c] px-5 font-semibold text-white hover:enabled:bg-[#9a3412] disabled:cursor-not-allowed disabled:bg-[#f1efeb] disabled:text-[#9a9a9a]`} disabled={sending}>
              {isLast ? (sending ? "Criando conta…" : "Criar conta") : "Continuar"}
              <Icon name={isLast ? "check" : "forward"} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}