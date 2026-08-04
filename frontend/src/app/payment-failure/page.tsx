'use client';

import Link from 'next/link';
import { XCircle, RotateCcw } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
        <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pagamento não concluído</h1>
        <p className="text-sm text-gray-500 mb-6">
          O pagamento foi cancelado ou não foi concluído. Você pode tentar novamente quando quiser.
        </p>
        <div className="space-y-3">
          <Link href="/checkout" className="btn-primary w-full gap-2">
            <RotateCcw className="h-4 w-4" /> Tentar novamente
          </Link>
          <Link href="/cart" className="w-full text-center text-sm text-gray-500 hover:text-primary-600">
            Voltar ao carrinho
          </Link>
        </div>
      </div>
    </div>
  );
}
