import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/connect",
        destination: "/dashboard/account",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
