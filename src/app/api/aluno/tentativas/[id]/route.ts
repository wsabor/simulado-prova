import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Tentativa from '@/models/Tentativa';
import QuestionModel from '@/models/Question';
import Prova from '@/models/Prova';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - dados completos da tentativa para revisão
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'aluno') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const tentativa = await Tentativa.findById(id).lean();
  if (!tentativa) {
    return NextResponse.json({ error: 'Tentativa não encontrada' }, { status: 404 });
  }

  if (String(tentativa.alunoId) !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  if (!tentativa.finalizada) {
    return NextResponse.json({ error: 'Tentativa ainda em andamento' }, { status: 400 });
  }

  const prova = await Prova.findById(tentativa.provaId).lean();
  if (!prova) {
    return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
  }

  // Buscar questões originais
  const questionIds = tentativa.questoesSorteadas.map((q) => q.questionId);
  const questoes = await QuestionModel.find({ _id: { $in: questionIds } }).lean();
  const questaoMap = Object.fromEntries(questoes.map((q) => [String(q._id), q]));

  // Montar revisão com gabarito
  const revisao = tentativa.questoesSorteadas.map((qs, index) => {
    const questao = questaoMap[qs.questionId];
    if (!questao) return null;

    // Alternativas na ordem embaralhada (como o aluno viu)
    const alternativasEmbaralhadas = qs.ordemEmbaralhada.map((origIdx) => ({
      texto: questao.alternativas[origIdx].texto,
      correta: questao.alternativas[origIdx].correta,
    }));

    // Índice correto na ordem embaralhada
    const indiceCorretoEmbaralhado = qs.ordemEmbaralhada.findIndex(
      (origIdx) => questao.alternativas[origIdx].correta
    );

    const acertou = qs.respostaAluno === indiceCorretoEmbaralhado;

    return {
      numero: index + 1,
      enunciado: questao.enunciado,
      imagemUrl: questao.imagemUrl,
      alternativas: alternativasEmbaralhadas.map((a) => a.texto),
      respostaAluno: qs.respostaAluno,
      respostaCorreta: indiceCorretoEmbaralhado,
      acertou,
      feedback: acertou ? questao.feedbackAcerto : questao.feedbackErro,
    };
  }).filter(Boolean);

  return NextResponse.json({
    provaTitulo: prova.titulo,
    nota: tentativa.nota,
    finalizada: tentativa.finalizada,
    totalQuestoes: revisao.length,
    acertos: revisao.filter((q) => q?.acertou).length,
    questoes: revisao,
  });
}
