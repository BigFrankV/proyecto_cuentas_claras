/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración esencial para Cuentas Claras
  reactStrictMode: true,
  swcMinify: true,
  // Temporarily disable static export to avoid EMFILE during build
  // output: 'export',

  // Experimental options to fix EMFILE error
  experimental: {
    // Reduce concurrent processing to avoid EMFILE errors
    workerThreads: false,
    cpus: 1,
    // Disable static analysis of dependencies to prevent EMFILE
    esmExternals: false,
  },

  // Disable static optimization to prevent dependency analysis
  optimizeFonts: false,
  swcMinify: false,

  // Webpack configuration to exclude Material-UI icons from dependency analysis
  webpack: (config, { isServer }) => {
    // Use webpack IgnorePlugin to completely exclude @mui/icons-material
    config.plugins.push(
      new config.webpack.IgnorePlugin({
        resourceRegExp: /^@mui\/icons-material\/.*$/,
      })
    );

    // Exclude @mui/icons-material from bundle analysis to prevent EMFILE errors
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/icons-material': false,
    };

    // Also exclude from dependency tracing
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            muiIcons: {
              test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/]/,
              name: 'mui-icons',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    return config;
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
    // Configuración personalizada de webpack si es necesaria
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;
