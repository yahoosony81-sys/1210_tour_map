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

import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { Error } from "@/components/ui/error";
import { getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import { sortTours } from "@/lib/utils/tour-sort";

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

    // 관광지 목록 조회 (검색 또는 필터 적용)
    let tours;
    if (keyword && keyword.trim().length > 0) {
      // 검색 키워드가 있으면 검색 API 호출 (필터와 조합)
      tours = await searchKeyword(keyword.trim(), {
        areaCode,
        contentTypeId,
        numOfRows: 20, // 페이지당 20개 항목
        pageNo: 1,
      });
    } else {
      // 검색 키워드가 없으면 기존 목록 API 호출 (필터 적용)
      tours = await getAreaBasedList({
        areaCode,
        contentTypeId,
        numOfRows: 20, // 페이지당 20개 항목
        pageNo: 1,
      });
    }

    // 정렬 적용
    const sortedTours = sortTours(tours, sort);

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">전국 관광지</h1>
          <p className="mt-2 text-muted-foreground">
            한국관광공사에서 제공하는 관광지 정보를 확인하세요
          </p>
        </div>

        {/* 검색 컴포넌트 */}
        <div className="mb-6">
          <TourSearch />
        </div>

        {/* 검색 결과 개수 표시 */}
        {keyword && (
          <div className="mb-4 text-sm text-muted-foreground">
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
        <div className="mb-8">
          <TourFilters />
        </div>

        {/* 관광지 목록 */}
        <TourList tours={sortedTours} searchKeyword={keyword} />
      </main>
    );
  } catch (error) {
    // 에러 처리
    const errorMessage =
      error instanceof Error
        ? error.message
        : "관광지 정보를 불러오는 중 오류가 발생했습니다.";

    return (
      <main className="container mx-auto px-4 py-8">
        <Error message={errorMessage} />
      </main>
    );
  }
}
