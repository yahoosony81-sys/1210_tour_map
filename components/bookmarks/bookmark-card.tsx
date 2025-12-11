/**
 * @file bookmark-card.tsx
 * @description 북마크 카드 컴포넌트
 *
 * 북마크한 관광지를 표시하는 카드 컴포넌트입니다.
 * TourCard를 확장하여 삭제 버튼을 추가했습니다.
 *
 * 주요 기능:
 * 1. 관광지 정보 표시 (TourCard와 동일)
 * 2. 북마크 삭제 버튼
 * 3. 삭제 후 목록 새로고침
 *
 * @dependencies
 * - @/components/tour-card: TourCard 컴포넌트
 * - @/actions/bookmark-actions: toggleBookmark
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/toast: toast 함수
 * - lucide-react: Trash2 아이콘
 */

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { toggleBookmark } from "@/actions/bookmark-actions";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  /** 관광지 정보 */
  tour: TourItem;
  /** 선택 상태 (일괄 삭제용) */
  isSelected?: boolean;
  /** 선택 변경 핸들러 (일괄 삭제용) */
  onSelectChange?: (contentId: string, checked: boolean) => void;
  /** 삭제 후 콜백 (선택 사항) */
  onDelete?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 카드 컴포넌트
 * TourCard를 확장하여 삭제 버튼과 체크박스를 추가
 */
export function BookmarkCard({
  tour,
  isSelected = false,
  onSelectChange,
  onDelete,
  className,
}: BookmarkCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      // 북마크 제거 (toggleBookmark 사용)
      const isBookmarked = await toggleBookmark(tour.contentid);
      
      if (!isBookmarked) {
        toast.success("북마크에서 제거되었습니다");
        
        // 삭제 후 콜백 실행
        if (onDelete) {
          onDelete();
        } else {
          // 기본 동작: 페이지 새로고침
          router.refresh();
        }
      }
    } catch (error) {
      console.error("북마크 삭제 실패:", error);
      
      // 사용자 친화적 에러 메시지
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("북마크 삭제 중 오류가 발생했습니다");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelectChange) {
      onSelectChange(tour.contentid, checked);
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {/* TourCard */}
      <TourCard tour={tour} />

      {/* 체크박스 (왼쪽 상단, 일괄 삭제용) */}
      {onSelectChange && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            aria-label={`${tour.title} 선택`}
            className="bg-background/90 backdrop-blur-sm"
          />
        </div>
      )}

      {/* 삭제 버튼 (오른쪽 상단) */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
        className={cn(
          "absolute top-2 right-2 z-10 min-h-[44px] min-w-[44px]",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "shadow-lg"
        )}
        aria-label="북마크 삭제"
        aria-busy={isDeleting}
      >
        {isDeleting ? (
          <span className="text-sm">...</span>
        ) : (
          <Trash2 className="size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}

