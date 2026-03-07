import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import QuestionModel from '@/models/Question';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// POST - importar questões em lote via JSON
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { questoes } = await req.json();

  if (!Array.isArray(questoes) || questoes.length === 0) {
    return NextResponse.json({ error: 'Envie um array de questões' }, { status: 400 });
  }

  await connectDB();

  const erros: { index: number; erro: string }[] = [];
  const docs = [];

  for (let i = 0; i < questoes.length; i++) {
    const q = questoes[i];

    // Validar campos obrigatórios
    if (!q.enunciado || typeof q.enunciado !== 'string') {
      erros.push({ index: i, erro: 'Campo "enunciado" obrigatório' });
      continue;
    }
    if (!q.materia || typeof q.materia !== 'string') {
      erros.push({ index: i, erro: 'Campo "materia" obrigatório' });
      continue;
    }
    if (q.semestre == null || typeof q.semestre !== 'number') {
      erros.push({ index: i, erro: 'Campo "semestre" obrigatório (número)' });
      continue;
    }
    if (!Array.isArray(q.alternativas) || q.alternativas.length < 2 || q.alternativas.length > 5) {
      erros.push({ index: i, erro: 'Campo "alternativas" deve ter entre 2 e 5 itens' });
      continue;
    }
    if (q.alternativaCorreta == null || q.alternativaCorreta < 0 || q.alternativaCorreta >= q.alternativas.length) {
      erros.push({ index: i, erro: `Campo "alternativaCorreta" deve ser entre 0 e ${q.alternativas.length - 1}` });
      continue;
    }

    const alternativas = q.alternativas.map((texto: string, idx: number) => ({
      texto,
      correta: idx === q.alternativaCorreta,
    }));

    docs.push({
      enunciado: q.enunciado,
      alternativas,
      materia: q.materia,
      semestre: q.semestre,
      professorId: session.user.id,
      imagemUrl: q.imagemUrl || undefined,
    });
  }

  let inseridas = 0;
  if (docs.length > 0) {
    const result = await QuestionModel.insertMany(docs);
    inseridas = result.length;
  }

  return NextResponse.json({
    inseridas,
    erros: erros.length > 0 ? erros : undefined,
    total: questoes.length,
  });
}
