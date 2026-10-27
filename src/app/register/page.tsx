"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

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
      className={`${styles.icon} ${className}`}
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
    <div className={`${styles.field} ${full ? styles.full : ""}`}>
      <label className={styles.label} htmlFor={name}>
        {label} {optional && <span className={styles.optional}>(opcional)</span>}
      </label>
      <div className={styles.control}>
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
            styles.input,
            mono || isDate ? styles.mono : "",
            isDate ? styles.date : "",
            isDate || error ? styles.hasIcon : "",
            error ? styles.invalid : "",
          ].join(" ")}
        />
        {isDate ? (
          <Icon name="calendar" className={styles.trailing} />
        ) : (
          error && (
            <Icon name="error" className={`${styles.trailing} ${styles.trailingError}`} />
          )
        )}
      </div>
      {error ? (
        <span id={`${name}-erro`} className={styles.errorText}>{error}</span>
      ) : (
        hint && <span className={styles.hint}>{hint}</span>
      )}
    </div>
  );
}

function SelectField({
  name, label, full, values, errors, onChange, options, placeholder = "Selecione",
}: FieldProps & { options: [string, string][]; placeholder?: string }) {
  const error = errors[name];
  return (
    <div className={`${styles.field} ${full ? styles.full : ""}`}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      <div className={styles.control}>
        <select
          id={name}
          name={name}
          value={values[name]}
          onChange={(ev) => onChange(name, ev.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-erro` : undefined}
          className={`${styles.input} ${styles.hasIcon} ${error ? styles.invalid : ""}`}
          style={{ color: values[name] ? undefined : "#6b6b6b" }}
        >
          <option value="">{placeholder}</option>
          {options.map(([value, text]) => (
            <option key={value} value={value}>{text}</option>
          ))}
        </select>
        <Icon name="chevron" size={20} className={styles.trailing} />
      </div>
      {error && <span id={`${name}-erro`} className={styles.errorText}>{error}</span>}
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
    <main className={styles.page}>
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      <div className={styles.column}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden>D</div>
            <h1 className={styles.brandName}>DEPPI</h1>
          </div>
          <a className={styles.link} href="/login">Já tenho conta</a>
        </div>

        <div className={styles.intro}>
          <h2 className={styles.title}>Crie sua conta</h2>
          <p className={styles.subtitle}>
            Você mesmo preenche seus dados — leva uns 5 minutos. Tenha seu RG, CPF e título de eleitor em mãos.
          </p>
        </div>

        <div className={styles.progressWrap}>
          <div
            className={styles.bar}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            aria-label={`Passo ${step + 1} de ${STEPS.length}`}
          >
            <div className={styles.barFill} style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <li
                  key={s.label}
                  className={[
                    styles.step,
                    state === "todo" ? styles.stepTodo : "",
                    state === "active" ? styles.stepActive : "",
                  ].join(" ")}
                  aria-current={state === "active" ? "step" : undefined}
                >
                  <span
                    className={[
                      styles.stepNum,
                      state === "done" ? styles.stepNumDone : "",
                      state === "todo" ? styles.stepNumTodo : "",
                    ].join(" ")}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span className={styles.stepLabel}>{s.label}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <form onSubmit={onSubmit} noValidate style={{ display: "contents" }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{STEPS[step].title}</h2>

            {serverError && (
              <div className={styles.alert} role="alert">
                <Icon name="error" />
                <span>{serverError}</span>
              </div>
            )}

            {sending && (
              <span className={styles.hint} role="status">
                Se o servidor estava inativo, o primeiro envio pode levar até um minuto.
              </span>
            )}

            <div className={styles.grid}>{fields}</div>
          </div>

          <div className={styles.actions}>
            {step > 0 ? (
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={voltar}>
                <Icon name="back" />
                Voltar
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={sending}>
              {isLast ? (sending ? "Criando conta…" : "Criar conta") : "Continuar"}
              <Icon name={isLast ? "check" : "forward"} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}