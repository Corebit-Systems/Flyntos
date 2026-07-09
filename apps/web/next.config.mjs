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
    const rawUrl = process.env.API_BASE_URL;
    console.log("API_BASE_URL during build:", rawUrl);
    
    let baseUrl = (rawUrl || 'http://localhost:4000').trim();
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
  }
};
export default nextConfig;
