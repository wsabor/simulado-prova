import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { name: name.trim() },
    { new: true }
  ).select('-password');

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
  });
}
