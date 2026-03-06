import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import TentativaModel from '@/models/Tentativa';
import QuestionModel from '@/models/Question';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// PUT - salvar resposta de uma questão
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'aluno') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id: provaId } = await params;
  const body = await req.json();
  const { tentativaId, questionIndex, resposta } = body;

  await connectDB();

  const tentativa = await TentativaModel.findOne({
    _id: tentativaId,
    provaId,
    alunoId: session.user.id,
    finalizada: null,
  });

  if (!tentativa) {
    return NextResponse.json({ error: 'Tentativa não encontrada ou já finalizada' }, { status: 404 });
  }

  // resposta pode ser null (apagar resposta) ou número (índice da alternativa embaralhada)
  if (questionIndex < 0 || questionIndex >= tentativa.questoesSorteadas.length) {
    return NextResponse.json({ error: 'Índice de questão inválido' }, { status: 400 });
  }

  tentativa.questoesSorteadas[questionIndex].respostaAluno =
    resposta !== null && resposta !== undefined ? resposta : null;

  await tentativa.save();

  return NextResponse.json({ ok: true });
}

// POST - finalizar prova
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'aluno') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id: provaId } = await params;
  const body = await req.json();
  const { tentativaId } = body;

  await connectDB();

  const tentativa = await TentativaModel.findOne({
    _id: tentativaId,
    provaId,
    alunoId: session.user.id,
    finalizada: null,
  });

  if (!tentativa) {
    return NextResponse.json({ error: 'Tentativa não encontrada ou já finalizada' }, { status: 404 });
  }

  // Buscar questões para calcular nota
  const questionIds = tentativa.questoesSorteadas.map((q) => q.questionId);
  const questions = await QuestionModel.find({ _id: { $in: questionIds } }).lean();
  const questionsMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let acertos = 0;
  const total = tentativa.questoesSorteadas.length;

  const detalhes = tentativa.questoesSorteadas.map((qs) => {
    const q = questionsMap.get(qs.questionId);
    if (!q) return { acertou: false };

    // respostaAluno é o índice na ordem embaralhada
    // ordemEmbaralhada mapeia para os índices originais
    if (qs.respostaAluno !== null) {
      const indiceOriginal = qs.ordemEmbaralhada[qs.respostaAluno];
      if (q.alternativas[indiceOriginal]?.correta) {
        acertos++;
        return { acertou: true };
      }
    }
    return { acertou: false };
  });

  const nota = total > 0 ? Math.round((acertos / total) * 100) / 10 : 0;

  tentativa.finalizada = new Date();
  tentativa.nota = nota;
  await tentativa.save();

  return NextResponse.json({
    nota,
    acertos,
    total,
    detalhes,
  });
}
