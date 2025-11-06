/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración esencial para Cuentas Claras
  reactStrictMode: true,
  
  // Disable SWC minification (using Babel instead due to custom config)
  swcMinify: false,

  // Experimental options to fix EMFILE error
  experimental: {
    // Reduce concurrent processing to avoid EMFILE errors
    workerThreads: false,
    cpus: 1,
    // Exclude @mui/icons-material from file tracing to prevent EMFILE
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@mui/icons-material/**/*',
      ],
    },
  },

  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Permite todas las rutas de Unsplash
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
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
  webpack: (config) => {
    // Configuración personalizada para SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
