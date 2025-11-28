/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript and ESLint build ignoring for development
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // CORS headers for API routes - 보안 강화
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: isProduction
              ? (process.env.ALLOWED_ORIGINS?.split(',')[0] || 'https://survivingvid.vercel.app')
              : '*', // 개발 환경에서는 모든 출처 허용
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS', // PUT, DELETE 제거로 보안 강화
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // WebDAV headers for cross-origin requests
      {
        source: '/api/video/webdav/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Depth, Overwrite',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Length, Content-Range',
          },
        ],
      },
    ];
  },

  // Webpack configuration for better performance
  webpack: (config, { isServer }) => {
    // Optimization for client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // File system module not needed in browser
        net: false, // Network module not needed in browser
        tls: false, // TLS module not needed in browser
        crypto: false, // Crypto module handled by browser
        stream: false, // Stream module handled by browser
      };
    }

    return config;
  },
}

module.exports = nextConfig