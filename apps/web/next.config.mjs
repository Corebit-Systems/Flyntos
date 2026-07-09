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
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:4000'}/:path*`
      }
    ];
  }
};
export default nextConfig;
