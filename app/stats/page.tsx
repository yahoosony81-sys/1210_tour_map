/**
 * @file page.tsx
 * @description 통계 대시보드 페이지
 *
 * 전국 관광지 통계를 시각화하여 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 통계 요약 카드 표시 (전체 개수, Top 3 지역, Top 3 타입, 업데이트 시간)
 * 2. 지역별 관광지 분포 차트 (Bar Chart)
 * 3. 관광 타입별 분포 차트 (Donut Chart)
 *
 * 현재 단계: 통계 요약 카드 구현 완료
 * 향후 구현: 지역별/타입별 분포 차트 컴포넌트
 *
 * @dependencies
 * - @/components/ui/error: Error 컴포넌트
 * - @/components/stats/stats-summary: StatsSummary 컴포넌트
 */

import { Error } from "@/components/ui/error";
import { StatsSummary } from "@/components/stats/stats-summary";

export const dynamic = "force-dynamic";

/**
 * 통계 대시보드 페이지
 * Server Component로 구현하여 초기 로딩 최적화
 */
export default async function StatsPage() {
  try {
    return (
      <main className="container mx-auto px-4 py-4 md:px-4 md:py-8">
        {/* 제목 영역 */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">통계 대시보드</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            전국 관광지 통계를 한눈에 확인하세요
          </p>
        </div>

        {/* 통계 요약 카드 영역 */}
        <section className="mb-6 md:mb-8">
          <StatsSummary />
        </section>

        {/* 지역별 분포 차트 영역 */}
        <section className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
            지역별 관광지 분포
          </h2>
          <div className="h-64 md:h-96 rounded-lg border bg-card p-4 md:p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </section>

        {/* 타입별 분포 차트 영역 */}
        <section className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
            관광 타입별 분포
          </h2>
          <div className="h-64 md:h-96 rounded-lg border bg-card p-4 md:p-6">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    // 에러 처리 - 사용자 친화적 메시지로 변환
    let errorMessage = "통계 정보를 불러오는 중 오류가 발생했습니다.";
    let showRetry = false;

    if (error instanceof Error) {
      const message = error.message;

      // 네트워크 에러
      if (
        message.includes("네트워크") ||
        message.includes("fetch") ||
        message.includes("Failed to fetch")
      ) {
        errorMessage = "네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.";
        showRetry = true;
      }
      // 기타 에러
      else {
        errorMessage = message;
      }
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <Error
          message={errorMessage}
          onRetry={showRetry ? () => window.location.reload() : undefined}
          retryText="다시 시도"
        />
      </main>
    );
  }
}

