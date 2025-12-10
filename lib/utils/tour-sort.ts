/**
 * @file tour-sort.ts
 * @description 관광지 정렬 유틸리티 함수
 *
 * 관광지 목록을 정렬하는 유틸리티 함수를 제공합니다.
 *
 * @dependencies
 * - @/lib/types/tour: TourItem 타입
 */

import type { TourItem } from "@/lib/types/tour";

/**
 * 정렬 옵션 타입
 */
export type SortOption = "latest" | "name";

/**
 * 관광지 목록을 정렬하는 함수
 * @param tours - 정렬할 관광지 목록
 * @param sortOption - 정렬 옵션 ("latest" | "name")
 * @returns 정렬된 관광지 목록
 */
export function sortTours(
  tours: TourItem[],
  sortOption: SortOption = "latest"
): TourItem[] {
  const sorted = [...tours];

  if (sortOption === "latest") {
    // 최신순: modifiedtime 내림차순
    return sorted.sort((a, b) => {
      // modifiedtime 형식: YYYYMMDDHHmmss
      const dateA = parseModifiedTime(a.modifiedtime);
      const dateB = parseModifiedTime(b.modifiedtime);
      return dateB.getTime() - dateA.getTime();
    });
  }

  if (sortOption === "name") {
    // 이름순: title 오름차순 (가나다순)
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return sorted;
}

/**
 * modifiedtime 문자열을 Date 객체로 변환
 * @param modifiedtime - YYYYMMDDHHmmss 형식의 문자열
 * @returns Date 객체
 */
function parseModifiedTime(modifiedtime: string): Date {
  // YYYYMMDDHHmmss 형식 파싱
  const year = parseInt(modifiedtime.substring(0, 4), 10);
  const month = parseInt(modifiedtime.substring(4, 6), 10) - 1; // 월은 0부터 시작
  const day = parseInt(modifiedtime.substring(6, 8), 10);
  const hour = parseInt(modifiedtime.substring(8, 10), 10);
  const minute = parseInt(modifiedtime.substring(10, 12), 10);
  const second = parseInt(modifiedtime.substring(12, 14), 10);

  return new Date(year, month, day, hour, minute, second);
}

