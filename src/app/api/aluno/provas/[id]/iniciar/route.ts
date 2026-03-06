import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import ProvaModel from '@/models/Prova';
import QuestionModel from '@/models/Question';
import TentativaModel from '@/models/Tentativa';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// POST - iniciar uma tentativa de prova
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'aluno') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id: provaId } = await params;
  await connectDB();

  // Verificar se a prova existe e o aluno está atribuído
  const prova = await ProvaModel.findById(provaId).lean();
  if (!prova) {
    return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
  }
  if (!prova.ativa) {
    return NextResponse.json({ error: 'Esta prova não está ativa' }, { status: 400 });
  }
  if (!prova.alunosAtribuidos.includes(session.user.id)) {
    return NextResponse.json({ error: 'Você não está atribuído a esta prova' }, { status: 403 });
  }

  // Verificar se já existe tentativa em andamento
  const tentativaExistente = await TentativaModel.findOne({
    provaId,
    alunoId: session.user.id,
    finalizada: null,
  }).lean();

  if (tentativaExistente) {
    // Retornar tentativa existente com questões
    const questionIds = tentativaExistente.questoesSorteadas.map((q) => q.questionId);
    const questions = await QuestionModel.find({ _id: { $in: questionIds } }).lean();
    const questionsMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const questoesComDados = tentativaExistente.questoesSorteadas.map((qs) => {
      const q = questionsMap.get(qs.questionId);
      if (!q) return null;
      // Reordenar alternativas conforme embaralhamento
      const alternativasEmbaralhadas = qs.ordemEmbaralhada.map((idx) => ({
        texto: q.alternativas[idx].texto,
      }));
      return {
        questionId: qs.questionId,
        enunciado: q.enunciado,
        materia: q.materia,
        imagemUrl: q.imagemUrl || null,
        alternativas: alternativasEmbaralhadas,
        respostaAluno: qs.respostaAluno,
      };
    }).filter(Boolean);

    // Calcular tempo restante baseado no tempo decorrido
    const tempoDecorrido = Math.floor(
      (Date.now() - new Date(tentativaExistente.iniciada).getTime()) / 1000
    );
    const tempoTotal = prova.tempoLimite * 60;
    const tempoRestante = Math.max(0, tempoTotal - tempoDecorrido);

    return NextResponse.json({
      tentativaId: tentativaExistente._id.toString(),
      provaTitle: prova.titulo,
      tempoRestante,
      questoes: questoesComDados,
    });
  }

  // Sortear questões do banco
  const questoesDisponiveis = await QuestionModel.find({
    materia: { $in: prova.materias },
    semestre: { $in: prova.semestres },
  }).lean();

  if (questoesDisponiveis.length < prova.numQuestoes) {
    return NextResponse.json(
      { error: `Questões insuficientes no banco (${questoesDisponiveis.length}/${prova.numQuestoes})` },
      { status: 400 }
    );
  }

  // Embaralhar e selecionar
  const questoesSelecionadas = shuffle(questoesDisponiveis).slice(0, prova.numQuestoes);

  // Criar questões sorteadas com alternativas embaralhadas
  const questoesSorteadas = questoesSelecionadas.map((q) => {
    const indices = q.alternativas.map((_, i) => i);
    const ordemEmbaralhada = shuffle(indices);
    return {
      questionId: q._id.toString(),
      ordemEmbaralhada,
      respostaAluno: null,
    };
  });

  // Criar tentativa
  const tentativa = await TentativaModel.create({
    provaId,
    alunoId: session.user.id,
    questoesSorteadas,
    iniciada: new Date(),
    finalizada: null,
    nota: null,
    tempoRestante: prova.tempoLimite * 60,
  });

  // Preparar resposta com dados das questões (sem revelar alternativa correta)
  const questoesComDados = questoesSelecionadas.map((q, idx) => {
    const qs = questoesSorteadas[idx];
    const alternativasEmbaralhadas = qs.ordemEmbaralhada.map((origIdx) => ({
      texto: q.alternativas[origIdx].texto,
    }));
    return {
      questionId: q._id.toString(),
      enunciado: q.enunciado,
      materia: q.materia,
      imagemUrl: q.imagemUrl || null,
      alternativas: alternativasEmbaralhadas,
      respostaAluno: null,
    };
  });

  return NextResponse.json({
    tentativaId: tentativa._id.toString(),
    provaTitle: prova.titulo,
    tempoRestante: prova.tempoLimite * 60,
    questoes: questoesComDados,
  });
}
