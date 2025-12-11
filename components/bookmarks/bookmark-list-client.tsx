/**
 * @file bookmark-list-client.tsx
 * @description 북마크 목록 클라이언트 컴포넌트
 *
 * 북마크 목록의 클라이언트 사이드 기능(일괄 삭제, 선택 관리)을 담당하는 컴포넌트입니다.
 *
 * @dependencies
 * - react: useState
 * - next/navigation: useRouter
 * - @/actions/bookmark-actions: toggleBookmark
 * - @/components/bookmarks/bookmark-card: BookmarkCard 컴포넌트
 * - @/components/bookmarks/bookmark-bulk-actions: BookmarkBulkActions 컴포넌트
 * - @/components/ui/toast: toast 함수
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TourItem } from "@/lib/types/tour";
import { BookmarkCard } from "@/components/bookmarks/bookmark-card";
import { BookmarkBulkActions } from "@/components/bookmarks/bookmark-bulk-actions";
import { toggleBookmark } from "@/actions/bookmark-actions";
import { toast } from "@/components/ui/toast";

interface BookmarkListClientProps {
  /** 관광지 목록 */
  tours: TourItem[];
}

/**
 * 북마크 목록 클라이언트 컴포넌트
 * 일괄 삭제 및 선택 관리 기능 제공
 */
export function BookmarkListClient({ tours }: BookmarkListClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(tours.map((tour) => tour.contentid)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 개별 선택
  const handleSelectChange = (contentId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(contentId);
    } else {
      newSelected.delete(contentId);
    }
    setSelectedIds(newSelected);
  };

  // 일괄 삭제 실행
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      // 선택된 항목들을 순차적으로 삭제
      const deletePromises = Array.from(selectedIds).map((contentId) =>
        toggleBookmark(contentId).catch((error) => {
          console.error(`Failed to delete bookmark ${contentId}:`, error);
          return false; // 일부 실패해도 계속 진행
        })
      );

      await Promise.all(deletePromises);

      toast.success(`${selectedIds.size}개의 북마크가 삭제되었습니다`);

      // 선택 초기화
      setSelectedIds(new Set());

      // 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("일괄 삭제 실패:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* 일괄 삭제 영역 */}
      <BookmarkBulkActions
        tours={tours}
        selectedIds={selectedIds}
        onSelectChange={handleSelectChange}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDelete}
        isDeleting={isDeleting}
      />

      {/* 북마크 목록 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <BookmarkCard
            key={tour.contentid}
            tour={tour}
            isSelected={selectedIds.has(tour.contentid)}
            onSelectChange={handleSelectChange}
          />
        ))}
      </div>
    </>
  );
}

