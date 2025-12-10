/**
 * @file share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * 클립보드 API를 사용하여 현재 페이지 URL을 복사하는 Client Component입니다.
 *
 * @dependencies
 * - react: useState
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/toast: toast 함수
 * - lucide-react: Share2, Check 아이콘
 */

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface ShareButtonProps {
  /** 공유할 URL (선택 사항, 없으면 현재 페이지 URL 사용) */
  url?: string;
  /** 버튼 크기 */
  size?: "sm" | "default" | "lg" | "icon";
  /** 버튼 variant */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 공유 버튼 컴포넌트
 * 현재 페이지 URL을 클립보드에 복사합니다.
 */
export function ShareButton({
  url,
  size = "default",
  variant = "outline",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      // URL 결정: prop으로 전달된 URL이 있으면 사용, 없으면 현재 페이지 URL 사용
      const urlToShare = url || (typeof window !== "undefined" ? window.location.href : "");

      if (!urlToShare) {
        toast.error("공유할 URL을 찾을 수 없습니다");
        return;
      }

      // 클립보드 API 사용 (HTTPS 환경 필수)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(urlToShare);
      } else {
        // Fallback: 구식 방법 (HTTPS가 아닌 경우)
        const textArea = document.createElement("textarea");
        textArea.value = urlToShare;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast.success("링크가 복사되었습니다");

      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("URL 복사 실패:", error);
      toast.error("링크 복사에 실패했습니다");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      aria-label={copied ? "링크 복사 완료" : "링크 공유"}
      aria-pressed={copied}
    >
      {copied ? (
        <>
          <Check className="size-4" aria-hidden="true" />
          <span className="ml-2 text-sm md:text-base">복사됨</span>
        </>
      ) : (
        <>
          <Share2 className="size-4" aria-hidden="true" />
          <span className="ml-2 text-sm md:text-base">공유</span>
        </>
      )}
    </Button>
  );
}

