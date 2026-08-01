'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LifeBuoy,
  Loader2,
  ArrowRight,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SUPPORT_STATUS_LABELS, SUPPORT_STATUS_BADGE } from '@/lib/support';
import { useAuth } from '@/hooks/use-auth';
import type { SupportTicket, SupportTicketStatus } from '@/types';

export default function SupportListPage() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  const listQuery = useQuery({
    queryKey: ['my-support-tickets', page],
    queryFn: async () => {
      const { data } = await api.get('/support/tickets/mine', {
        params: { page, limit },
      });
      return data.data as {
        data: SupportTicket[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      };
    },
    refetchInterval: 30000,
  });

  const tickets = listQuery.data?.data || [];
  const meta = listQuery.data?.meta || { total: 0, page: 1, limit, totalPages: 0 };

  if (!isAuthenticated) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
            <LifeBuoy className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Acesso necessário</h1>
          <p className="mt-2 text-sm text-gray-500">
            Faça login para acompanhar a situação das suas reclamações.
          </p>
          <Link href="/auth/login" className="btn-primary mt-6">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900">
              <LifeBuoy className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Relatos</h1>
              <p className="text-sm text-gray-500">
                Acompanhe a situação das suas reclamações.
              </p>
            </div>
          </div>
          <Link href="/suporte/novo" className="btn-primary text-sm">
            Relatar Problema
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {listQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <MessageSquare className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-gray-500">Você ainda não fez nenhuma reclamação.</p>
              <Link href="/suporte/novo" className="btn-primary mt-6">
                Relatar um problema
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/suporte/${ticket.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <span className={SUPPORT_STATUS_BADGE[ticket.status]}>
                      {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {ticket.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        <span className="font-mono">
                          #{ticket.id.slice(0, 8).toUpperCase()}
                        </span>
                        {' · '}
                        {ticket.category.name} - {ticket.type.name}
                        {' · '}
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {ticket.attachments.length > 0 && (
                      <span
                        className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400"
                        title={`${ticket.attachments.length} anexo(s)`}
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        {ticket.attachments.length}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="btn-outline text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">
              Página {meta.page} de {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages}
              className="btn-outline text-sm disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
