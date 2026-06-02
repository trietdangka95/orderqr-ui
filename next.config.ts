import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.orderqr.id.vn",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  // Cho phép Next.js Dev Server load tài nguyên khi truy cập bằng các domain/subdomain giả lập ở local
  allowedDevOrigins: [
    "orderqr.id.vn",
    "bun-bo.orderqr.id.vn",
    "banh-xeo.orderqr.id.vn",
    "menu-viet.orderqr.id.vn"
  ],
};

export default nextConfig;
