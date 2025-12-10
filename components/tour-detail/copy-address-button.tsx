/**
 * @file copy-address-button.tsx
 * @description 주소 복사 버튼 컴포넌트
 *
 * 클립보드 API를 사용하여 주소를 복사하는 Client Component입니다.
 *
 * @dependencies
 * - react: useState
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/toast: toast 함수
 * - lucide-react: Copy, Check 아이콘
 */

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface CopyAddressButtonProps {
  /** 복사할 주소 텍스트 */
  address: string;
  /** 버튼 크기 */
  size?: "sm" | "default" | "lg" | "icon";
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 주소 복사 버튼 컴포넌트
 */
export function CopyAddressButton({
  address,
  size = "sm",
  className,
}: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // 클립보드 API 사용 (HTTPS 환경 필수)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
      } else {
        // Fallback: 구식 방법 (HTTPS가 아닌 경우)
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast.success("주소가 복사되었습니다");

      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("주소 복사 실패:", error);
      toast.error("주소 복사에 실패했습니다");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleCopy}
      className={className}
      aria-label={copied ? "복사 완료" : "주소 복사"}
    >
      {copied ? (
        <>
          <Check className="size-4" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <Copy className="size-4" />
          <span>복사</span>
        </>
      )}
    </Button>
  );
}

