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
 * 현재 단계: 통계 요약 카드, 지역별 분포 차트, 타입별 분포 차트 구현 완료
 *
 * @dependencies
 * - @/components/ui/error: Error 컴포넌트
 * - @/components/stats/stats-summary: StatsSummary 컴포넌트
 * - @/components/stats/region-chart: RegionChart 컴포넌트
 * - @/components/stats/type-chart: TypeChart 컴포넌트
 */

import { Error } from "@/components/ui/error";
import { StatsSummary } from "@/components/stats/stats-summary";
import { RegionChart } from "@/components/stats/region-chart";
import { TypeChart } from "@/components/stats/type-chart";
import { getErrorMessage, shouldRetry } from "@/lib/utils/error-handler";

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
          <RegionChart />
        </section>

        {/* 타입별 분포 차트 영역 */}
        <section className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
            관광 타입별 분포
          </h2>
          <TypeChart />
        </section>
      </main>
    );
  } catch (error) {
    // 에러 처리 - getErrorMessage 유틸리티 사용
    const errorMessage = getErrorMessage(error);
    const canRetry = shouldRetry(error);

    return (
      <main className="container mx-auto px-4 py-8">
        <Error
          message={errorMessage}
          onRetry={canRetry ? () => window.location.reload() : undefined}
          retryText="다시 시도"
        />
      </main>
    );
  }
}

