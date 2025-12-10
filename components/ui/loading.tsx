/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 재사용 가능한 로딩 스피너 컴포넌트입니다.
 * 다양한 크기와 옵션을 지원합니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /** 크기 옵션 */
  size?: "small" | "medium" | "large";
  /** 색상 옵션 */
  variant?: "primary" | "secondary" | "muted";
  /** 표시할 텍스트 (선택 사항) */
  text?: string;
  /** 추가 클래스명 */
  className?: string;
}

const sizeClasses = {
  small: "h-4 w-4",
  medium: "h-6 w-6",
  large: "h-8 w-8",
};

const variantClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-muted-foreground",
};

export function Loading({
  size = "medium",
  variant = "primary",
  text,
  className,
}: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

