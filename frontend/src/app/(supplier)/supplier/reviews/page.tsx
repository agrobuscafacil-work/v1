'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MessageSquare, Loader2, Package, Wrench, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface SupplierReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string };
  product?: { id: string; name: string; slug?: string; images?: string[] } | null;
  service?: { id: string; name: string } | null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SupplierReviewsPage() {
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SupplierReview | null>(null);

  const handleDelete = async (review: SupplierReview) => {
    setDeletingId(review.id);
    try {
      await api.delete(`/reviews/${review.id}`);
      toast.success('Avaliação removida');
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao remover avaliação.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

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
          {reviews.map((r) => {
            const productImage =
              r.product?.images && r.product.images.length > 0 ? PRODUCT_FILE_URL(r.product.images[0]) : '';
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="flex items-center gap-3 px-5 pt-5">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">
                    {(r.user?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.user?.name ?? 'Cliente'}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                    <span className="ml-1.5 text-sm font-semibold text-gray-900 dark:text-white">{r.rating.toFixed(1)}</span>
                  </div>
                </div>

                {r.product ? (
                  <Link
                    href={r.product.slug ? `/products/${r.product.slug}` : '#'}
                    className={`group mx-5 mt-4 flex items-center gap-3 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/30 p-3 transition-colors ${r.product.slug ? 'hover:border-primary-400 dark:hover:border-primary-600' : 'cursor-default'}`}
                  >
                    {productImage ? (
                      <img src={productImage} alt={r.product.name} className="h-12 w-12 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-md bg-white dark:bg-gray-800 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
                        <Package className="h-3 w-3" /> Produto avaliado
                      </p>
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                        {r.product.name}
                      </p>
                    </div>
                    {r.product.slug && (
                      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary-400 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </Link>
                ) : r.service ? (
                  <div className="mx-5 mt-4 flex items-center gap-3 rounded-lg border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900/30 p-3">
                    <div className="h-12 w-12 shrink-0 rounded-md bg-white dark:bg-gray-800 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-secondary-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-600 dark:text-secondary-300">
                        <Wrench className="h-3 w-3" /> Serviço avaliado
                      </p>
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{r.service.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mx-5 mt-4 flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3">
                    <div className="h-12 w-12 shrink-0 rounded-md bg-white dark:bg-gray-800 flex items-center justify-center">
                      <Star className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Avaliação da loja</p>
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">Avaliação geral do fornecedor</p>
                    </div>
                  </div>
                )}

                {(r.title || r.comment) && (
                  <div className="px-5 py-4">
                    {r.title && <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{r.title}</p>}
                    {r.comment && (
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{r.comment}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(r)}
                    disabled={deletingId === r.id}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deletingId === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Remover avaliação
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Remover avaliação"
        message={`Deseja remover a avaliação de ${confirmDelete?.user?.name ?? 'este cliente'}? Ela deixará de aparecer no produto e na sua loja.`}
        confirmLabel="Remover"
        danger
        loading={deletingId === confirmDelete?.id}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}