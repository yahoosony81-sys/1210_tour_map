/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 사용하여 관광지 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 조회 및 표시
 * 2. 로딩 상태 처리
 * 3. 에러 처리
 *
 * @dependencies
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 * - @/lib/api/tour-api: getAreaBasedList 함수
 */

import { TourList } from "@/components/tour-list";
import { Error } from "@/components/ui/error";
import { getAreaBasedList } from "@/lib/api/tour-api";

/**
 * 홈페이지 - 관광지 목록
 * Server Component로 구현하여 초기 데이터 로딩 최적화
 */
export default async function HomePage() {
  try {
    // 초기 데이터: 전체 지역, 전체 타입 (파라미터 없음)
    // 기본값: numOfRows=10, pageNo=1
    const tours = await getAreaBasedList({
      numOfRows: 20, // 페이지당 20개 항목
      pageNo: 1,
    });

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">전국 관광지</h1>
          <p className="mt-2 text-muted-foreground">
            한국관광공사에서 제공하는 관광지 정보를 확인하세요
          </p>
        </div>

        <TourList tours={tours} />
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
