/**
 * @file error.tsx
 * @description 에러 바운더리 컴포넌트
 *
 * Next.js 15 App Router의 에러 바운더리 패턴을 사용하여
 * 특정 라우트 세그먼트에서 발생한 에러를 처리합니다.
 *
 * 주요 기능:
 * 1. 에러 타입별 메시지 분류 (TourApiError, 네트워크 에러, 일반 에러)
 * 2. 재시도 기능 (reset 함수 호출)
 * 3. 홈으로 돌아가기 버튼
 * 4. 개발 환경에서만 상세 에러 정보 표시
 *
 * @dependencies
 * - @/components/ui/error: Error 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/lib/utils/error-handler: getErrorMessage, shouldRetry, getErrorDetails
 * - next/link: Link 컴포넌트
 * - lucide-react: Home, RefreshCw 아이콘
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/ui/error";
import {
  getErrorMessage,
  shouldRetry,
  getErrorDetails,
} from "@/lib/utils/error-handler";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  // 개발 환경에서만 에러 로그 출력
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error);
    }
  }, [error]);

  const errorMessage = getErrorMessage(error);
  const canRetry = shouldRetry(error);
  const errorDetails = getErrorDetails(error);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Error
          message={errorMessage}
          onRetry={canRetry ? reset : undefined}
          retryText="다시 시도"
          size="large"
        />

        {/* 추가 액션 버튼 */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {canRetry && (
            <Button onClick={reset} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          )}
          <Button asChild variant="default" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>

        {/* 개발 환경에서만 상세 에러 정보 표시 */}
        {errorDetails && (
          <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <h3 className="mb-2 text-sm font-semibold text-destructive">
              개발자 정보 (개발 환경에서만 표시)
            </h3>
            <pre className="overflow-auto text-xs text-muted-foreground">
              {errorDetails}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

