import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import ProvaModel from '@/models/Prova';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - listar provas do professor autenticado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await connectDB();
  const docs = await ProvaModel.find({ professorId: session.user.id })
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
      alunosAtribuidos: d.alunosAtribuidos || [],
      dataInicio: d.dataInicio,
      dataFim: d.dataFim,
    }))
  );
}

// POST - criar prova
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { titulo, materias, semestres, numQuestoes, tempoLimite, alunosAtribuidos } =
    await req.json();

  if (!titulo || !materias?.length || !semestres?.length) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  await connectDB();

  const doc = await ProvaModel.create({
    titulo,
    materias,
    semestres,
    numQuestoes,
    tempoLimite,
    professorId: session.user.id,
    ativa: true,
    alunosAtribuidos: alunosAtribuidos || [],
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}
