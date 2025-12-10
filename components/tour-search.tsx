/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색할 수 있는 검색창 컴포넌트입니다.
 * URL 쿼리 파라미터로 검색 키워드를 관리합니다.
 *
 * 주요 기능:
 * 1. 검색 키워드 입력
 * 2. 엔터 키 또는 검색 버튼 클릭으로 검색 실행
 * 3. 검색 중 로딩 스피너 표시
 * 4. 검색어 초기화 버튼 (X 버튼)
 * 5. URL 쿼리 파라미터로 상태 관리
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/loading: Loading 컴포넌트
 * - lucide-react: Search, X, Loader2 아이콘
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

interface TourSearchProps {
  /** 추가 클래스명 */
  className?: string;
  /** 검색창 플레이스홀더 */
  placeholder?: string;
}

/**
 * 관광지 검색 컴포넌트
 */
export function TourSearch({ className, placeholder = "관광지명, 주소, 설명으로 검색..." }: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL에서 현재 검색 키워드 읽기
  useEffect(() => {
    const currentKeyword = searchParams.get("keyword") || "";
    setKeyword(currentKeyword);
  }, [searchParams]);

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

    // pageNo 리셋 (검색 시 첫 페이지로)
    params.delete("pageNo");

    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  /**
   * 검색 실행
   */
  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword === "") {
      // 검색어가 비어있으면 검색 파라미터 제거
      updateSearchParams({ keyword: null });
      return;
    }

    setIsSearching(true);
    updateSearchParams({ keyword: trimmedKeyword });

    // 로딩 상태 해제 (URL 업데이트 후 페이지가 리렌더링되므로 자동으로 해제됨)
    // 하지만 즉시 피드백을 위해 짧은 딜레이 후 해제
    setTimeout(() => {
      setIsSearching(false);
    }, 100);
  };

  /**
   * 검색어 초기화
   */
  const handleClear = () => {
    setKeyword("");
    updateSearchParams({ keyword: null });
    inputRef.current?.focus();
  };

  /**
   * 엔터 키 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex gap-2">
        {/* 검색 아이콘 (왼쪽) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* 검색 입력 필드 */}
        <Input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9"
          disabled={isSearching}
          aria-label="검색어 입력"
        />

        {/* 검색어 초기화 버튼 (X) */}
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색어 초기화"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* 검색 버튼 */}
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="shrink-0"
          aria-label="검색 실행"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">검색 중...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">검색</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

