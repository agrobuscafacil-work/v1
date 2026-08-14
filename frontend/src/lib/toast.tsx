'use client';

import { toast as rht, type Toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ToastOptions {
  duration?: number;
}

interface ToastCardProps {
  t: Toast;
  type: 'success' | 'error';
  message: string;
}

function ToastCard({ t, type, message }: ToastCardProps) {
  const Icon = type === 'success' ? CheckCircle2 : XCircle;
  return (
    <div
      className={`flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white dark:bg-gray-900 px-4 py-3 shadow-lg ${
        type === 'success'
          ? 'border-green-200 dark:border-green-900'
          : 'border-red-200 dark:border-red-900'
      }`}
      style={{
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'all 0.2s ease',
      }}
    >
      <Icon
        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
          type === 'success' ? 'text-green-500' : 'text-red-500'
        }`}
      />
      <p className="min-w-0 flex-1 break-words text-sm font-medium text-gray-900 dark:text-white">
        {message}
      </p>
      <button
        onClick={() => rht.dismiss(t.id)}
        aria-label="Fechar notificação"
        className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function show(type: 'success' | 'error', message: string, opts?: ToastOptions) {
  return rht.custom(
    (t) => <ToastCard t={t} type={type} message={message} />,
    {
      duration: opts?.duration ?? 4000,
    },
  );
}

export const toast = {
  success: (message: string, opts?: ToastOptions) => show('success', message, opts),
  error: (message: string, opts?: ToastOptions) => show('error', message, opts),
};