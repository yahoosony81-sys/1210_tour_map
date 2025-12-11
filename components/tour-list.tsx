/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 로딩, 빈 상태, 에러 상태를 처리합니다.
 *
 * 주요 기능:
 * 1. 그리드 레이아웃으로 관광지 카드 표시
 * 2. 로딩 상태 처리 (Skeleton UI)
 * 3. 빈 상태 처리 (결과 없음 메시지)
 * 4. 반응형 디자인 (모바일/태블릿/데스크톱)
 *
 * @dependencies
 * - @/components/tour-card: TourCard 컴포넌트
 * - @/components/ui/skeleton: Skeleton UI
 * - @/lib/types/tour: TourItem 타입
 */

import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourListProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 검색 키워드 (검색 결과 없음 메시지 개선용) */
  searchKeyword?: string;
  /** 선택된 관광지 ID (지도 연동용) */
  selectedContentId?: string | null;
  /** 관광지 선택 핸들러 (지도 연동용) */
  onTourSelect?: (contentId: string) => void;
  /** 관광지 호버 핸들러 (지도 연동용) */
  onTourHover?: (contentId: string | null) => void;
  /** 추가 데이터 로딩 중 여부 (무한 스크롤) */
  isLoadingMore?: boolean;
  /** 더 불러올 데이터가 있는지 여부 */
  hasMore?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 로딩 스켈레톤 카드 컴포넌트
 */
function TourCardSkeleton() {
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
 * 빈 상태 컴포넌트
 */
function EmptyState({ searchKeyword }: { searchKeyword?: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <p className="text-lg font-medium text-muted-foreground">
        {searchKeyword ? (
          <>
            &quot;<span className="text-foreground">{searchKeyword}</span>&quot;에 대한 검색 결과가 없습니다
          </>
        ) : (
          "관광지를 찾을 수 없습니다"
        )}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {searchKeyword
          ? "다른 검색어나 필터 조건을 시도해보세요"
          : "다른 검색 조건을 시도해보세요"}
      </p>
    </div>
  );
}

export function TourList({
  tours,
  isLoading = false,
  searchKeyword,
  selectedContentId,
  onTourSelect,
  onTourHover,
  isLoadingMore = false,
  hasMore = false,
  className,
}: TourListProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
        <EmptyState searchKeyword={searchKeyword} />
      </div>
    );
  }

  // 목록 표시
  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {tours.map((tour, index) => (
          <TourCard
            key={tour.contentid}
            tour={tour}
            isSelected={selectedContentId === tour.contentid}
            onSelect={onTourSelect}
            onHover={onTourHover}
            priority={index === 0}
          />
        ))}
      </div>

      {/* 추가 데이터 로딩 인디케이터 */}
      {isLoadingMore && (
        <div className="mt-8 flex flex-col items-center justify-center gap-2">
          <Loading size="medium" text="더 많은 관광지를 불러오는 중..." />
          <p className="text-xs text-muted-foreground">
            잠시만 기다려주세요...
          </p>
        </div>
      )}

      {/* 더 이상 불러올 데이터가 없을 때 */}
      {!hasMore && tours.length > 0 && !isLoadingMore && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            모든 관광지를 불러왔습니다. ({tours.length}개)
          </p>
        </div>
      )}
    </>
  );
}

