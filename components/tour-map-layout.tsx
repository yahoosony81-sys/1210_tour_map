/**
 * @file tour-map-layout.tsx
 * @description 관광지 목록과 지도를 함께 표시하는 레이아웃 컴포넌트
 *
 * 데스크톱에서는 리스트와 지도를 분할하여 표시하고,
 * 모바일에서는 탭 형태로 리스트/지도를 전환합니다.
 *
 * @dependencies
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/naver-map: NaverMap 컴포넌트
 * - @/lib/types/tour: TourItem 타입
 */

"use client";

import { useState } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourList } from "@/components/tour-list";
import { NaverMap } from "@/components/naver-map";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourMapLayoutProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 검색 키워드 */
  searchKeyword?: string;
  /** 추가 클래스명 */
  className?: string;
}

type ViewMode = "list" | "map";

/**
 * 관광지 목록과 지도 레이아웃 컴포넌트
 */
export function TourMapLayout({ tours, searchKeyword, className }: TourMapLayoutProps) {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [hoveredContentId, setHoveredContentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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
            tours={tours}
            searchKeyword={searchKeyword}
            selectedContentId={selectedContentId}
            onTourSelect={handleTourSelect}
            onTourHover={handleTourHover}
          />
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
            tours={tours}
            selectedContentId={selectedContentId}
            hoveredContentId={hoveredContentId}
            onTourSelect={setSelectedContentId}
          />
        </div>
      </div>
    </div>
  );
}

