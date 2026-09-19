/** @type {import('next').NextConfig} */

// Libera automaticamente o host da API configurado (dev: localhost, prod: api.agrobuscafacil.com.br, ...)
// para o next/image aceitar logos e fotos de produtos servidas pelo backend.
function apiImagePattern() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const u = new URL(apiUrl);
    const pattern = {
      protocol: u.protocol.replace(':', ''),
      hostname: u.hostname,
      pathname: `${u.pathname.replace(/\/$/, '')}/**`,
    };
    if (u.port) pattern.port = u.port;
    return pattern;
  } catch {
    return null;
  }
}

const apiPattern = apiImagePattern();

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.agrobuscafacil.com.br',
        pathname: '/**',
      },
      ...(apiPattern ? [apiPattern] : []),
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@tanstack/react-query'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Rewrites para proxy de API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.agrobuscafacil.com.br/api/:path*',
      },
    ];
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;