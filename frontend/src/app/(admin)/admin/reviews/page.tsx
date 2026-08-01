'use client';

import { useState } from 'react';
import { Star, Search, Trash2, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

const reviews = [
  { id: '1', product: 'Semente de Soja Transgênica', user: 'João Silva', rating: 5, comment: 'Excelente qualidade, germinação acima do esperado!', date: '28/07/2026', status: 'approved' },
  { id: '2', product: 'Fertilizante NPK 20-10-10', user: 'Maria Oliveira', rating: 4, comment: 'Bom produto, entrega rápida.', date: '27/07/2026', status: 'approved' },
  { id: '3', product: 'Defensivo Agrícola Glifosato', user: 'Carlos Pereira', rating: 2, comment: 'Produto veio com prazo de validade curto.', date: '25/07/2026', status: 'pending' },
  { id: '4', product: 'Trator Agrícola 75cv', user: 'Pedro Santos', rating: 5, comment: 'Máquina excepcional, superou as expectativas!', date: '24/07/2026', status: 'approved' },
  { id: '5', product: 'Sistema de Irrigação por Gotejo', user: 'Ana Souza', rating: 1, comment: 'Produto chegou com defeito.', date: '22/07/2026', status: 'pending' },
];

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = reviews.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.product.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    toast.success('Avaliação aprovada!');
  };

  const handleRemove = (id: string) => {
    toast.error('Avaliação removida!');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Avaliações</h1>
          <p className="text-sm text-gray-500 mt-1">Modere as avaliações dos produtos.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por produto..." className="input-field pl-9 text-sm" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field text-sm w-full sm:w-44">
          <option value="all">Todas</option>
          <option value="approved">Aprovadas</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((review) => (
          <div key={review.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{review.product}</p>
                <p className="text-xs text-gray-500">por {review.user} - {review.date}</p>
              </div>
              <div className="flex gap-1">
                {review.status === 'pending' && (
                  <button onClick={() => handleApprove(review.id)} className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950 text-gray-400 hover:text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => handleRemove(review.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
            {review.status === 'pending' && (
              <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">Pendente</span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Star className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma avaliação encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
