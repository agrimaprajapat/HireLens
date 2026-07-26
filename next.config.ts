import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma's engine out of the server bundle so it loads its native client.
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
