import { connectDB } from '@/lib/mongodb';
import ProvaModel from '@/models/Prova';
import { Prova, ProvaFormData } from '@/types';

function toProva(doc: Record<string, unknown> & { _id: unknown; createdAt: Date }): Prova {
  return {
    id: (doc._id as { toString(): string }).toString(),
    titulo: doc.titulo as string,
    materias: doc.materias as string[],
    semestres: doc.semestres as number[],
    numQuestoes: doc.numQuestoes as number,
    tempoLimite: doc.tempoLimite as number,
    professorId: doc.professorId as string,
    ativa: doc.ativa as boolean,
    createdAt: doc.createdAt,
    alunosAtribuidos: (doc.alunosAtribuidos as string[]) || [],
    dataInicio: doc.dataInicio as Date | undefined,
    dataFim: doc.dataFim as Date | undefined,
  };
}

export const provaService = {
  async createProva(data: ProvaFormData, professorId: string): Promise<string> {
    await connectDB();
    const doc = await ProvaModel.create({
      titulo: data.titulo,
      materias: data.materias,
      semestres: data.semestres,
      numQuestoes: data.numQuestoes,
      tempoLimite: data.tempoLimite,
      professorId,
      ativa: true,
      alunosAtribuidos: data.alunosAtribuidos || [],
    });
    return doc._id.toString();
  },

  async getProvaById(provaId: string): Promise<Prova | null> {
    await connectDB();
    const doc = await ProvaModel.findById(provaId).lean();
    if (!doc) return null;
    return toProva(doc as Parameters<typeof toProva>[0]);
  },

  async getProvasByProfessor(professorId: string): Promise<Prova[]> {
    await connectDB();
    const docs = await ProvaModel.find({ professorId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => toProva(d as Parameters<typeof toProva>[0]));
  },

  async getProvasForAluno(alunoId: string): Promise<Prova[]> {
    await connectDB();
    const docs = await ProvaModel.find({
      ativa: true,
      alunosAtribuidos: alunoId,
    })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d) => toProva(d as Parameters<typeof toProva>[0]));
  },

  async updateProva(provaId: string, data: ProvaFormData): Promise<void> {
    await connectDB();
    await ProvaModel.findByIdAndUpdate(provaId, {
      titulo: data.titulo,
      materias: data.materias,
      semestres: data.semestres,
      numQuestoes: data.numQuestoes,
      tempoLimite: data.tempoLimite,
      alunosAtribuidos: data.alunosAtribuidos || [],
    });
  },

  async toggleProvaAtiva(provaId: string, ativa: boolean): Promise<void> {
    await connectDB();
    await ProvaModel.findByIdAndUpdate(provaId, { ativa });
  },

  async deleteProva(provaId: string): Promise<void> {
    await connectDB();
    await ProvaModel.findByIdAndDelete(provaId);
  },
};
