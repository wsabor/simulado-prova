import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

interface AlunoImport {
  name: string;
  email: string;
  turma?: string;
  password?: string;
}

// POST - importar alunos em lote
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { alunos, senhaPadrao } = await req.json() as {
    alunos: AlunoImport[];
    senhaPadrao?: string;
  };

  if (!Array.isArray(alunos) || alunos.length === 0) {
    return NextResponse.json({ error: 'Lista de alunos vazia' }, { status: 400 });
  }

  if (alunos.length > 200) {
    return NextResponse.json({ error: 'Máximo de 200 alunos por importação' }, { status: 400 });
  }

  const defaultPassword = senhaPadrao || 'senai123';
  if (defaultPassword.length < 4) {
    return NextResponse.json({ error: 'Senha padrão deve ter no mínimo 4 caracteres' }, { status: 400 });
  }

  await connectDB();

  const resultados: { name: string; email: string; status: 'criado' | 'erro'; erro?: string }[] = [];
  const hashedDefault = await bcrypt.hash(defaultPassword, 10);

  for (const aluno of alunos) {
    const name = aluno.name?.trim();
    const email = aluno.email?.trim()?.toLowerCase();
    const turma = aluno.turma?.trim() || '';

    if (!name || !email) {
      resultados.push({
        name: name || '(sem nome)',
        email: email || '(sem email)',
        status: 'erro',
        erro: 'Nome e email são obrigatórios',
      });
      continue;
    }

    // Validar formato de email básico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      resultados.push({ name, email, status: 'erro', erro: 'Email inválido' });
      continue;
    }

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        resultados.push({ name, email, status: 'erro', erro: 'Email já cadastrado' });
        continue;
      }

      // Usar senha individual se fornecida, senão a padrão
      const hash = aluno.password
        ? await bcrypt.hash(aluno.password, 10)
        : hashedDefault;

      await User.create({
        name,
        email,
        password: hash,
        role: 'aluno',
        turma: turma || undefined,
      });

      resultados.push({ name, email, status: 'criado' });
    } catch {
      resultados.push({ name, email, status: 'erro', erro: 'Erro interno ao criar' });
    }
  }

  const criados = resultados.filter((r) => r.status === 'criado').length;
  const erros = resultados.filter((r) => r.status === 'erro').length;

  return NextResponse.json({ criados, erros, total: alunos.length, resultados });
}
