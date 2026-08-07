'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    api
      .get(sessionId ? `/stripe/session-status/${sessionId}` : '/stripe/session-status/none')
      .then((res) => {
        if (cancelled) return;
        const session = res.data?.data;
        setStatus(session?.paymentStatus === 'paid' ? 'confirmed' : 'error');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-14 w-14 text-primary-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmando pagamento...</h1>
            <p className="text-sm text-gray-500">Aguarde um instante enquanto verificamos o status.</p>
          </>
        )}
        {status === 'confirmed' && (
          <>
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pagamento aprovado!</h1>
            <p className="text-sm text-gray-500 mb-6">Seu pedido foi confirmado com sucesso.</p>
            <Link href="/orders" className="btn-primary w-full gap-2">
              <ShoppingBag className="h-4 w-4" /> Ver meus pedidos
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Não foi possível confirmar</h1>
            <p className="text-sm text-gray-500 mb-6">
              Não encontramos uma sessão de pagamento válida. Se o valor foi cobrado, verifique seus pedidos.
            </p>
            <Link href="/orders" className="btn-primary w-full">Ir para pedidos</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
