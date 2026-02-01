/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Fixes "inferred workspace root" warnings when other lockfiles exist.
    root: __dirname
  },
  images: {
    // Allow Supabase Storage public URLs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  }
};

module.exports = nextConfig;

