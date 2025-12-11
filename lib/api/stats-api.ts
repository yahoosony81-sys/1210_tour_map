/**
 * @file stats-api.ts
 * @description 통계 대시보드 데이터 수집 API
 *
 * 이 모듈은 통계 대시보드에 필요한 데이터를 수집하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 통계 수집 (getRegionStats)
 * 2. 타입별 관광지 통계 수집 (getTypeStats)
 * 3. 통계 요약 정보 생성 (getStatsSummary)
 * 4. 통합 통계 데이터 수집 (getStatsData)
 *
 * 핵심 구현 로직:
 * - totalCount만 필요한 경우 최소 데이터만 조회 (numOfRows=1)
 * - 병렬 API 호출로 성능 최적화
 * - Promise.allSettled로 부분 실패 처리
 * - Next.js 캐싱 설정 (revalidate: 3600)
 *
 * @dependencies
 * - @/lib/api/tour-api: ApiResponse, TourApiError, getAreaCode
 * - @/lib/types/stats: RegionStats, TypeStats, StatsSummary, StatsData
 * - @/lib/types/tour: AreaCode, CONTENT_TYPE_ID, CONTENT_TYPE_NAME
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항
 */

import type { ApiResponse } from "@/lib/api/tour-api";
import { TourApiError, getAreaCode } from "@/lib/api/tour-api";
import type { AreaCode } from "@/lib/types/tour";
import {
  CONTENT_TYPE_ID,
  CONTENT_TYPE_NAME,
  type ContentTypeId,
} from "@/lib/types/tour";
import type {
  RegionStats,
  StatsData,
  StatsSummary,
  TypeStats,
} from "@/lib/types/stats";

// =====================================================
// 상수 정의
// =====================================================

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

// 재시도 설정
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1초, 2초, 4초

// =====================================================
// 유틸리티 함수
// =====================================================

/**
 * 환경변수에서 API 키 가져오기
 */
function getApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new TourApiError(
      "API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 확인하세요."
    );
  }

  return apiKey;
}

/**
 * URL 쿼리 파라미터 빌더
 */
function buildQueryParams(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * 지수 백오프를 사용한 재시도 로직이 포함된 fetch 래퍼
 * Next.js fetch의 next 옵션을 지원합니다.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit & { next?: { revalidate?: number } } = {},
  retryCount = 0
): Promise<Response> {
  try {
    // Next.js fetch 옵션 분리
    const { next, ...fetchOptions } = options;
    const response = await fetch(url, {
      ...fetchOptions,
      ...(next && { next }), // Next.js fetch 옵션 추가
    } as RequestInit);

    // 5xx 에러인 경우 재시도
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay =
        RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    return response;
  } catch (error) {
    // 네트워크 에러인 경우 재시도
    if (retryCount < MAX_RETRIES) {
      const delay =
        RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    // 최대 재시도 횟수 초과
    throw new TourApiError(
      `네트워크 오류가 발생했습니다. ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * totalCount만 가져오는 유틸리티 함수
 * 성능 최적화를 위해 numOfRows=1로 설정하여 최소 데이터만 조회
 */
async function fetchTotalCountOnly(
  params: Record<string, string | number | undefined> = {}
): Promise<number> {
  const apiKey = getApiKey();

  // 공통 파라미터와 사용자 파라미터 병합
  const allParams = {
    serviceKey: apiKey,
    ...COMMON_PARAMS,
    ...params,
    numOfRows: 1, // 최소 데이터만 가져오기
    pageNo: 1,
  };

  const queryString = buildQueryParams(allParams);
  const url = `${BASE_URL}/areaBasedList2?${queryString}`;

  const response = await fetchWithRetry(
    url,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // 1시간 캐싱
    }
  );

  if (!response.ok) {
    throw new TourApiError(
      `API 요청 실패: ${response.status} ${response.statusText}`,
      undefined,
      response.status
    );
  }

  const data: ApiResponse<unknown> = await response.json();

  // API 응답 헤더에서 에러 확인
  if (data.response.header.resultCode !== "0000") {
    throw new TourApiError(
      data.response.header.resultMsg || "API 오류가 발생했습니다.",
      data.response.header.resultCode
    );
  }

  return data.response.body.totalCount;
}

// =====================================================
// 통계 데이터 수집 함수
// =====================================================

/**
 * 지역별 관광지 통계 수집
 * 각 시/도별 관광지 개수를 집계합니다.
 *
 * @returns 지역별 통계 목록 (count 기준 내림차순 정렬)
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  try {
    // 1. 전체 지역 코드 목록 가져오기
    const areaCodes = await getAreaCode();

    // 2. 각 지역 코드별로 totalCount 병렬 조회
    const statsPromises = areaCodes.map(async (areaCode) => {
      try {
        const count = await fetchTotalCountOnly({
          areaCode: areaCode.code,
        });

        return {
          areaCode: areaCode.code,
          regionName: areaCode.name,
          count,
        } as RegionStats;
      } catch (error) {
        // 일부 지역 실패 시에도 다른 지역은 계속 수집
        console.error(
          `지역 통계 수집 실패 (${areaCode.name}, ${areaCode.code}):`,
          error
        );
        return null;
      }
    });

    // 3. Promise.allSettled로 부분 실패 처리
    const results = await Promise.allSettled(statsPromises);

    // 4. 성공한 결과만 필터링 및 변환
    const regionStats: RegionStats[] = results
      .filter(
        (result): result is PromiseFulfilledResult<RegionStats | null> =>
          result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value as RegionStats);

    // 5. count 기준 내림차순 정렬
    regionStats.sort((a, b) => b.count - a.count);

    return regionStats;
  } catch (error) {
    console.error("지역별 통계 수집 중 오류:", error);
    throw new TourApiError(
      `지역별 통계 수집 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * 타입별 관광지 통계 수집
 * 각 관광 타입별 관광지 개수를 집계합니다.
 *
 * @returns 타입별 통계 목록 (count 기준 내림차순 정렬, percentage 포함)
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  try {
    // 1. 모든 타입 ID 가져오기
    const contentTypeIds = Object.values(CONTENT_TYPE_ID) as ContentTypeId[];

    // 2. 각 타입별로 totalCount 병렬 조회
    const statsPromises = contentTypeIds.map(async (contentTypeId) => {
      try {
        const count = await fetchTotalCountOnly({
          contentTypeId,
        });

        return {
          contentTypeId,
          typeName: CONTENT_TYPE_NAME[contentTypeId],
          count,
        } as TypeStats;
      } catch (error) {
        // 일부 타입 실패 시에도 다른 타입은 계속 수집
        console.error(
          `타입 통계 수집 실패 (${CONTENT_TYPE_NAME[contentTypeId]}, ${contentTypeId}):`,
          error
        );
        return null;
      }
    });

    // 3. Promise.allSettled로 부분 실패 처리
    const results = await Promise.allSettled(statsPromises);

    // 4. 성공한 결과만 필터링 및 변환
    const typeStats: TypeStats[] = results
      .filter(
        (result): result is PromiseFulfilledResult<TypeStats | null> =>
          result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value as TypeStats);

    // 5. count 기준 내림차순 정렬
    typeStats.sort((a, b) => b.count - a.count);

    // 6. 전체 개수 계산 후 percentage 계산
    const totalCount = typeStats.reduce((sum, stat) => sum + stat.count, 0);

    if (totalCount > 0) {
      typeStats.forEach((stat) => {
        stat.percentage = Math.round((stat.count / totalCount) * 100 * 100) / 100; // 소수점 2자리
      });
    }

    return typeStats;
  } catch (error) {
    console.error("타입별 통계 수집 중 오류:", error);
    throw new TourApiError(
      `타입별 통계 수집 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * 통계 요약 정보 생성
 * 전체 통계 대시보드의 요약 정보를 생성합니다.
 *
 * @returns 통계 요약 정보 (전체 개수, Top 3 지역, Top 3 타입, 업데이트 시간)
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  try {
    // 1. 전체 관광지 수 조회
    const totalCountPromise = fetchTotalCountOnly({});

    // 2. 지역별 통계 수집
    const regionStatsPromise = getRegionStats();

    // 3. 타입별 통계 수집
    const typeStatsPromise = getTypeStats();

    // 4. 병렬로 모든 데이터 수집
    const [totalCount, regionStats, typeStats] = await Promise.all([
      totalCountPromise,
      regionStatsPromise,
      typeStatsPromise,
    ]);

    // 5. Top 3 추출
    const topRegions = regionStats.slice(0, 3).map((stat) => ({
      areaCode: stat.areaCode,
      regionName: stat.regionName,
      count: stat.count,
    }));

    const topTypes = typeStats.slice(0, 3).map((stat) => ({
      contentTypeId: stat.contentTypeId,
      typeName: stat.typeName,
      count: stat.count,
    }));

    // 6. 마지막 업데이트 시간
    const lastUpdated = new Date().toISOString();

    return {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated,
    };
  } catch (error) {
    console.error("통계 요약 정보 생성 중 오류:", error);
    throw new TourApiError(
      `통계 요약 정보 생성 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * 통합 통계 데이터 수집
 * 모든 통계 데이터를 한 번에 수집합니다.
 *
 * @returns 통합 통계 데이터 (지역별 통계, 타입별 통계, 요약 정보)
 */
export async function getStatsData(): Promise<StatsData> {
  try {
    // 1. 모든 통계 데이터 병렬 수집
    const [regionStats, typeStats, summary] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
      getStatsSummary(),
    ]);

    return {
      regionStats,
      typeStats,
      summary,
    };
  } catch (error) {
    console.error("통합 통계 데이터 수집 중 오류:", error);
    throw new TourApiError(
      `통합 통계 데이터 수집 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

