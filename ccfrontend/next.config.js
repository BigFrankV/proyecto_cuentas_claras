/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración esencial para Cuentas Claras
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  
  // Deshabilitar ESLint y TypeScript durante el build (lo ejecutamos por separado)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Experimental options to fix EMFILE error on Windows
  experimental: {
    // Reduce concurrent processing to avoid EMFILE errors
    workerThreads: false,
    cpus: 1,
  },

  // Options to handle large number of dependencies
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },

  // Configuración de imágenes
  images: {
    unoptimized: true, // Required for static export
    domains: ['localhost', 'example.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: 'cuentas-claras',
    APP_VERSION: '1.0.0',
  },

  // Nota: Headers y Redirects no funcionan con output: 'export'
  // Los redirects se deben manejar en nginx.conf para producción

  // Configuración de webpack personalizada
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Disable webpack cache to avoid EMFILE errors
    config.cache = false;
    
    // Excluir carpeta stories del build
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Excluir archivos de stories del build
    config.module.rules.forEach(rule => {
      if (rule.test && rule.test.toString().includes('tsx')) {
        if (rule.exclude) {
          rule.exclude = Array.isArray(rule.exclude)
            ? rule.exclude
            : [rule.exclude];
          rule.exclude.push(/stories/);
        } else {
          rule.exclude = /stories/;
        }
      }
    });

    // Optimize MUI icons handling
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        chunks: 'all',
        cacheGroups: {
          muiIcons: {
            test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/]/,
            name: 'mui-icons',
            priority: 10,
            enforce: true,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },
};

export default nextConfig;
