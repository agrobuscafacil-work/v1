'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export function PageNav() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-page">
        <div className="flex h-14 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-ghost p-2"
            aria-label="Voltar para a página anterior"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">Voltar</span>
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Voltar ao início">
            <Image
              src="/logo.jpg"
              alt="AgroBuscaFácil"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="hidden sm:block text-lg font-bold text-gray-900 dark:text-white">
              Agro<span className="text-primary-600">BuscaFácil</span>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}