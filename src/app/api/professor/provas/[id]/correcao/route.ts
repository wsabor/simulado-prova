import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Prova from '@/models/Prova';
import QuestionModel from '@/models/Question';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - questões da prova com gabarito e feedback para correção coletiva
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const prova = await Prova.findById(id).lean();
  if (!prova) {
    return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
  }

  // Buscar questões que atendem os filtros da prova
  const questoes = await QuestionModel.find({
    materia: { $in: prova.materias },
    semestre: { $in: prova.semestres },
  }).lean();

  const questoesFormatadas = questoes.map((q, i) => {
    const indiceCorreta = q.alternativas.findIndex((a) => a.correta);
    return {
      numero: i + 1,
      enunciado: q.enunciado,
      imagemUrl: q.imagemUrl,
      alternativas: q.alternativas.map((a) => a.texto),
      respostaCorreta: indiceCorreta,
      feedbackAcerto: q.feedbackAcerto,
      feedbackErro: q.feedbackErro,
      materia: q.materia,
      semestre: q.semestre,
    };
  });

  return NextResponse.json({
    provaTitulo: prova.titulo,
    materias: prova.materias,
    semestres: prova.semestres,
    totalQuestoes: questoesFormatadas.length,
    questoes: questoesFormatadas,
  });
}
