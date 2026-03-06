'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface ChangeNameFormProps {
  currentName: string;
}

export function ChangeNameForm({ currentName }: ChangeNameFormProps) {
  const { update } = useSession();
  const [name, setName] = useState(currentName);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (name.trim() === currentName) {
      setMessage({ type: 'error', text: 'O nome é o mesmo' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Nome alterado com sucesso! Recarregue a página para ver a mudança no header.' });
        await update({ name: data.name });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao alterar nome' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-600'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Salvando...' : 'Salvar Nome'}
      </button>
    </form>
  );
}
