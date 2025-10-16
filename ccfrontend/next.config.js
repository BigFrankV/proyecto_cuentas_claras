/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración esencial para Cuentas Claras
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',

  // Experimental options to fix EMFILE error
  experimental: {
    // Reduce concurrent processing to avoid EMFILE errors
    workerThreads: false,
    cpus: 1,
  },

  // Configuración de imágenes
  images: {
    domains: ['localhost', 'example.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: 'cuentas-claras',
    APP_VERSION: '1.0.0',
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },

  // Configuración de webpack personalizada
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Excluir carpeta stories del build
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Excluir archivos de stories del build
    config.module.rules.forEach(rule => {
      if (rule.test && rule.test.toString().includes('tsx')) {
        if (rule.exclude) {
          rule.exclude = Array.isArray(rule.exclude) ? rule.exclude : [rule.exclude];
          rule.exclude.push(/stories/);
        } else {
          rule.exclude = /stories/;
        }
      }
    });

    return config;
  },
};

module.exports = nextConfig;
