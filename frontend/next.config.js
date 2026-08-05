/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
  },

  // Proxy all /api/* calls to the Express backend (same-origin cookie sharing)
  // This way the browser always speaks to localhost:3000,
  // so the session cookie is valid on both the Next.js frontend and API calls.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
