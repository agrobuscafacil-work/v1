import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { AuthInitializer } from '@/components/auth/auth-initializer';
import { PageViewTracker } from '@/components/tracking/page-view-tracker';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://agrobuscafacil.com.br'),
  title: {
    default: 'AgroBuscaFácil - Marketplace do Agronegócio',
    template: '%s | AgroBuscaFácil',
  },
  description:
    'Plataforma completa de marketplace B2B e B2C para o agronegócio. Conecte-se com fornecedores de produtos e serviços agrícolas.',
  keywords: [
    'agronegócio',
    'marketplace',
    'produtos agrícolas',
    'fornecedores',
    'agro',
    'B2B',
    'B2C',
  ],
  authors: [{ name: 'AgroBuscaFácil' }],
  creator: 'AgroBuscaFácil',
  publisher: 'AgroBuscaFácil',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://agrobuscafacil.com.br',
    siteName: 'AgroBuscaFácil',
    title: 'AgroBuscaFácil - Marketplace do Agronegócio',
    description:
      'Plataforma completa de marketplace B2B e B2C para o agronegócio.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AgroBuscaFácil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgroBuscaFácil - Marketplace do Agronegócio',
    description:
      'Plataforma completa de marketplace B2B e B2C para o agronegócio.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <AuthInitializer>
            <PageViewTracker />
            {children}
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  );
}
