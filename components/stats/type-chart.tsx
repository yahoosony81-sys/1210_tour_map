/**
 * @file type-chart.tsx
 * @description 타입별 관광지 분포 차트 컴포넌트
 *
 * 통계 대시보드에서 관광 타입별 관광지 개수를 Donut Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 타입별 관광지 통계 데이터 수집 (getTypeStats)
 * 2. Donut Chart로 타입별 분포 시각화
 * 3. 섹션 클릭 시 해당 타입의 관광지 목록 페이지로 이동
 * 4. 호버 시 타입명, 개수, 비율 표시
 *
 * 핵심 구현 로직:
 * - Server Component로 데이터 수집
 * - Client Component로 차트 렌더링 (recharts)
 * - 모든 타입 표시 (8가지 관광 타입)
 * - 반응형 디자인 및 다크/라이트 모드 지원
 *
 * @dependencies
 * - @/lib/api/stats-api: getTypeStats 함수
 * - @/lib/types/stats: TypeStats 타입
 * - @/components/stats/type-chart-client: TypeChartClient 컴포넌트
 * - @/components/ui/skeleton: Skeleton UI 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항
 */

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "@/components/ui/error";
import { getTypeStats } from "@/lib/api/stats-api";
import { TypeChartClient } from "./type-chart-client";

/**
 * 타입별 분포 차트 로딩 스켈레톤 UI
 */
export function TypeChartSkeleton() {
  return (
    <div className="h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border bg-card p-4 md:p-6">
      <Skeleton className="h-full w-full rounded-full" />
    </div>
  );
}

/**
 * 타입별 분포 차트 컴포넌트
 * Server Component로 구현되어 서버에서 데이터를 직접 가져옵니다.
 */
export async function TypeChart() {
  try {
    // 타입별 통계 데이터 수집
    const typeStats = await getTypeStats();

    // 데이터가 없을 때 처리
    if (!typeStats || typeStats.length === 0) {
      return (
        <div className="h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border bg-card p-4 md:p-6 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <TypeChartClient data={typeStats} />
      </div>
    );
  } catch (error) {
    // 에러 처리
    const errorMessage =
      error instanceof Error
        ? error.message
        : "타입별 통계 정보를 불러오는 중 오류가 발생했습니다.";

    return (
      <div className="h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border bg-card p-4 md:p-6">
        <ErrorDisplay message={errorMessage} size="medium" />
      </div>
    );
  }
}

