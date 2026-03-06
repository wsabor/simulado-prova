import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import ProvaModel from '@/models/Prova';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - listar provas atribuidas ao aluno autenticado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'aluno') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await connectDB();
  const docs = await ProvaModel.find({
    ativa: true,
    alunosAtribuidos: session.user.id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    docs.map((d) => ({
      id: d._id.toString(),
      titulo: d.titulo,
      materias: d.materias,
      semestres: d.semestres,
      numQuestoes: d.numQuestoes,
      tempoLimite: d.tempoLimite,
      professorId: d.professorId,
      ativa: d.ativa,
      createdAt: d.createdAt,
    }))
  );
}
