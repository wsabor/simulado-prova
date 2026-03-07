import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// PUT - toggle ativo/inativo do aluno
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

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  // Toggle ativo
  if ('ativo' in body) {
    user.ativo = body.ativo;
    await user.save();
    return NextResponse.json({ id: user._id.toString(), ativo: user.ativo });
  }

  return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
}
