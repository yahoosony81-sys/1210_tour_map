/**
 * @file bookmark-sort.tsx
 * @description 북마크 정렬 옵션 컴포넌트
 *
 * 북마크 목록을 정렬하는 옵션을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 최신순 정렬 (created_at DESC)
 * 2. 이름순 정렬 (title 오름차순, 가나다순)
 * 3. 지역별 정렬 (areacode 기준)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/button: Button 컴포넌트
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortOption = "latest" | "name" | "region";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "name", label: "이름순" },
  { value: "region", label: "지역별" },
];

/**
 * 북마크 정렬 옵션 컴포넌트
 */
export function BookmarkSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOption) || "latest";

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (sort === "latest") {
      // 기본값이면 파라미터 제거
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }

    // URL 업데이트 (replace 방식)
    router.replace(`/bookmarks?${params.toString()}`);
  };

  return (
    <div className="mb-4 md:mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">정렬:</span>
        {SORT_OPTIONS.map((option) => {
          const isActive = currentSort === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange(option.value)}
              className={cn(
                "min-h-[44px] min-w-[44px] text-sm md:text-base",
                isActive && "bg-primary text-primary-foreground"
              )}
              aria-label={`${option.label}로 정렬`}
              aria-pressed={isActive}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

