/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 컴포넌트
 *
 * 통계 대시보드에서 지역별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 통계 데이터 수집 (getRegionStats)
 * 2. Bar Chart로 지역별 분포 시각화
 * 3. 바 클릭 시 해당 지역의 관광지 목록 페이지로 이동
 * 4. 호버 시 정확한 개수 표시
 *
 * 핵심 구현 로직:
 * - Server Component로 데이터 수집
 * - Client Component로 차트 렌더링 (recharts)
 * - 상위 10개 지역만 표시 (기본값)
 * - 반응형 디자인 및 다크/라이트 모드 지원
 *
 * @dependencies
 * - @/lib/api/stats-api: getRegionStats 함수
 * - @/lib/types/stats: RegionStats 타입
 * - @/components/stats/region-chart-client: RegionChartClient 컴포넌트
 * - @/components/ui/skeleton: Skeleton UI 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/ui/error";
import { getRegionStats } from "@/lib/api/stats-api";
import { RegionChartClient } from "./region-chart-client";

/**
 * 지역별 분포 차트 로딩 스켈레톤 UI
 */
export function RegionChartSkeleton() {
  return (
    <div className="h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border bg-card p-4 md:p-6">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

/**
 * 지역별 분포 차트 컴포넌트
 * Server Component로 구현되어 서버에서 데이터를 직접 가져옵니다.
 */
export async function RegionChart() {
  try {
    // 지역별 통계 데이터 수집
    const regionStats = await getRegionStats();

    // 데이터가 없을 때 처리
    if (!regionStats || regionStats.length === 0) {
      return (
        <div className="h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border bg-card p-4 md:p-6 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <RegionChartClient data={regionStats} />
      </div>
    );
  } catch (error) {
    // 에러 처리
    const errorMessage =
      error instanceof Error
        ? error.message
        : "지역별 통계 정보를 불러오는 중 오류가 발생했습니다.";

    return (
      <div className="h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border bg-card p-4 md:p-6">
        <Error message={errorMessage} size="medium" />
      </div>
    );
  }
}

