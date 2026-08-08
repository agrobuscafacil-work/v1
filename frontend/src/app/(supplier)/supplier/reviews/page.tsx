'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface SupplierReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string };
  product?: { id: string; name: string } | null;
  service?: { id: string; name: string } | null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SupplierReviewsPage() {
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const meRes = await api.get('/suppliers/me');
        const supplierId = meRes.data.data?.id;
        if (!supplierId) {
          toast.error('Loja não encontrada.');
          return;
        }
        const res = await api.get(`/reviews?supplierId=${supplierId}&limit=50`);
        if (cancelled) return;
        setReviews(res.data.data?.data ?? []);
      } catch (err: any) {
        if (cancelled) return;
        toast.error(err?.response?.data?.message || 'Erro ao carregar avaliações.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Avaliações</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Veja o que seus clientes estão dizendo.</p>
      </div>
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma avaliação aprovada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.user?.name ?? 'Cliente'}</p>
                  <p className="text-xs text-gray-500">
                    {r.product?.name ?? r.service?.name ?? 'Avaliação geral'} - {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              {r.title && <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{r.title}</p>}
              {r.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
