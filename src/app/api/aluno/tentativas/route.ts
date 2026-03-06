import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import TentativaModel from '@/models/Tentativa';
import ProvaModel from '@/models/Prova';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - listar tentativas finalizadas do aluno
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'aluno') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await connectDB();

  const tentativas = await TentativaModel.find({
    alunoId: session.user.id,
    finalizada: { $ne: null },
  })
    .sort({ finalizada: -1 })
    .lean();

  // Buscar dados das provas
  const provaIds = [...new Set(tentativas.map((t) => t.provaId))];
  const provas = await ProvaModel.find({ _id: { $in: provaIds } }).lean();
  const provasMap = new Map(provas.map((p) => [p._id.toString(), p]));

  const resultado = tentativas.map((t) => {
    const prova = provasMap.get(t.provaId);
    return {
      id: t._id.toString(),
      provaId: t.provaId,
      provaTitulo: prova?.titulo || 'Prova removida',
      provaMaterias: prova?.materias || [],
      nota: t.nota,
      totalQuestoes: t.questoesSorteadas.length,
      acertos: t.questoesSorteadas.filter((qs) => {
        // Não recalcular aqui, usar nota salva
        return false; // placeholder - usamos nota diretamente
      }).length,
      finalizada: t.finalizada,
    };
  });

  return NextResponse.json(resultado);
}
