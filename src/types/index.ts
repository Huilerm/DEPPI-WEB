export type Cargo = "ALUNO" | "PROFESSOR" | "ADMIN" | "DEPPI";
export type StatusCurso = "ANALISE" | "ANDAMENTO" | "CONCLUIDO" | "FECHADO";
export type StatusInscricao = "PENDENTE" | "DEFERIDO" | "INDEFERIDO" | "CANCELADO";

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  cargos: Cargo[];
  alunoId?: string;
  professorId?: string;
}

export interface Instituicao {
  id: string;
  nome: string;
  cidade: string;
  campus: string;
  cnpj: string;
}

export interface Curso {
  id: string;
  nome: string;
  carga_horaria: number;
  vagas: number;
  status: StatusCurso;
  dataInicio: string; 
  dataFim: string;
  horarioInicio: string; 
  horarioFim: string;
  Instituicao: Instituicao;
  vagasOcupadas: number;
  vagasDisponiveis: number;
}

export interface InscricaoResumo {
  id: string;
  data: string;
  status: StatusInscricao;
  aluno: { usuario: { id: string; nome: string; emailInstitucional: string } };
  curso: { id: string; nome: string; vagas: number };
}

export interface ContagemPorStatus<S extends string> {
  status: S;
  quantidade: number;
}

export interface ResumoSistema {
  geradoEm: string;
  totais: {
    usuarios: number;
    alunos: number;
    professores: number;
    cursos: number;
    inscricoes: number;
    instituicoes: number;
    vagasRestantes: number;
  };
  inscricoesPorSituacao: ContagemPorStatus<StatusInscricao>[];
  cursosPorSituacao: ContagemPorStatus<StatusCurso>[];
}

export interface UsuarioLista { //Tipos adicionados para a listagem de usuários no painel de administração
  id: string;
  nome: string;
  emailInstitucional: string;
  criadoEm: string;
  cargos: { cargo: Cargo }[];
}

export interface CursoRelatorio {
  id: string;
  nome: string;
  status: StatusCurso;
  _count: { inscricao: number };
}

export interface ProfessorUsuario {
  id: string;
  nome: string;
  nomeSocial: string | null;
  emailInstitucional: string;
  emailSecundario: string | null;
}

export interface Professor {
  id: string;
  siape: string;
  emailSiape: string | null;
  emailNotificacoes: string | null;
  emailClassroom: string | null;
  telefonesInstitucionais: string[];
  telefonesPessoais: string[];
  emPGD: boolean | null;
  titulacao: string | null;
  escolaridade: string | null;
  setorSuap: string | null;
  lotacaoSiape: string | null;
  situacao: string | null;
  regimeTrabalho: string | null;
  jornadaTrabalho: string | null;
  usuario: ProfessorUsuario;
}

export interface MinhaInscricao {
  id: string;
  data: string;
  status: StatusInscricao;

  curso?: {
    id?: string;
    nome: string;
    vagas?: number;
    Instituicao?: {
      nome?: string;
      campus?: string;
    };
  };

  documentos?: DocumentoInscricao[];

  rendaFamiliar?: {
    rendaFamiliar: number;
    numeroPessoas: number;
  } | null;
}

export type CategoriaDocumento =
  | "RG"
  | "CPF"
  | "COMPROVANTE_RESIDENCIA"
  | "COMPROVANTE_RENDA"
  | "HISTORICO_ESCOLAR"
  | "OUTRO";

export interface DocumentoInscricao {
  id: string;
  categoria: CategoriaDocumento | null;
  nomeOriginal: string;
  caminho: string;
  tamanho: number;
  tipoMime?: string;
  criadoEm: string;
}

export interface RendaFamiliar {
  rendaFamiliar: number;
  numeroPessoas: number;
}

export interface InscricaoDetalhe extends InscricaoResumo {
  rendaFamiliar?: RendaFamiliar | null;
}

export interface HistoricoInscricao {
  id: string;
  alteracao: string;
  statusAnterior: StatusInscricao | null;
  statusAtual: StatusInscricao;
  dataModificacao: string;
  descricao: string;
  usuario?: {
    nome?: string;
  } | null;
}
