import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Senha atual e nova senha são obrigatórias' },
      { status: 400 }
    );
  }

  if (newPassword.length < 4) {
    return NextResponse.json(
      { error: 'Nova senha deve ter no mínimo 4 caracteres' },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 403 });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return NextResponse.json({ message: 'Senha alterada com sucesso' });
}
