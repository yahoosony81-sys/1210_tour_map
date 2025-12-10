/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 사용하여 관광지 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 조회 및 표시
 * 2. 필터 기능 (지역, 관광 타입, 정렬)
 * 3. 로딩 상태 처리
 * 4. 에러 처리
 *
 * @dependencies
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/tour-filters: TourFilters 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 * - @/lib/api/tour-api: getAreaBasedList 함수
 * - @/lib/utils/tour-sort: sortTours 함수
 */

import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { Error } from "@/components/ui/error";
import { getAreaBasedList } from "@/lib/api/tour-api";
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
    const areaCode = params.areaCode as string | undefined;
    const contentTypeId = params.contentTypeId as string | undefined;
    const sort = (params.sort as "latest" | "name") || "latest";

    // 관광지 목록 조회 (필터 적용)
    const tours = await getAreaBasedList({
      areaCode,
      contentTypeId,
      numOfRows: 20, // 페이지당 20개 항목
      pageNo: 1,
    });

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

        {/* 필터 컴포넌트 */}
        <div className="mb-8">
          <TourFilters />
        </div>

        {/* 관광지 목록 */}
        <TourList tours={sortedTours} />
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
