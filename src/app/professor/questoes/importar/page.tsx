'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfessorLayout } from '@/components/professor/ProfessorLayout';

const EXEMPLO_JSON = `[
  {
    "enunciado": "Qual linguagem é usada para estilizar páginas web?",
    "alternativas": [
      "Python",
      "CSS",
      "Java",
      "SQL",
      "PHP"
    ],
    "alternativaCorreta": 1,
    "materia": "Desenvolvimento Web",
    "semestre": 1,
    "feedbackAcerto": "Correto! CSS (Cascading Style Sheets) é a linguagem usada para estilizar páginas web.",
    "feedbackErro": "Incorreto. A resposta correta é CSS (Cascading Style Sheets).",
    "tags": ["CSS", "Estilização"]
  },
  {
    "enunciado": "O que significa HTML?",
    "alternativas": [
      "HyperText Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Language",
      "None of the above"
    ],
    "alternativaCorreta": 0,
    "materia": "Desenvolvimento Web",
    "semestre": 1,
    "imagemUrl": "https://exemplo.com/imagem.png",
    "tags": ["HTML", "Básico"]
  }
]`;

interface ImportResult {
  inseridas: number;
  erros?: { index: number; erro: string }[];
  total: number;
}

export default function ImportarQuestoesPage() {
  const router = useRouter();
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const validarJson = () => {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        return 'O JSON deve ser um array de questões';
      }
      return null;
    } catch {
      return 'JSON inválido. Verifique a formatação.';
    }
  };

  const handleImport = async () => {
    setError('');
    setResult(null);

    const validacao = validarJson();
    if (validacao) {
      setError(validacao);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questoes: JSON.parse(json) }),
      });
      const data: ImportResult = await res.json();
      if (!res.ok) {
        setError((data as unknown as { error: string }).error || 'Erro ao importar');
        return;
      }
      setResult(data);
      if (data.inseridas > 0 && (!data.erros || data.erros.length === 0)) {
        setJson('');
      }
    } catch {
      setError('Erro de conexão ao importar');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJson(ev.target?.result as string);
      setResult(null);
      setError('');
    };
    reader.readAsText(file);
  };

  const copiarExemplo = () => {
    setJson(EXEMPLO_JSON);
    setResult(null);
    setError('');
  };

  return (
    <ProfessorLayout titulo="Importar Questões" subtitulo="Importe questões em lote via JSON">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Editor JSON */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">JSON das Questões</h2>
                  <div className="flex gap-2">
                    <label className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                      Carregar arquivo
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={copiarExemplo}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Usar exemplo
                    </button>
                  </div>
                </div>

                <textarea
                  value={json}
                  onChange={(e) => { setJson(e.target.value); setError(''); setResult(null); }}
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Cole o JSON aqui ou use o botão 'Carregar arquivo'..."
                  spellCheck={false}
                />

                {error && (
                  <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                {result && (
                  <div className={`mt-4 px-4 py-3 rounded-lg text-sm border ${
                    result.erros && result.erros.length > 0
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                    <p className="font-bold">
                      {result.inseridas} de {result.total} questões importadas com sucesso!
                    </p>
                    {result.erros && result.erros.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">Erros encontrados:</p>
                        {result.erros.map((e, i) => (
                          <p key={i} className="text-xs">
                            Questão {e.index + 1}: {e.erro}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleImport}
                  disabled={loading || !json.trim()}
                  className="mt-4 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Importando...' : 'Importar Questões'}
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Formato do JSON</h2>

                <div className="space-y-4 text-sm text-gray-600">
                  <p>O JSON deve ser um <strong>array</strong> de objetos, cada um com:</p>

                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-blue-600">enunciado</p>
                      <p className="text-xs text-gray-500 mt-1">Texto da questão (obrigatório)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-blue-600">alternativas</p>
                      <p className="text-xs text-gray-500 mt-1">Array com 2 a 5 textos (obrigatório)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-blue-600">alternativaCorreta</p>
                      <p className="text-xs text-gray-500 mt-1">Índice da correta, começando em 0 (obrigatório)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-blue-600">materia</p>
                      <p className="text-xs text-gray-500 mt-1">Nome da matéria (obrigatório)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-blue-600">semestre</p>
                      <p className="text-xs text-gray-500 mt-1">Número do semestre (obrigatório)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-green-600">imagemUrl</p>
                      <p className="text-xs text-gray-500 mt-1">URL de imagem (opcional)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-green-600">feedbackAcerto</p>
                      <p className="text-xs text-gray-500 mt-1">Texto exibido ao acertar (opcional)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-green-600">feedbackErro</p>
                      <p className="text-xs text-gray-500 mt-1">Texto exibido ao errar (opcional)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-xs font-bold text-green-600">tags</p>
                      <p className="text-xs text-gray-500 mt-1">Array de strings com categorias (opcional)</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-xs text-blue-700">
                      <strong>Dica:</strong> Clique em "Usar exemplo" para ver um modelo completo no editor, ou carregue um arquivo .json do seu computador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </ProfessorLayout>
  );
}
