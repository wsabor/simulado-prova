import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAlternativa {
  texto: string;
  correta: boolean;
}

export interface IQuestion extends Document {
  enunciado: string;
  alternativas: IAlternativa[];
  materia: string;
  semestre: number;
  professorId: string;
  imagemUrl?: string;
  feedbackAcerto?: string;
  feedbackErro?: string;
  createdAt: Date;
}

const AlternativaSchema = new Schema<IAlternativa>(
  {
    texto: { type: String, required: true },
    correta: { type: Boolean, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    enunciado: { type: String, required: true },
    alternativas: { type: [AlternativaSchema], required: true },
    materia: { type: String, required: true },
    semestre: { type: Number, required: true },
    professorId: { type: String, required: true, index: true },
    imagemUrl: { type: String },
    feedbackAcerto: { type: String },
    feedbackErro: { type: String },
  },
  { timestamps: true }
);

const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
