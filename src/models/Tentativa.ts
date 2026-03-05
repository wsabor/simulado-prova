import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestaoSorteada {
  questionId: string;
  ordemEmbaralhada: number[];
  respostaAluno: number | null;
}

export interface ITentativa extends Document {
  provaId: string;
  alunoId: string;
  questoesSorteadas: IQuestaoSorteada[];
  iniciada: Date;
  finalizada: Date | null;
  nota: number | null;
  tempoRestante: number;
}

const QuestaoSorteadaSchema = new Schema<IQuestaoSorteada>(
  {
    questionId: { type: String, required: true },
    ordemEmbaralhada: { type: [Number], required: true },
    respostaAluno: { type: Number, default: null },
  },
  { _id: false }
);

const TentativaSchema = new Schema<ITentativa>(
  {
    provaId: { type: String, required: true, index: true },
    alunoId: { type: String, required: true, index: true },
    questoesSorteadas: { type: [QuestaoSorteadaSchema], required: true },
    iniciada: { type: Date, required: true },
    finalizada: { type: Date, default: null },
    nota: { type: Number, default: null },
    tempoRestante: { type: Number, required: true },
  },
  { timestamps: false }
);

const Tentativa: Model<ITentativa> =
  mongoose.models.Tentativa || mongoose.model<ITentativa>('Tentativa', TentativaSchema);

export default Tentativa;
