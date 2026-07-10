import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@flyntos/config',
    '@flyntos/i18n',
    '@flyntos/seo-engine',
    '@flyntos/shared',
    '@flyntos/ui'
  ],
  async rewrites() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL;
    console.log("API_BASE_URL during build:", rawUrl);
    
    let baseUrl = (rawUrl || 'https://flyntosapi-production.up.railway.app').trim();
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://') && !baseUrl.startsWith('/')) {
      baseUrl = 'https://' + baseUrl;
    }
    // Remove trailing slash if present to avoid double slash
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    console.log("Sanitized rewrite destination base:", baseUrl);
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${baseUrl}/:path*`
      }
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@flyntos/config': path.resolve(__dirname, '../../packages/config/src/index.ts'),
      '@flyntos/i18n': path.resolve(__dirname, '../../packages/i18n/src/index.ts'),
      '@flyntos/seo-engine': path.resolve(__dirname, '../../packages/seo-engine/src/index.ts'),
      '@flyntos/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@flyntos/ui': path.resolve(__dirname, '../../packages/ui/src/index.tsx'),
      '@flyntos/search-contracts': path.resolve(__dirname, '../../packages/search-contracts/src/index.ts'),
      '@flyntos/provider-sdk': path.resolve(__dirname, '../../packages/provider-sdk/src/index.ts'),
    };
    return config;
  }
};
export default nextConfig;
