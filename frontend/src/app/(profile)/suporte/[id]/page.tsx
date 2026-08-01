'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LifeBuoy,
  Loader2,
  ChevronLeft,
  Clock,
  MessageSquare,
  CheckCircle2,
  FileText,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_BADGE,
  SUPPORT_FILE_URL,
  formatBytes,
} from '@/lib/support';
import { useAuth } from '@/hooks/use-auth';
import type { SupportAttachment, SupportTicket, SupportTicketStatus } from '@/types';

const STATUS_ORDER: Record<SupportTicketStatus, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CLOSED: 3,
};

function AttachmentPreview({ att }: { att: SupportAttachment }) {
  if (att.type === 'IMAGE') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={SUPPORT_FILE_URL(att.url)}
        alt={att.fileName}
        className="mb-2 max-h-40 w-full rounded-md object-cover"
      />
    );
  }
  if (att.type === 'VIDEO') {
    return (
      <video
        src={SUPPORT_FILE_URL(att.url)}
        controls
        className="mb-2 max-h-40 w-full rounded-md"
      />
    );
  }
  return null;
}

export default function SupportDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const id = typeof params.id === 'string' ? params.id : '';

  const detailQuery = useQuery({
    queryKey: ['my-support-ticket', id],
    queryFn: async () => {
      const { data } = await api.get(`/support/tickets/${id}`);
      return data.data as SupportTicket;
    },
    enabled: isAuthenticated && !!id,
    refetchInterval: 30000,
    retry: false,
  });

  if (!isAuthenticated) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
            <LifeBuoy className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Acesso necessário</h1>
          <p className="mt-2 text-sm text-gray-500">
            Faça login para visualizar esta reclamação.
          </p>
          <Link href="/auth/login" className="btn-primary mt-6">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="container-page py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const ticket = detailQuery.data;

  if (!ticket || detailQuery.isError) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <MessageSquare className="h-7 w-7 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reclamação não encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Não foi possível encontrar esta reclamação.
          </p>
          <Link href="/suporte" className="btn-primary mt-6">
            Voltar aos meus relatos
          </Link>
        </div>
      </div>
    );
  }

  const history = ticket.statusHistory || [];
  const currentStatusIndex = STATUS_ORDER[ticket.status];

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/suporte"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar aos meus relatos
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className={SUPPORT_STATUS_BADGE[ticket.status]}>
            {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
          </span>
          <span className="font-mono text-sm text-gray-500">
            #{ticket.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {ticket.title}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {ticket.category.name} - {ticket.type.name}
          </p>
          <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
            {ticket.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Enviado em {new Date(ticket.createdAt).toLocaleString('pt-BR')}
            </span>
            {ticket.browser && <span>Navegador: {ticket.browser}</span>}
            {ticket.os && <span>Sistema: {ticket.os}</span>}
            {ticket.device && <span>Dispositivo: {ticket.device}</span>}
          </div>
        </div>

        {ticket.adminResponse && (
          <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Resposta da equipe
              </h2>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {ticket.adminResponse}
            </p>
            {ticket.respondedAt && (
              <p className="mt-3 text-xs text-gray-500">
                Em {new Date(ticket.respondedAt).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {ticket.attachments.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Anexos ({ticket.attachments.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ticket.attachments.map((att) => (
                <div
                  key={att.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 p-3"
                >
                  <AttachmentPreview att={att} />
                  <a
                    href={SUPPORT_FILE_URL(att.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                  >
                    {att.type === 'IMAGE' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : att.type === 'VIDEO' ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="truncate">{att.fileName}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {formatBytes(att.size)}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-6 font-semibold text-gray-900 dark:text-white">
            Andamento do processo
          </h2>

          <ol className="relative space-y-6 border-l border-gray-200 dark:border-gray-700 pl-6">
            {history.map((entry, index) => {
              const isCurrent = entry.status === ticket.status;
              return (
                <li key={entry.id} className="relative">
                  <span
                    className={`absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full ring-4 ${
                      isCurrent
                        ? 'bg-primary-600 ring-primary-100 dark:ring-primary-950'
                        : 'bg-gray-300 dark:bg-gray-600 ring-gray-100 dark:ring-gray-800'
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={SUPPORT_STATUS_BADGE[entry.status]}>
                      {SUPPORT_STATUS_LABELS[entry.status] || entry.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleString('pt-BR')}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-medium text-primary-600">Atual</span>
                    )}
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{entry.note}</p>
                  )}
                  {index === 0 && !isCurrent && (
                    <p className="mt-1 text-xs text-gray-400">
                      Registro mais recente
                    </p>
                  )}
                </li>
              );
            })}

            {history.length === 0 && (
              <li className="text-sm text-gray-500">
                Reclamação recebida, aguardando análise da equipe.
              </li>
            )}

            {currentStatusIndex < STATUS_ORDER.CLOSED && (
              <li className="relative">
                <span className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                <p className="text-sm text-gray-400">
                  {ticket.status === 'OPEN' && 'A equipe vai analisar sua reclamação em breve.'}
                  {ticket.status === 'IN_PROGRESS' && 'Nossa equipe está trabalhando na solução.'}
                  {ticket.status === 'RESOLVED' && 'Reclamação resolvida, aguardando confirmação.'}
                </p>
              </li>
            )}
          </ol>

          <div className="mt-8 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-sm text-gray-500">
              Precisa de mais alguma coisa?{' '}
              <Link href="/suporte/novo" className="text-primary-600 hover:underline">
                Relatar um novo problema
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
