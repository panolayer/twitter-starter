/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next 14.2 form of serverExternalPackages: keep the native better-sqlite3
    // module out of the server bundle so it loads as a real Node addon.
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
