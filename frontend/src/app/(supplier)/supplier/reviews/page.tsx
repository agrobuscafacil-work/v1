'use client';

import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const reviews = [
  { id: '1', user: 'João Silva', product: 'Semente de Soja', rating: 5, comment: 'Excelente produto!', date: '28/07/2026' },
  { id: '2', user: 'Maria Oliveira', product: 'Fertilizante NPK', rating: 4, comment: 'Muito bom, entrega rápida.', date: '27/07/2026' },
  { id: '3', user: 'Carlos Pereira', product: 'Defensivo Glifosato', rating: 3, comment: 'Produto ok, mas validade curta.', date: '25/07/2026' },
];

export default function SupplierReviewsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Avaliações</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Veja o que seus clientes estão dizendo.</p>
      </div>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{r.user}</p>
                <p className="text-xs text-gray-500">{r.product} - {r.date}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
