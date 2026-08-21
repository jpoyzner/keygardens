import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product / coming-soon images are served from Supabase Storage's public URLs.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
