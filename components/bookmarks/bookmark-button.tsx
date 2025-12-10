/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크할 수 있는 버튼 컴포넌트입니다.
 * Clerk 인증과 Supabase를 연동하여 북마크 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 북마크 상태 확인 및 표시
 * 2. 북마크 추가/제거 토글
 * 3. 로그인하지 않은 경우 로그인 유도
 *
 * @dependencies
 * - react: useState, useEffect
 * - @clerk/nextjs: useAuth, useClerk
 * - @/actions/bookmark-actions: checkBookmark, toggleBookmark
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/toast: toast 함수
 * - lucide-react: Star, Loader2 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { checkBookmark, toggleBookmark } from "@/actions/bookmark-actions";

interface BookmarkButtonProps {
  /** 관광지 ID (한국관광공사 API contentid) */
  contentId: string;
  /** 버튼 크기 */
  size?: "sm" | "default" | "lg" | "icon";
  /** 버튼 variant */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 버튼 컴포넌트
 * 관광지를 북마크할 수 있는 버튼입니다.
 */
export function BookmarkButton({
  contentId,
  size = "default",
  variant = "outline",
  className,
}: BookmarkButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { redirectToSignIn } = useClerk();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  // 초기 북마크 상태 로드
  useEffect(() => {
    const loadBookmarkStatus = async () => {
      if (!isLoaded) {
        return;
      }

      setIsLoading(true);

      try {
        const status = await checkBookmark(contentId);
        
        if (status === null) {
          // 인증되지 않은 경우
          setIsBookmarked(false);
        } else {
          setIsBookmarked(status);
        }
      } catch (error) {
        console.error("북마크 상태 확인 실패:", error);
        setIsBookmarked(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarkStatus();
  }, [contentId, isLoaded]);

  // 북마크 토글 핸들러
  const handleToggle = async () => {
    // 로그인하지 않은 경우 로그인 유도
    if (!isSignedIn) {
      toast.error("북마크 기능을 사용하려면 로그인이 필요합니다");
      // 로그인 페이지로 리다이렉트
      if (redirectToSignIn) {
        redirectToSignIn();
      }
      return;
    }

    setIsToggling(true);

    try {
      const newStatus = await toggleBookmark(contentId);
      setIsBookmarked(newStatus);

      if (newStatus) {
        toast.success("북마크에 추가되었습니다");
      } else {
        toast.success("북마크에서 제거되었습니다");
      }
    } catch (error) {
      console.error("북마크 토글 실패:", error);
      
      // 사용자 친화적 에러 메시지
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("북마크 처리 중 오류가 발생했습니다");
      }
    } finally {
      setIsToggling(false);
    }
  };

  // 로딩 중이거나 토글 중인 경우 스피너 표시
  if (isLoading || isToggling) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled
        className={className}
        aria-label="북마크 처리 중"
        aria-busy="true"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {size !== "icon" && <span className="ml-2 text-sm md:text-base">처리 중...</span>}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={className}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
      aria-pressed={isBookmarked}
    >
      <Star
        className={`size-4 ${isBookmarked ? "fill-yellow-400 text-yellow-400" : ""}`}
        aria-hidden="true"
      />
      {size !== "icon" && (
        <span className="ml-2 text-sm md:text-base">
          {isBookmarked ? "북마크됨" : "북마크"}
        </span>
      )}
    </Button>
  );
}

