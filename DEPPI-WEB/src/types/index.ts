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
