import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 API 이미지 도메인
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "api.visitkorea.or.kr" },
      // placeholder 이미지 서비스
      { hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
