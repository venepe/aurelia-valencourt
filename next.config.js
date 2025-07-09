// const withSitemap = require('next-sitemap');

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: true, // Enables caching for client-side navigation
});

module.exports = withPWA({
  async redirects() {
    return [
      {
        source: "/elixirs/:id/:slug",
        destination: "/cocktails/:id/:slug",
        permanent: true, // 301 redirect for SEO
      },
      {
        source: "/elixir-profiles/:id/:slug",
        destination: "/cocktail-profile/:id/:slug",
        permanent: true, // 301 redirect for SEO
      },
    ];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
});
