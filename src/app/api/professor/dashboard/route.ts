import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import QuestionModel from '@/models/Question';
import Prova from '@/models/Prova';
import User from '@/models/User';
import Tentativa from '@/models/Tentativa';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await connectDB();

  const [totalQuestoes, provas, totalAlunos, tentativas] = await Promise.all([
    QuestionModel.countDocuments(),
    Prova.find().lean(),
    User.countDocuments({ role: 'aluno', ativo: true }),
    Tentativa.find({ finalizada: { $ne: null } })
      .sort({ finalizada: -1 })
      .limit(10)
      .lean(),
  ]);

  const provasAtivas = provas.filter((p) => p.ativa).length;

  // Taxa de conclusão: tentativas finalizadas / total de atribuições
  const totalAtribuicoes = provas
    .filter((p) => p.ativa)
    .reduce((sum, p) => sum + (p.alunosAtribuidos?.length || 0), 0);
  const totalFinalizadas = await Tentativa.countDocuments({ finalizada: { $ne: null } });
  const taxaConclusao = totalAtribuicoes > 0
    ? Math.round((totalFinalizadas / totalAtribuicoes) * 100)
    : 0;

  // Atividade recente: enriquecer tentativas com nome do aluno e da prova
  const alunoIds = [...new Set(tentativas.map((t) => String(t.alunoId)))];
  const provaIds = [...new Set(tentativas.map((t) => String(t.provaId)))];

  const [alunos, provasInfo] = await Promise.all([
    User.find({ _id: { $in: alunoIds } }).select('name').lean(),
    Prova.find({ _id: { $in: provaIds } }).select('titulo').lean(),
  ]);

  const alunoMap = Object.fromEntries(alunos.map((a) => [String(a._id), a.name]));
  const provaMap = Object.fromEntries(provasInfo.map((p) => [String(p._id), p.titulo]));

  const atividadeRecente = tentativas.map((t) => ({
    alunoNome: alunoMap[String(t.alunoId)] || 'Desconhecido',
    provaTitulo: provaMap[String(t.provaId)] || 'Prova removida',
    nota: t.nota,
    finalizada: t.finalizada,
  }));

  return NextResponse.json({
    totalQuestoes,
    provasAtivas,
    totalAlunos,
    taxaConclusao,
    atividadeRecente,
  });
}
