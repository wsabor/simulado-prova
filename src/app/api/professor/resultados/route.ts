import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import TentativaModel from '@/models/Tentativa';
import ProvaModel from '@/models/Prova';
import UserModel from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await connectDB();

  const searchParams = req.nextUrl.searchParams;
  const turma = searchParams.get('turma') || '';
  const provaId = searchParams.get('provaId') || '';
  const materia = searchParams.get('materia') || '';
  const semestre = searchParams.get('semestre') || '';

  // Buscar provas do professor (ou todas se admin)
  const provaFilter: Record<string, unknown> = {};
  if (session.user.role === 'professor') {
    provaFilter.professorId = session.user.id;
  }
  const provas = await ProvaModel.find(provaFilter).lean();
  const provaIds = provas.map((p) => p._id.toString());

  // Buscar alunos (com filtro de turma se aplicável)
  const alunoFilter: Record<string, unknown> = { role: 'aluno' };
  if (turma) {
    alunoFilter.turma = turma;
  }
  const alunos = await UserModel.find(alunoFilter).select('-password').lean();
  const alunosMap = new Map(alunos.map((a) => [a._id.toString(), a]));
  const alunoIds = alunos.map((a) => a._id.toString());

  // Buscar tentativas finalizadas
  const tentativaFilter: Record<string, unknown> = {
    finalizada: { $ne: null },
    provaId: { $in: provaIds },
  };

  // Filtrar por turma: limitar aos alunos da turma
  if (turma) {
    tentativaFilter.alunoId = { $in: alunoIds };
  }

  // Filtrar por prova específica
  if (provaId) {
    tentativaFilter.provaId = provaId;
  }

  const tentativas = await TentativaModel.find(tentativaFilter)
    .sort({ finalizada: -1 })
    .lean();

  // Filtrar por matéria/semestre (via prova)
  const provasMap = new Map(provas.map((p) => [p._id.toString(), p]));
  let tentativasFiltradas = tentativas;

  if (materia) {
    tentativasFiltradas = tentativasFiltradas.filter((t) => {
      const prova = provasMap.get(t.provaId);
      return prova?.materias.includes(materia);
    });
  }

  if (semestre) {
    const semestreNum = parseInt(semestre);
    tentativasFiltradas = tentativasFiltradas.filter((t) => {
      const prova = provasMap.get(t.provaId);
      return prova?.semestres.includes(semestreNum);
    });
  }

  // Montar dados de resultado
  const resultados = tentativasFiltradas.map((t) => {
    const prova = provasMap.get(t.provaId);
    const aluno = alunosMap.get(t.alunoId);
    return {
      tentativaId: t._id.toString(),
      provaId: t.provaId,
      provaTitulo: prova?.titulo || 'Prova removida',
      provaMaterias: prova?.materias || [],
      provaSemestres: prova?.semestres || [],
      alunoId: t.alunoId,
      alunoNome: aluno?.name || 'Aluno removido',
      alunoEmail: aluno?.email || '',
      alunoTurma: aluno?.turma || 'Sem turma',
      nota: t.nota,
      totalQuestoes: t.questoesSorteadas.length,
      finalizada: t.finalizada,
    };
  });

  // Estatísticas gerais
  const notas = resultados.filter((r) => r.nota !== null).map((r) => r.nota as number);
  const stats = {
    totalTentativas: resultados.length,
    mediaGeral: notas.length > 0 ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : 0,
    maiorNota: notas.length > 0 ? Math.max(...notas) : 0,
    menorNota: notas.length > 0 ? Math.min(...notas) : 0,
    aprovados: notas.filter((n) => n >= 6).length,
    reprovados: notas.filter((n) => n < 6).length,
  };

  // Distribuição de notas (para gráfico)
  const distribuicao = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0-10
  notas.forEach((n) => {
    const idx = Math.min(Math.floor(n), 10);
    distribuicao[idx]++;
  });

  // Médias por prova (para gráfico)
  const mediasPorProva: { provaTitulo: string; media: number; count: number }[] = [];
  const provaGroups = new Map<string, number[]>();
  resultados.forEach((r) => {
    if (r.nota !== null) {
      const key = r.provaId;
      if (!provaGroups.has(key)) provaGroups.set(key, []);
      provaGroups.get(key)!.push(r.nota);
    }
  });
  provaGroups.forEach((notasProva, pid) => {
    const prova = provasMap.get(pid);
    mediasPorProva.push({
      provaTitulo: prova?.titulo || 'Prova removida',
      media: Math.round((notasProva.reduce((a, b) => a + b, 0) / notasProva.length) * 10) / 10,
      count: notasProva.length,
    });
  });

  // Opções de filtro
  const turmas = [...new Set(alunos.map((a) => a.turma).filter(Boolean))] as string[];
  const materias = [...new Set(provas.flatMap((p) => p.materias))];
  const semestres = [...new Set(provas.flatMap((p) => p.semestres))].sort((a, b) => a - b);

  return NextResponse.json({
    resultados,
    stats,
    distribuicao,
    mediasPorProva,
    filtros: {
      turmas,
      provas: provas.map((p) => ({ id: p._id.toString(), titulo: p.titulo })),
      materias,
      semestres,
    },
  });
}
