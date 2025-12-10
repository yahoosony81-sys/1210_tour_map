/**
 * @file tour-actions.ts
 * @description 관광지 페이지네이션을 위한 Server Actions
 *
 * 무한 스크롤 페이지네이션을 위해 추가 데이터를 로드하는 Server Action을 제공합니다.
 *
 * 주요 기능:
 * 1. 추가 페이지 데이터 로드 (loadMoreTours)
 * 2. 정렬 적용
 * 3. hasMore 계산 (더 불러올 데이터가 있는지 확인)
 *
 * @dependencies
 * - @/lib/api/tour-api: ApiResponse 타입 (totalCount 포함)
 * - @/lib/utils/tour-sort: sortTours
 * - @/lib/types/tour: TourItem
 */

"use server";

import type { ApiResponse } from "@/lib/api/tour-api";
import { getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import { sortTours, type SortOption } from "@/lib/utils/tour-sort";
import type { TourItem } from "@/lib/types/tour";

// API 직접 호출을 위한 유틸리티 함수들 (tour-api.ts에서 가져옴)
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

function getApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error(
      "API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 확인하세요."
    );
  }

  return apiKey;
}

function buildQueryParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * API 응답에서 totalCount를 포함하여 데이터 가져오기
 */
async function fetchToursWithTotalCount(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<{ tours: TourItem[]; totalCount: number }> {
  const apiKey = getApiKey();
  const allParams = {
    serviceKey: apiKey,
    ...COMMON_PARAMS,
    ...params,
  };

  const queryString = buildQueryParams(allParams);
  const url = `${BASE_URL}${endpoint}?${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse<TourItem> = await response.json();

  if (data.response.header.resultCode !== "0000") {
    throw new Error(
      data.response.header.resultMsg || "API 오류가 발생했습니다."
    );
  }

  const items = data.response.body.items.item;
  const tours = !items
    ? []
    : Array.isArray(items)
      ? items
      : [items];

  return {
    tours,
    totalCount: data.response.body.totalCount,
  };
}

/**
 * 페이지네이션을 위한 추가 관광지 데이터 로드
 * @param pageNo - 로드할 페이지 번호 (2부터 시작)
 * @param areaCode - 지역 코드 (선택)
 * @param contentTypeId - 관광 타입 ID (선택)
 * @param keyword - 검색 키워드 (선택, 있으면 검색 API 사용)
 * @param sort - 정렬 옵션 ("latest" | "name")
 * @param numOfRows - 페이지당 항목 수 (기본: 20)
 * @returns { tours: TourItem[], hasMore: boolean, totalCount: number }
 */
export async function loadMoreTours(
  pageNo: number,
  options: {
    areaCode?: string;
    contentTypeId?: string;
    keyword?: string;
    sort?: SortOption;
    numOfRows?: number;
  } = {}
): Promise<{
  tours: TourItem[];
  hasMore: boolean;
  totalCount: number;
}> {
  try {
    const numOfRows = options.numOfRows || 20;
    const sort = options.sort || "latest";

    let tours: TourItem[];
    let totalCount: number;

    if (options.keyword && options.keyword.trim().length > 0) {
      // 검색 키워드가 있으면 검색 API 호출
      const result = await fetchToursWithTotalCount("/searchKeyword2", {
        keyword: options.keyword.trim(),
        areaCode: options.areaCode,
        contentTypeId: options.contentTypeId,
        numOfRows,
        pageNo,
      });
      tours = result.tours;
      totalCount = result.totalCount;
    } else {
      // 검색 키워드가 없으면 목록 API 호출
      const result = await fetchToursWithTotalCount("/areaBasedList2", {
        areaCode: options.areaCode,
        contentTypeId: options.contentTypeId,
        numOfRows,
        pageNo,
      });
      tours = result.tours;
      totalCount = result.totalCount;
    }

    // 정렬 적용
    const sortedTours = sortTours(tours, sort);

    // hasMore 계산: (pageNo * numOfRows) < totalCount
    const hasMore = pageNo * numOfRows < totalCount;

    return {
      tours: sortedTours,
      hasMore,
      totalCount,
    };
  } catch (error) {
    console.error("loadMoreTours 에러:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "관광지 정보를 불러오는 중 오류가 발생했습니다."
    );
  }
}

