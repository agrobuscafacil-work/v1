'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Search, Trash2, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface AdminReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  images: string[];
  createdAt: string;
  userId: string;
  productId?: string;
  serviceId?: string;
  supplierId?: string;
  user: { id: string; name: string; avatarUrl?: string };
  product?: { id: string; name: string; images: string[] } | null;
  service?: { id: string; name: string } | null;
  supplier?: { id: string; companyName: string; tradingName: string; logoUrl?: string } | null;
}

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reviews/admin', {
        params: { page, limit: 10, status: filter === 'all' ? undefined : filter },
      });
      setReviews(res.data.data?.data ?? []);
      setTotalPages(res.data.data?.meta?.totalPages ?? 1);
    } catch {
      toast.error('Erro ao carregar avaliações');
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/reviews/admin', {
        params: { page, limit: 10, status: filter === 'all' ? undefined : filter },
      })
      .then((res) => {
        if (cancelled) return;
        setReviews(res.data.data?.data ?? []);
        setTotalPages(res.data.data?.meta?.totalPages ?? 1);
      })
      .catch(() => {
        if (!cancelled) toast.error('Erro ao carregar avaliações');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, filter]);

  const filtered = reviews.filter((r) => {
    if (search) {
      const target = r.product?.name ?? r.service?.name ?? r.supplier?.companyName ?? '';
      const haystack = `${r.user?.name ?? ''} ${target} ${r.title ?? ''} ${r.comment ?? ''}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const handleApprove = async (id: string) => {
    if (!window.confirm('Aprovar esta avaliação?')) return;
    try {
      await api.put(`/reviews/${id}/moderate`, { status: 'APPROVED', moderatorId: user?.id });
      toast.success('Avaliação aprovada!');
      fetchReviews();
    } catch {
      toast.error('Erro ao aprovar avaliação');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Rejeitar esta avaliação?')) return;
    try {
      await api.put(`/reviews/${id}/moderate`, { status: 'REJECTED', moderatorId: user?.id });
      toast.success('Avaliação rejeitada!');
      fetchReviews();
    } catch {
      toast.error('Erro ao rejeitar avaliação');
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remover esta avaliação?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Avaliação removida!');
      fetchReviews();
    } catch {
      toast.error('Erro ao remover avaliação');
    }
  };

  const statusBadge = (status: AdminReview['status']) => {
    const map = {
      PENDING: { label: 'Pendente', className: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
      APPROVED: { label: 'Aprovado', className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' },
      REJECTED: { label: 'Rejeitado', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
      FLAGGED: { label: 'Sinalizada', className: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    };
    return map[status];
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
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field text-sm w-full sm:w-44">
          <option value="all">Todas</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovadas</option>
          <option value="REJECTED">Rejeitadas</option>
          <option value="FLAGGED">Sinalizadas</option>
        </select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Carregando avaliações...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma avaliação encontrada.</p>
          </div>
        ) : (
          filtered.map((review) => {
            const target = review.product?.name ?? review.service?.name ?? review.supplier?.companyName ?? '';
            const badge = statusBadge(review.status);
            return (
              <div key={review.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{review.title || target}</p>
                    <p className="text-xs text-gray-500">por {review.user?.name ?? 'Cliente'} - {new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                    {review.title && target && (
                      <p className="text-xs text-gray-400 mt-0.5">{target}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {review.status !== 'APPROVED' && (
                      <button onClick={() => handleApprove(review.id)} className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950 text-gray-400 hover:text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                    )}
                    {review.status !== 'REJECTED' && (
                      <button onClick={() => handleReject(review.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600">
                        <ThumbsDown className="h-4 w-4" />
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
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>{badge.label}</span>
              </div>
            );
          })
        )}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-outline text-sm">Anterior</button>
            <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-outline text-sm">Próxima</button>
          </div>
        )}
      </div>
    </div>
  );
}
