import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProva extends Document {
  titulo: string;
  materias: string[];
  semestres: number[];
  numQuestoes: number;
  tempoLimite: number;
  professorId: string;
  ativa: boolean;
  alunosAtribuidos: string[];
  dataInicio?: Date;
  dataFim?: Date;
  createdAt: Date;
}

const ProvaSchema = new Schema<IProva>(
  {
    titulo: { type: String, required: true },
    materias: { type: [String], required: true },
    semestres: { type: [Number], required: true },
    numQuestoes: { type: Number, required: true },
    tempoLimite: { type: Number, required: true },
    professorId: { type: String, required: true, index: true },
    ativa: { type: Boolean, default: true },
    alunosAtribuidos: { type: [String], default: [] },
    dataInicio: { type: Date },
    dataFim: { type: Date },
  },
  { timestamps: true }
);

const Prova: Model<IProva> =
  mongoose.models.Prova || mongoose.model<IProva>('Prova', ProvaSchema);

export default Prova;
