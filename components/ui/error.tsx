/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * 에러 상황을 표시하는 재사용 가능한 컴포넌트입니다.
 * 재시도 기능을 포함할 수 있습니다.
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  /** 에러 메시지 */
  message: string;
  /** 재시도 함수 (선택 사항) */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryText?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 크기 옵션 */
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

export function Error({
  message,
  onRetry,
  retryText = "재시도",
  className,
  size = "medium",
}: ErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className={cn("text-muted-foreground", sizeClasses[size])}>
          {message}
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryText}
        </Button>
      )}
    </div>
  );
}

