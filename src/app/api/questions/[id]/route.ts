import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import QuestionModel from '@/models/Question';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - buscar questao por id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();
  const doc = await QuestionModel.findById(id).lean();

  if (!doc) {
    return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
  }

  return NextResponse.json({
    id: doc._id.toString(),
    enunciado: doc.enunciado,
    alternativas: doc.alternativas,
    materia: doc.materia,
    semestre: doc.semestre,
    professorId: doc.professorId,
    createdAt: doc.createdAt,
    imagemUrl: doc.imagemUrl,
    feedbackAcerto: doc.feedbackAcerto,
    feedbackErro: doc.feedbackErro,
    tags: doc.tags || [],
  });
}

// PUT - atualizar questao
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const { enunciado, alternativas, alternativaCorreta, materia, semestre, feedbackAcerto, feedbackErro, tags } =
    await req.json();

  await connectDB();

  const alts = alternativas.map((texto: string, index: number) => ({
    texto,
    correta: index === alternativaCorreta,
  }));

  await QuestionModel.findByIdAndUpdate(id, {
    enunciado,
    alternativas: alts,
    materia,
    semestre,
    feedbackAcerto: feedbackAcerto || undefined,
    feedbackErro: feedbackErro || undefined,
    tags: Array.isArray(tags) ? tags.filter((t: string) => t.trim()) : [],
  });

  return NextResponse.json({ success: true });
}

// DELETE - excluir questao
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();
  await QuestionModel.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
