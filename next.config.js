/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfkit': require.resolve('pdfkit'),
      }
    }
    return config
  },
  outputFileTracingIncludes: {
    '/api/quotes/[id]/pdf': [
      './node_modules/pdfkit/js/data/**/*',
    ],
  },
}

module.exports = nextConfig
