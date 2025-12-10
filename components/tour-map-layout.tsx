/**
 * @file tour-map-layout.tsx
 * @description 관광지 목록과 지도를 함께 표시하는 레이아웃 컴포넌트
 *
 * 데스크톱에서는 리스트와 지도를 분할하여 표시하고,
 * 모바일에서는 탭 형태로 리스트/지도를 전환합니다.
 * 무한 스크롤 페이지네이션 기능을 포함합니다.
 *
 * @dependencies
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/naver-map: NaverMap 컴포넌트
 * - @/actions/tour-actions: loadMoreTours Server Action
 * - @/lib/types/tour: TourItem 타입
 * - @/lib/utils/tour-sort: SortOption 타입
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourList } from "@/components/tour-list";
import { NaverMap } from "@/components/naver-map";
import { loadMoreTours } from "@/actions/tour-actions";
import type { TourItem } from "@/lib/types/tour";
import type { SortOption } from "@/lib/utils/tour-sort";
import { cn } from "@/lib/utils";

interface TourMapLayoutProps {
  /** 초기 관광지 목록 (첫 페이지) */
  tours: TourItem[];
  /** 검색 키워드 */
  searchKeyword?: string;
  /** 초기 totalCount (선택, 없으면 추정) */
  initialTotalCount?: number;
  /** 추가 클래스명 */
  className?: string;
}

type ViewMode = "list" | "map";

/**
 * 관광지 목록과 지도 레이아웃 컴포넌트
 */
export function TourMapLayout({
  tours: initialTours,
  searchKeyword,
  initialTotalCount,
  className,
}: TourMapLayoutProps) {
  const searchParams = useSearchParams();
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [hoveredContentId, setHoveredContentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // 페이지네이션 상태
  const [allTours, setAllTours] = useState<TourItem[]>(initialTours);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialTotalCount ? initialTours.length < initialTotalCount : initialTours.length >= 20
  );
  const [totalCount, setTotalCount] = useState(initialTotalCount || 0);

  // Intersection Observer를 위한 ref
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 필터/검색 파라미터 추출
  const areaCode = searchParams.get("areaCode") || undefined;
  const contentTypeId = searchParams.get("contentTypeId") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const sort = (searchParams.get("sort") as SortOption) || "latest";

  // 필터/검색 변경 시 페이지 리셋
  useEffect(() => {
    setAllTours(initialTours);
    setCurrentPage(1);
    setIsLoadingMore(false);
    setHasMore(
      initialTotalCount ? initialTours.length < initialTotalCount : initialTours.length >= 20
    );
    setTotalCount(initialTotalCount || 0);
  }, [initialTours, initialTotalCount, areaCode, contentTypeId, keyword, sort]);

  // Intersection Observer 설정
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoadingMore && hasMore) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px", // 하단 100px 전에 미리 로드
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isLoadingMore, hasMore, areaCode, contentTypeId, keyword, sort]);

  // 추가 데이터 로드
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await loadMoreTours(nextPage, {
        areaCode,
        contentTypeId,
        keyword,
        sort,
        numOfRows: 20,
      });

      setAllTours((prev) => [...prev, ...result.tours]);
      setCurrentPage(nextPage);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("추가 데이터 로드 실패:", error);
      // 에러 발생 시 hasMore를 false로 설정하여 더 이상 시도하지 않음
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleTourSelect = (contentId: string) => {
    setSelectedContentId(contentId);
    // 모바일에서 지도 뷰로 전환
    if (window.innerWidth < 768) {
      setViewMode("map");
    }
  };

  const handleTourHover = (contentId: string | null) => {
    setHoveredContentId(contentId);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* 모바일: 탭 버튼 */}
      <div className="mb-4 flex gap-2 md:hidden">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="flex-1"
        >
          <List className="mr-2 h-4 w-4" />
          목록
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("map")}
          className="flex-1"
        >
          <MapIcon className="mr-2 h-4 w-4" />
          지도
        </Button>
      </div>

      {/* 데스크톱: 분할 레이아웃, 모바일: 탭 전환 */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        {/* 리스트 영역 */}
        <div
          className={cn(
            "w-full transition-all",
            viewMode === "list" ? "block" : "hidden",
            "md:block md:w-1/2"
          )}
        >
          <TourList
            tours={allTours}
            searchKeyword={searchKeyword}
            selectedContentId={selectedContentId}
            onTourSelect={handleTourSelect}
            onTourHover={handleTourHover}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
          />
          {/* 하단 감지 요소 (Intersection Observer 타겟) */}
          <div ref={sentinelRef} className="h-4" />
        </div>

        {/* 지도 영역 */}
        <div
          className={cn(
            "w-full transition-all",
            viewMode === "map" ? "block" : "hidden",
            "md:block md:w-1/2"
          )}
        >
          <NaverMap
            tours={allTours}
            selectedContentId={selectedContentId}
            hoveredContentId={hoveredContentId}
            onTourSelect={setSelectedContentId}
          />
        </div>
      </div>
    </div>
  );
}

