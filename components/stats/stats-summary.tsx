/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드의 요약 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시
 * 2. Top 3 지역 표시
 * 3. Top 3 타입 표시
 * 4. 마지막 업데이트 시간 표시
 *
 * 핵심 구현 로직:
 * - Server Component로 구현하여 서버에서 데이터 직접 수집
 * - getStatsSummary() API 호출
 * - 4개의 카드로 정보 시각화
 * - 로딩 상태 및 에러 처리
 *
 * @dependencies
 * - @/lib/api/stats-api: getStatsSummary 함수
 * - @/lib/types/stats: StatsSummary 타입
 * - @/components/ui/skeleton: Skeleton UI 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 * - lucide-react: 아이콘
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항
 */

import { Globe, TrendingUp, Award, Clock } from "lucide-react";
import { getStatsSummary } from "@/lib/api/stats-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/ui/error";
import { cn } from "@/lib/utils";

/**
 * 숫자를 천 단위 콤마로 포맷팅
 */
function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

/**
 * ISO 8601 형식의 날짜를 한국 시간으로 포맷팅
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 통계 요약 카드 컴포넌트
 * Server Component로 구현되어 서버에서 데이터를 직접 가져옵니다.
 */
export async function StatsSummary() {
  try {
    // 통계 요약 데이터 수집
    const summary = await getStatsSummary();

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {/* 전체 관광지 수 카드 */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium text-muted-foreground">전체 관광지</h3>
          </div>
          <p className="text-2xl font-bold">{formatNumber(summary.totalCount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">전국 관광지 총 개수</p>
        </div>

        {/* Top 3 지역 카드 */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium text-muted-foreground">인기 지역 Top 3</h3>
          </div>
          <div className="space-y-2">
            {summary.topRegions.length > 0 ? (
              summary.topRegions.map((region, index) => (
                <div
                  key={region.areaCode}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        index === 0 && "bg-yellow-500 text-white",
                        index === 1 && "bg-gray-400 text-white",
                        index === 2 && "bg-amber-600 text-white"
                      )}
                      aria-label={`${index + 1}위`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{region.regionName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(region.count)}개
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">데이터 없음</p>
            )}
          </div>
        </div>

        {/* Top 3 타입 카드 */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium text-muted-foreground">인기 타입 Top 3</h3>
          </div>
          <div className="space-y-2">
            {summary.topTypes.length > 0 ? (
              summary.topTypes.map((type, index) => (
                <div
                  key={type.contentTypeId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        index === 0 && "bg-yellow-500 text-white",
                        index === 1 && "bg-gray-400 text-white",
                        index === 2 && "bg-amber-600 text-white"
                      )}
                      aria-label={`${index + 1}위`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{type.typeName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(type.count)}개
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">데이터 없음</p>
            )}
          </div>
        </div>

        {/* 마지막 업데이트 시간 카드 */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium text-muted-foreground">마지막 업데이트</h3>
          </div>
          <p className="text-base font-semibold">{formatDate(summary.lastUpdated)}</p>
          <p className="mt-1 text-xs text-muted-foreground">통계 데이터 갱신 시간</p>
        </div>
      </div>
    );
  } catch (error) {
    // 에러 처리
    const errorMessage =
      error instanceof Error
        ? error.message
        : "통계 요약 정보를 불러오는 중 오류가 발생했습니다.";

    return (
      <Error
        message={errorMessage}
        size="medium"
        className="min-h-[200px]"
      />
    );
  }
}

/**
 * 통계 요약 카드 로딩 스켈레톤 UI
 * 데이터 로딩 중 표시되는 placeholder 컴포넌트
 */
export function StatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* 전체 관광지 수 카드 스켈레톤 */}
      <div className="h-32 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-24" />
      </div>
      {/* Top 3 지역 카드 스켈레톤 */}
      <div className="h-32 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-6 w-28 mb-1" />
        <Skeleton className="h-6 w-24" />
      </div>
      {/* Top 3 타입 카드 스켈레톤 */}
      <div className="h-32 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-6 w-28 mb-1" />
        <Skeleton className="h-6 w-24" />
      </div>
      {/* 마지막 업데이트 시간 카드 스켈레톤 */}
      <div className="h-32 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-6 w-36" />
      </div>
    </div>
  );
}

