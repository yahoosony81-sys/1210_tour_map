import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      // 한국관광공사 API 이미지 도메인 (HTTPS)
      {
        protocol: "https",
        hostname: "tong.visitkorea.or.kr",
      },
      // 한국관광공사 API 이미지 도메인 (HTTP - 일부 이미지가 HTTP로 제공됨)
      {
        protocol: "http",
        hostname: "tong.visitkorea.or.kr",
      },
      {
        protocol: "https",
        hostname: "api.visitkorea.or.kr",
      },
      {
        protocol: "http",
        hostname: "api.visitkorea.or.kr",
      },
      // placeholder 이미지 서비스
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
