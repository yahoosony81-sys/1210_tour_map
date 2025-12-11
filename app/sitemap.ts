/**
 * @file sitemap.ts
 * @description 동적 sitemap 생성
 *
 * Next.js 15의 sitemap.ts 파일을 사용하여 동적 sitemap을 생성합니다.
 * 정적 페이지와 동적 페이지(관광지 상세페이지)를 포함합니다.
 *
 * @dependencies
 * - next: MetadataRoute.Sitemap 타입
 * - @/lib/api/tour-api: getAreaBasedList 함수
 * - @/lib/utils/url: getAbsoluteUrl 함수
 */

import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getAreaBasedList } from "@/lib/api/tour-api";
import { getAbsoluteUrl } from "@/lib/utils/url";
import type { TourItem } from "@/lib/types/tour";

/**
 * modifiedtime 문자열을 Date 객체로 변환
 * 형식: "20240101120000" (YYYYMMDDHHmmss)
 */
function parseModifiedTime(modifiedtime: string): Date {
  if (!modifiedtime || modifiedtime.length !== 14) {
    return new Date();
  }

  const year = parseInt(modifiedtime.substring(0, 4), 10);
  const month = parseInt(modifiedtime.substring(4, 6), 10) - 1; // 0-based
  const day = parseInt(modifiedtime.substring(6, 8), 10);
  const hour = parseInt(modifiedtime.substring(8, 10), 10);
  const minute = parseInt(modifiedtime.substring(10, 12), 10);
  const second = parseInt(modifiedtime.substring(12, 14), 10);

  return new Date(year, month, day, hour, minute, second);
}

/**
 * 관광지 목록을 modifiedtime 기준으로 정렬 (최신순)
 */
function sortByModifiedTime(tours: TourItem[]): TourItem[] {
  return [...tours].sort((a, b) => {
    const timeA = parseModifiedTime(a.modifiedtime || "");
    const timeB = parseModifiedTime(b.modifiedtime || "");
    return timeB.getTime() - timeA.getTime(); // 내림차순 (최신순)
  });
}

/**
 * 동적 sitemap 생성
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get("host") || undefined;

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/", host),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getAbsoluteUrl("/stats", host),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/bookmarks", host),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // 동적 페이지: 관광지 상세페이지
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // 최신 관광지 조회 (최대 1000개)
    // 성능 최적화를 위해 한 번에 많은 데이터 조회
    const tours = await getAreaBasedList({
      numOfRows: 1000,
      pageNo: 1,
    });

    // modifiedtime 기준으로 정렬 (최신순)
    const sortedTours = sortByModifiedTime(tours);

    // 최대 1000개까지만 포함
    const limitedTours = sortedTours.slice(0, 1000);

    // 관광지 상세페이지 URL 생성
    dynamicPages = limitedTours.map((tour) => {
      const modifiedDate = parseModifiedTime(tour.modifiedtime || "");
      return {
        url: getAbsoluteUrl(`/places/${tour.contentid}`, host),
        lastModified: modifiedDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    // API 호출 실패 시 정적 페이지만 포함
    console.error("Sitemap 생성 중 에러 발생:", error);
    // 에러가 발생해도 정적 페이지는 반환
  }

  // 정적 페이지와 동적 페이지 병합
  return [...staticPages, ...dynamicPages];
}

