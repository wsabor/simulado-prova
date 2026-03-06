import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - listar professores (só admin)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await connectDB();
  const professores = await User.find({ role: 'professor' })
    .select('-password')
    .sort({ name: 1 })
    .lean();

  return NextResponse.json(
    professores.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      email: p.email,
      role: p.role,
      createdAt: p.createdAt,
    }))
  );
}

// POST - criar professor (só admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Nome, email e senha são obrigatórios' },
      { status: 400 }
    );
  }

  if (password.length < 4) {
    return NextResponse.json(
      { error: 'Senha deve ter no mínimo 4 caracteres' },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json(
      { error: 'Email já cadastrado' },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'professor',
  });

  return NextResponse.json(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    { status: 201 }
  );
}
