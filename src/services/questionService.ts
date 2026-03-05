import { connectDB } from '@/lib/mongodb';
import QuestionModel from '@/models/Question';
import { Question, QuestionFormData, Alternativa } from '@/types';

function toQuestion(doc: ReturnType<typeof QuestionModel.prototype.toObject> & { _id: unknown; createdAt: Date }): Question {
  return {
    id: doc._id.toString(),
    enunciado: doc.enunciado,
    alternativas: doc.alternativas as Alternativa[],
    materia: doc.materia,
    semestre: doc.semestre,
    professorId: doc.professorId,
    createdAt: doc.createdAt,
    imagemUrl: doc.imagemUrl,
  };
}

export const questionService = {
  async createQuestion(data: QuestionFormData, professorId: string): Promise<string> {
    await connectDB();

    const alternativas: Alternativa[] = data.alternativas.map((texto, index) => ({
      texto,
      correta: index === data.alternativaCorreta,
    }));

    const doc = await QuestionModel.create({
      enunciado: data.enunciado,
      alternativas,
      materia: data.materia,
      semestre: data.semestre,
      professorId,
    });

    return doc._id.toString();
  },

  async getQuestionById(questionId: string): Promise<Question | null> {
    await connectDB();
    const doc = await QuestionModel.findById(questionId).lean();
    if (!doc) return null;
    return toQuestion(doc as Parameters<typeof toQuestion>[0]);
  },

  async getQuestionsByProfessor(professorId: string): Promise<Question[]> {
    await connectDB();
    const docs = await QuestionModel.find({ professorId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => toQuestion(d as Parameters<typeof toQuestion>[0]));
  },

  async getQuestionsByFilters(
    professorId: string,
    materia?: string,
    semestre?: number
  ): Promise<Question[]> {
    await connectDB();
    const filter: Record<string, unknown> = { professorId };
    if (materia) filter.materia = materia;
    if (semestre) filter.semestre = semestre;

    const docs = await QuestionModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map((d) => toQuestion(d as Parameters<typeof toQuestion>[0]));
  },

  async updateQuestion(questionId: string, data: QuestionFormData): Promise<void> {
    await connectDB();

    const alternativas: Alternativa[] = data.alternativas.map((texto, index) => ({
      texto,
      correta: index === data.alternativaCorreta,
    }));

    await QuestionModel.findByIdAndUpdate(questionId, {
      enunciado: data.enunciado,
      alternativas,
      materia: data.materia,
      semestre: data.semestre,
    });
  },

  async deleteQuestion(questionId: string): Promise<void> {
    await connectDB();
    await QuestionModel.findByIdAndDelete(questionId);
  },

  async countQuestionsByFilters(
    professorId: string,
    materias: string[],
    semestres: number[]
  ): Promise<number> {
    await connectDB();
    return QuestionModel.countDocuments({
      professorId,
      materia: { $in: materias },
      semestre: { $in: semestres },
    });
  },
};
