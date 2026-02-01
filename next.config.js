/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Fixes "inferred workspace root" warnings when other lockfiles exist.
    root: __dirname
  }
};

module.exports = nextConfig;

