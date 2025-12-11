import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Clerk 인증 이미지
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      // 한국관광공사 API 이미지 도메인
      // HTTPS 우선, 일부 이미지는 HTTP로 제공되므로 둘 다 허용
      {
        protocol: "https",
        hostname: "tong.visitkorea.or.kr",
      },
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
      // placeholder 이미지 서비스 (개발/테스트용)
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
