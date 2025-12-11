/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 사용하여 관광지 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 조회 및 표시
 * 2. 키워드 검색 기능
 * 3. 필터 기능 (지역, 관광 타입, 정렬)
 * 4. 검색 + 필터 조합
 * 5. 로딩 상태 처리
 * 6. 에러 처리
 *
 * @dependencies
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/tour-filters: TourFilters 컴포넌트
 * - @/components/tour-search: TourSearch 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 * - @/lib/api/tour-api: getAreaBasedList, searchKeyword 함수
 * - @/lib/utils/tour-sort: sortTours 함수
 */

import { TourMapLayout } from "@/components/tour-map-layout";
import { TourFilters } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { ErrorDisplay } from "@/components/ui/error";
import type { ApiResponse } from "@/lib/api/tour-api";
import { sortTours } from "@/lib/utils/tour-sort";
import { getErrorMessage, shouldRetry } from "@/lib/utils/error-handler";
import type { TourItem } from "@/lib/types/tour";

/**
 * 홈페이지 - 관광지 목록
 * Server Component로 구현하여 초기 데이터 로딩 최적화
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const params = await searchParams;

    // 필터 파라미터 파싱
    const keyword = params.keyword as string | undefined;
    const areaCode = params.areaCode as string | undefined;
    const contentTypeId = params.contentTypeId as string | undefined;
    const sort = (params.sort as "latest" | "name") || "latest";

    // totalCount를 얻기 위한 유틸리티 함수
    const fetchToursWithTotalCount = async (
      endpoint: string,
      params: Record<string, string | number | undefined>
    ): Promise<{ tours: TourItem[]; totalCount: number }> => {
      const apiKey =
        process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

      if (!apiKey) {
        throw new Error(
          "API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 확인하세요."
        );
      }

      const allParams = {
        serviceKey: apiKey,
        MobileOS: "ETC",
        MobileApp: "MyTrip",
        _type: "json",
        ...params,
      };

      const queryString = new URLSearchParams();
      for (const [key, value] of Object.entries(allParams)) {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      }

      const url = `https://apis.data.go.kr/B551011/KorService2${endpoint}?${queryString.toString()}`;
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
        throw new Error(data.response.header.resultMsg || "API 오류가 발생했습니다.");
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
    };

    // 관광지 목록 조회 (검색 또는 필터 적용)
    let tours: TourItem[];
    let totalCount: number;

    if (keyword && keyword.trim().length > 0) {
      // 검색 키워드가 있으면 검색 API 호출 (필터와 조합)
      const result = await fetchToursWithTotalCount("/searchKeyword2", {
        keyword: keyword.trim(),
        areaCode,
        contentTypeId,
        numOfRows: 20,
        pageNo: 1,
      });
      tours = result.tours;
      totalCount = result.totalCount;
    } else {
      // 검색 키워드가 없으면 기존 목록 API 호출 (필터 적용)
      const result = await fetchToursWithTotalCount("/areaBasedList2", {
        areaCode,
        contentTypeId,
        numOfRows: 20,
        pageNo: 1,
      });
      tours = result.tours;
      totalCount = result.totalCount;
    }

    // 정렬 적용
    const sortedTours = sortTours(tours, sort);

    return (
      <main className="container mx-auto px-4 py-4 md:px-4 md:py-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">전국 관광지</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            한국관광공사에서 제공하는 관광지 정보를 확인하세요
          </p>
        </div>

        {/* 검색 컴포넌트 */}
        <div className="mb-4 md:mb-6">
          <TourSearch />
        </div>

        {/* 검색 결과 개수 표시 */}
        {keyword && (
          <div className="mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">
            검색 결과: <span className="font-medium text-foreground">{sortedTours.length}개</span>
            {keyword && (
              <>
                {" "}
                (검색어: <span className="font-medium text-foreground">&quot;{keyword}&quot;</span>)
              </>
            )}
          </div>
        )}

        {/* 필터 컴포넌트 */}
        <div className="mb-6 md:mb-8">
          <TourFilters />
        </div>

        {/* 관광지 목록 및 지도 */}
        <TourMapLayout
          tours={sortedTours}
          searchKeyword={keyword}
          initialTotalCount={totalCount}
        />
      </main>
    );
  } catch (error) {
    // 에러 처리 - getErrorMessage 유틸리티 사용
    const errorMessage = getErrorMessage(error);
    const canRetry = shouldRetry(error);

    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorDisplay 
          message={errorMessage} 
          onRetry={canRetry ? () => window.location.reload() : undefined}
          retryText="다시 시도"
        />
      </main>
    );
  }
}
