/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 반려동물, 정렬 옵션을 선택할 수 있는 필터 컴포넌트입니다.
 * URL 쿼리 파라미터로 상태를 관리합니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택)
 * 2. 관광 타입 필터 (다중 선택)
 * 3. 반려동물 동반 가능 필터 (토글, 크기별)
 * 4. 정렬 옵션 (최신순, 이름순)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/lib/api/tour-api: getAreaCode 함수
 * - @/lib/types/tour: CONTENT_TYPE_ID, CONTENT_TYPE_NAME, AreaCode 타입
 * - @/components/ui/button: Button 컴포넌트
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAreaCode } from "@/lib/api/tour-api";
import {
  CONTENT_TYPE_ID,
  CONTENT_TYPE_NAME,
  type AreaCode,
  type ContentTypeId,
} from "@/lib/types/tour";

/**
 * 관광 타입 옵션
 */
const CONTENT_TYPE_OPTIONS = [
  { id: CONTENT_TYPE_ID.TOURIST_SPOT, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.TOURIST_SPOT] },
  { id: CONTENT_TYPE_ID.CULTURAL_FACILITY, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.CULTURAL_FACILITY] },
  { id: CONTENT_TYPE_ID.FESTIVAL, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.FESTIVAL] },
  { id: CONTENT_TYPE_ID.TOUR_COURSE, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.TOUR_COURSE] },
  { id: CONTENT_TYPE_ID.LEISURE_SPORTS, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.LEISURE_SPORTS] },
  { id: CONTENT_TYPE_ID.ACCOMMODATION, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.ACCOMMODATION] },
  { id: CONTENT_TYPE_ID.SHOPPING, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.SHOPPING] },
  { id: CONTENT_TYPE_ID.RESTAURANT, name: CONTENT_TYPE_NAME[CONTENT_TYPE_ID.RESTAURANT] },
] as const;

/**
 * 정렬 옵션
 */
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "name", label: "이름순" },
] as const;

/**
 * 반려동물 크기 옵션
 */
const PET_SIZE_OPTIONS = [
  { value: "small", label: "소형" },
  { value: "medium", label: "중형" },
  { value: "large", label: "대형" },
] as const;

export function TourFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [areaLoadError, setAreaLoadError] = useState<string | null>(null);

  // 현재 필터 값
  const currentAreaCode = searchParams.get("areaCode") || "";
  const currentContentTypeIds = searchParams.get("contentTypeId")?.split(",").filter(Boolean) || [];
  const currentPetAllowed = searchParams.get("petAllowed") === "true";
  const currentPetSize = searchParams.get("petSize") || "";
  const currentSort = (searchParams.get("sort") as "latest" | "name") || "latest";

  // 지역 목록 로드
  useEffect(() => {
    async function loadAreaCodes() {
      try {
        setIsLoadingAreas(true);
        setAreaLoadError(null);
        const codes = await getAreaCode();
        setAreaCodes(codes);
      } catch (error) {
        console.error("지역 코드 로드 실패:", error);
        setAreaLoadError(
          error instanceof Error
            ? error.message
            : "지역 목록을 불러오는 중 오류가 발생했습니다."
        );
        // 기본 지역 목록 제공 (에러 발생 시에도 필터는 사용 가능하도록)
        setAreaCodes([]);
      } finally {
        setIsLoadingAreas(false);
      }
    }

    loadAreaCodes();
  }, []);

  /**
   * URL 쿼리 파라미터 업데이트
   */
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  /**
   * 지역 필터 변경
   */
  const handleAreaChange = (areaCode: string) => {
    updateSearchParams({
      areaCode: areaCode === "" ? null : areaCode,
      pageNo: null, // 페이지 리셋
    });
  };

  /**
   * 관광 타입 필터 토글
   */
  const handleContentTypeToggle = (contentTypeId: ContentTypeId) => {
    const newIds = currentContentTypeIds.includes(contentTypeId)
      ? currentContentTypeIds.filter((id) => id !== contentTypeId)
      : [...currentContentTypeIds, contentTypeId];

    updateSearchParams({
      contentTypeId: newIds.length > 0 ? newIds.join(",") : null,
      pageNo: null, // 페이지 리셋
    });
  };

  /**
   * 관광 타입 필터 전체 해제
   */
  const handleContentTypeClear = () => {
    updateSearchParams({
      contentTypeId: null,
      pageNo: null,
    });
  };

  /**
   * 반려동물 동반 가능 토글
   */
  const handlePetAllowedToggle = () => {
    updateSearchParams({
      petAllowed: currentPetAllowed ? null : "true",
      pageNo: null, // 페이지 리셋
    });
  };

  /**
   * 반려동물 크기 필터 변경
   */
  const handlePetSizeChange = (petSize: string) => {
    updateSearchParams({
      petSize: petSize === "" ? null : petSize,
      pageNo: null, // 페이지 리셋
    });
  };

  /**
   * 정렬 옵션 변경
   */
  const handleSortChange = (sort: "latest" | "name") => {
    updateSearchParams({
      sort: sort === "latest" ? null : sort, // 기본값이 latest이므로 null로 설정
    });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 md:space-y-6 md:p-6">
      {/* 지역 필터 */}
      <div>
        <label className="mb-2 block text-sm font-medium">지역</label>
        {isLoadingAreas ? (
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        ) : areaLoadError ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={currentAreaCode === "" ? "default" : "outline"}
                size="sm"
                onClick={() => handleAreaChange("")}
              >
                전체
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              지역 목록을 불러올 수 없습니다. 전체 옵션만 사용 가능합니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:overflow-x-visible md:pb-0">
            <Button
              variant={currentAreaCode === "" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAreaChange("")}
              className="min-h-[44px] min-w-[44px]"
            >
              전체
            </Button>
            {areaCodes.map((area) => (
              <Button
                key={area.code}
                variant={currentAreaCode === area.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleAreaChange(area.code)}
                className="min-h-[44px]"
              >
                {area.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* 관광 타입 필터 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">관광 타입</label>
          {currentContentTypeIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContentTypeClear}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              전체 해제
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:overflow-x-visible md:pb-0">
          {CONTENT_TYPE_OPTIONS.map((option) => {
            const isSelected = currentContentTypeIds.includes(option.id);
            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleContentTypeToggle(option.id)}
                className="min-h-[44px]"
              >
                {option.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 반려동물 동반 가능 필터 */}
      <div>
        <label className="mb-2 block text-sm font-medium">반려동물 동반</label>
        <div className="space-y-3">
          {/* 반려동물 동반 가능 토글 */}
          <div>
            <Button
              variant={currentPetAllowed ? "default" : "outline"}
              size="sm"
              onClick={handlePetAllowedToggle}
              className="gap-2"
            >
              <span>🐾</span>
              반려동물 동반 가능
            </Button>
          </div>

          {/* 반려동물 크기 필터 (반려동물 동반 가능이 선택된 경우에만 표시) */}
          {currentPetAllowed && (
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">크기별 필터</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={currentPetSize === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePetSizeChange("")}
                  className="min-h-[44px] min-w-[44px]"
                >
                  전체
                </Button>
                {PET_SIZE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentPetSize === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePetSizeChange(option.value)}
                    className="min-h-[44px]"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 정렬 옵션 */}
      <div>
        <label className="mb-2 block text-sm font-medium">정렬</label>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={currentSort === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange(option.value as "latest" | "name")}
              className="min-h-[44px] flex-1 md:flex-initial"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

