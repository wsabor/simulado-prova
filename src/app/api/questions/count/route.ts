import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import QuestionModel from '@/models/Question';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET - contar questoes por filtros
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['professor', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const materias = searchParams.get('materias')?.split(',').filter(Boolean) || [];
  const semestres = searchParams.get('semestres')?.split(',').map(Number).filter(Boolean) || [];

  await connectDB();

  const count = await QuestionModel.countDocuments({
    professorId: session.user.id,
    materia: { $in: materias },
    semestre: { $in: semestres },
  });

  return NextResponse.json({ count });
}
