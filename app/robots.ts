/**
 * @file robots.ts
 * @description 동적 robots.txt 생성
 *
 * Next.js 15의 robots.ts 파일을 사용하여 동적 robots.txt를 생성합니다.
 * 검색 엔진 크롤러에게 사이트 크롤링 규칙을 제공합니다.
 *
 * @dependencies
 * - next: MetadataRoute.Robots 타입
 * - @/lib/utils/url: getAbsoluteUrl 함수
 */

import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getAbsoluteUrl } from "@/lib/utils/url";

/**
 * 동적 robots.txt 생성
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get("host") || undefined;

  // sitemap URL 생성
  const sitemapUrl = getAbsoluteUrl("/sitemap.xml", host);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 특정 경로 차단이 필요한 경우 disallow 추가
        // disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: sitemapUrl,
  };
}

