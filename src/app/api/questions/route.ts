import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import QuestionModel from '@/models/Question';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - listar questoes do professor autenticado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await connectDB();
  const docs = await QuestionModel.find({ professorId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    docs.map((d) => ({
      id: d._id.toString(),
      enunciado: d.enunciado,
      alternativas: d.alternativas,
      materia: d.materia,
      semestre: d.semestre,
      professorId: d.professorId,
      createdAt: d.createdAt,
      imagemUrl: d.imagemUrl,
      feedbackAcerto: d.feedbackAcerto,
      feedbackErro: d.feedbackErro,
    }))
  );
}

// POST - criar questao
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { enunciado, alternativas, alternativaCorreta, materia, semestre, feedbackAcerto, feedbackErro } =
    await req.json();

  if (!enunciado || !alternativas || !materia || semestre == null) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  await connectDB();

  const alts = alternativas.map((texto: string, index: number) => ({
    texto,
    correta: index === alternativaCorreta,
  }));

  const doc = await QuestionModel.create({
    enunciado,
    alternativas: alts,
    materia,
    semestre,
    professorId: session.user.id,
    feedbackAcerto: feedbackAcerto || undefined,
    feedbackErro: feedbackErro || undefined,
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}
