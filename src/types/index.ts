// User Types
export type UserRole = 'admin' | 'professor' | 'aluno';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  turma?: string;
  createdAt: Date;
}

// Question Types
export interface Alternativa {
  texto: string;
  correta: boolean;
}

export interface Question {
  id: string;
  enunciado: string;
  alternativas: Alternativa[];
  materia: string;
  semestre: number;
  professorId: string;
  createdAt: Date;
  imagemUrl?: string;
}

// Prova Types
export interface Prova {
  id: string;
  titulo: string;
  materias: string[];
  semestres: number[];
  numQuestoes: number;
  tempoLimite: number; // em minutos
  professorId: string;
  ativa: boolean;
  createdAt: Date;
  dataInicio?: Date;
  dataFim?: Date;
  alunosAtribuidos?: string[]; // IDs dos alunos que podem fazer esta prova
}

// Tentativa Types
export interface QuestaoSorteada {
  questionId: string;
  ordemEmbaralhada: number[]; // índices das alternativas embaralhadas
  respostaAluno: number | null; // índice da alternativa escolhida
}

export interface Tentativa {
  id: string;
  provaId: string;
  alunoId: string;
  questoesSorteadas: QuestaoSorteada[];
  iniciada: Date;
  finalizada: Date | null;
  nota: number | null;
  tempoRestante: number; // em segundos
}

// Form Types
export interface QuestionFormData {
  enunciado: string;
  alternativas: string[];
  alternativaCorreta: number;
  materia: string;
  semestre: number;
}

export interface ProvaFormData {
  titulo: string;
  materias: string[];
  semestres: number[];
  numQuestoes: number;
  tempoLimite: number;
  alunosAtribuidos: string[];
}
