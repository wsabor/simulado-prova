'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { QuestionFormData, Question } from '@/types';

export default function EditarQuestaoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<QuestionFormData>({
    enunciado: '',
    alternativas: ['', '', '', '', ''],
    alternativaCorreta: 0,
    materia: '',
    semestre: 1
  });

  useEffect(() => {
    if (user && questionId) {
      loadQuestion();
    }
  }, [user, questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/questions/${questionId}`);
      if (!res.ok) {
        alert('Questão não encontrada');
        router.push('/professor/questoes');
        return;
      }
      const question: Question = await res.json();

      // Verificar se o professor é o dono da questão
      if (question.professorId !== user!.id) {
        alert('Você não tem permissão para editar esta questão');
        router.push('/professor/questoes');
        return;
      }

      // Encontrar qual alternativa é a correta
      const alternativaCorreta = question.alternativas.findIndex(alt => alt.correta);

      setFormData({
        enunciado: question.enunciado,
        alternativas: question.alternativas.map(alt => alt.texto),
        alternativaCorreta: alternativaCorreta !== -1 ? alternativaCorreta : 0,
        materia: question.materia,
        semestre: question.semestre
      });
    } catch (error) {
      console.error('Error loading question:', error);
      alert('Erro ao carregar questão');
      router.push('/professor/questoes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.enunciado.trim()) {
      alert('Por favor, preencha o enunciado da questão');
      return;
    }

    if (formData.alternativas.some(alt => !alt.trim())) {
      alert('Por favor, preencha todas as 5 alternativas');
      return;
    }

    if (!formData.materia.trim()) {
      alert('Por favor, selecione uma matéria');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Erro ao atualizar questão');
      alert('Questão atualizada com sucesso!');
      router.push('/professor/questoes');
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Erro ao atualizar questão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleAlternativaChange = (index: number, value: string) => {
    const newAlternativas = [...formData.alternativas];
    newAlternativas[index] = value;
    setFormData({ ...formData, alternativas: newAlternativas });
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['professor']}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Carregando questão...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['professor']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/professor/questoes')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Editar Questão</h1>
                <p className="text-sm text-gray-500">Modificar questão existente</p>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {/* Enunciado */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enunciado da Questão *
              </label>
              <textarea
                value={formData.enunciado}
                onChange={(e) => setFormData({ ...formData, enunciado: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Digite o enunciado da questão..."
                required
              />
            </div>

            {/* Matéria e Semestre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matéria *
                </label>
                <input
                  type="text"
                  value={formData.materia}
                  onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Desenvolvimento de Sistemas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semestre *
                </label>
                <select
                  value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}º Semestre</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alternativas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Alternativas * (Selecione a correta)
              </label>
              <div className="space-y-3">
                {formData.alternativas.map((alt, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="alternativaCorreta"
                      checked={formData.alternativaCorreta === index}
                      onChange={() => setFormData({ ...formData, alternativaCorreta: index })}
                      className="mt-3 w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      required={index === 0}
                    />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Alternativa {String.fromCharCode(97 + index).toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={alt}
                        onChange={(e) => handleAlternativaChange(index, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Digite a alternativa ${String.fromCharCode(97 + index)}`}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                * Selecione o botão ao lado da alternativa correta
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/professor/questoes')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
