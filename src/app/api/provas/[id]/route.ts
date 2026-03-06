import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import ProvaModel from '@/models/Prova';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// PUT - atualizar prova (toggle ativa ou update completo)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectDB();

  // Se veio apenas o campo 'ativa', faz toggle
  if ('ativa' in body && Object.keys(body).length === 1) {
    await ProvaModel.findByIdAndUpdate(id, { ativa: body.ativa });
  } else {
    await ProvaModel.findByIdAndUpdate(id, {
      titulo: body.titulo,
      materias: body.materias,
      semestres: body.semestres,
      numQuestoes: body.numQuestoes,
      tempoLimite: body.tempoLimite,
      alunosAtribuidos: body.alunosAtribuidos || [],
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE - excluir prova
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
  await ProvaModel.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
