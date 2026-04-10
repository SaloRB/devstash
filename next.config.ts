import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL ?? ''
const r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : ''

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      ...(r2Hostname
        ? [{ protocol: 'https' as const, hostname: r2Hostname }]
        : []),
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
