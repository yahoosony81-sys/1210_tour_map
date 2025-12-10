/**
 * @file detail-recommendations.tsx
 * @description 관광지 추천 섹션 컴포넌트
 *
 * 현재 관광지와 같은 지역 또는 같은 타입의 다른 관광지를 추천하는 Server Component입니다.
 * getAreaBasedList() API를 사용하여 관련 관광지를 조회하고 카드 형태로 표시합니다.
 *
 * 주요 기능:
 * 1. 같은 지역 + 같은 타입으로 추천 관광지 조회
 * 2. 현재 관광지 제외 필터링
 * 3. 최대 6개 추천 관광지 표시
 * 4. 결과가 부족하면 필터 조건 완화 (지역만 또는 타입만)
 * 5. TourCard 컴포넌트 재사용
 * 6. 로딩/에러/빈 상태 처리
 *
 * @dependencies
 * - @/lib/api/tour-api: getAreaBasedList 함수
 * - @/lib/types/tour: TourItem 타입
 * - @/components/tour-card: TourCard 컴포넌트
 * - @/components/ui/skeleton: Skeleton UI
 * - @/components/ui/error: Error 컴포넌트
 */

import { getAreaBasedList } from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/ui/error";

interface DetailRecommendationsProps {
  /** 현재 관광지 ID (제외용) */
  contentId: string;
  /** 지역 코드 (선택) */
  areaCode?: string;
  /** 관광 타입 ID */
  contentTypeId: string;
}

/**
 * 추천 관광지 조회 함수
 * 1. areaCode가 있으면: 같은 지역 + 같은 타입으로 조회
 * 2. 결과가 6개 미만이면 같은 지역만으로 조회 (타입 필터 제거)
 * 3. 여전히 부족하면 같은 타입만으로 조회 (지역 필터 제거)
 * 4. areaCode가 없으면: 같은 타입만으로 조회
 */
async function getRecommendedTours(
  contentId: string,
  areaCode: string | undefined,
  contentTypeId: string
): Promise<TourItem[]> {
  const MAX_RECOMMENDATIONS = 6;
  let tours: TourItem[] = [];

  // 1. areaCode가 있으면: 같은 지역 + 같은 타입으로 조회
  if (areaCode) {
    tours = await getAreaBasedList({
      areaCode,
      contentTypeId,
      numOfRows: MAX_RECOMMENDATIONS * 2, // 여유있게 조회
      pageNo: 1,
    });

    // 현재 관광지 제외
    tours = tours.filter((tour) => tour.contentid !== contentId);

    // 6개 이상이면 반환
    if (tours.length >= MAX_RECOMMENDATIONS) {
      return tours.slice(0, MAX_RECOMMENDATIONS);
    }

    // 2. 같은 지역만으로 조회 (타입 필터 제거)
    if (tours.length < MAX_RECOMMENDATIONS) {
      const areaTours = await getAreaBasedList({
        areaCode,
        numOfRows: MAX_RECOMMENDATIONS * 2,
        pageNo: 1,
      });

      // 현재 관광지 제외 및 중복 제거
      const filteredAreaTours = areaTours.filter(
        (tour) =>
          tour.contentid !== contentId &&
          !tours.some((t) => t.contentid === tour.contentid)
      );

      tours = [...tours, ...filteredAreaTours].slice(0, MAX_RECOMMENDATIONS);

      // 6개 이상이면 반환
      if (tours.length >= MAX_RECOMMENDATIONS) {
        return tours.slice(0, MAX_RECOMMENDATIONS);
      }
    }
  }

  // 3. 같은 타입만으로 조회 (지역 필터 제거 또는 areaCode가 없을 때)
  if (tours.length < MAX_RECOMMENDATIONS) {
    const typeTours = await getAreaBasedList({
      contentTypeId,
      numOfRows: MAX_RECOMMENDATIONS * 2,
      pageNo: 1,
    });

    // 현재 관광지 제외 및 중복 제거
    const filteredTypeTours = typeTours.filter(
      (tour) =>
        tour.contentid !== contentId &&
        !tours.some((t) => t.contentid === tour.contentid)
    );

    tours = [...tours, ...filteredTypeTours].slice(0, MAX_RECOMMENDATIONS);
  }

  return tours;
}

/**
 * 로딩 스켈레톤 카드 컴포넌트
 */
function RecommendationCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Skeleton className="aspect-video w-full rounded-t-lg" />
      <div className="p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * 관광지 추천 섹션 컴포넌트
 */
export async function DetailRecommendations({
  contentId,
  areaCode,
  contentTypeId,
}: DetailRecommendationsProps) {
  // contentTypeId가 없으면 표시하지 않음
  if (!contentTypeId) {
    return null;
  }
  let recommendedTours: TourItem[] = [];
  let error: Error | null = null;

  try {
    recommendedTours = await getRecommendedTours(
      contentId,
      areaCode,
      contentTypeId
    );
  } catch (err) {
    error = err instanceof Error ? err : new Error("추천 관광지를 불러오는데 실패했습니다");
  }

  // 에러 상태
  if (error) {
    return (
      <section className="mb-8 border-b pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">추천 관광지</h2>
        <Error
          message={error.message}
          size="medium"
          className="mt-4"
        />
      </section>
    );
  }

  // 추천 관광지 없음
  if (recommendedTours.length === 0) {
    return (
      <section className="mb-8 border-b pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">추천 관광지</h2>
        <div className="mt-4 text-center text-muted-foreground">
          <p>이 지역의 다른 관광지가 없습니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 border-b pb-8">
      <h2 className="mb-4 text-xl font-semibold md:text-2xl">추천 관광지</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendedTours.map((tour) => (
          <TourCard key={tour.contentid} tour={tour} />
        ))}
      </div>
    </section>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
export function DetailRecommendationsSkeleton() {
  return (
    <section className="mb-8 border-b pb-8">
      <h2 className="mb-4 text-xl font-semibold md:text-2xl">추천 관광지</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <RecommendationCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

