'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfessorLayout } from '@/components/professor/ProfessorLayout';
import { QuestionFormData } from '@/types';

export default function NovaQuestaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<QuestionFormData>({
    enunciado: '',
    alternativas: ['', '', '', '', ''],
    alternativaCorreta: 0,
    materia: '',
    semestre: 1,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

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
      setLoading(true);
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Erro ao criar questão');
      alert('Questão criada com sucesso!');
      router.push('/professor/questoes');
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Erro ao criar questão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAlternativaChange = (index: number, value: string) => {
    const newAlternativas = [...formData.alternativas];
    newAlternativas[index] = value;
    setFormData({ ...formData, alternativas: newAlternativas });
  };

  return (
    <ProfessorLayout titulo="Nova Questão" subtitulo="Adicionar questão ao banco">
          <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
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

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags / Categorias (opcional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const tag = tagInput.trim();
                      if (tag && !(formData.tags || []).includes(tag)) {
                        setFormData({ ...formData, tags: [...(formData.tags || []), tag] });
                      }
                      setTagInput('');
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite uma tag e pressione Enter"
                />
                <button
                  type="button"
                  onClick={() => {
                    const tag = tagInput.trim();
                    if (tag && !(formData.tags || []).includes(tag)) {
                      setFormData({ ...formData, tags: [...(formData.tags || []), tag] });
                    }
                    setTagInput('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Adicionar
                </button>
              </div>
              {(formData.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tags: (formData.tags || []).filter((_, idx) => idx !== i) })}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-teal-200 transition-colors"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Pressione Enter ou clique em Adicionar para inserir cada tag
              </p>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Feedback (opcional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-green-600 mb-1">Feedback de Acerto</label>
                  <textarea
                    value={formData.feedbackAcerto || ''}
                    onChange={(e) => setFormData({ ...formData, feedbackAcerto: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                    placeholder="Exibido quando o aluno acertar a questão..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-red-600 mb-1">Feedback de Erro</label>
                  <textarea
                    value={formData.feedbackErro || ''}
                    onChange={(e) => setFormData({ ...formData, feedbackErro: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                    placeholder="Exibido quando o aluno errar a questão..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/professor/questoes')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Questão
                  </>
                )}
              </button>
            </div>
          </form>
    </ProfessorLayout>
  );
}
