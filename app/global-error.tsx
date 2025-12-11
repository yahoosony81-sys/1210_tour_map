/**
 * @file global-error.tsx
 * @description 루트 에러 바운더리 컴포넌트
 *
 * Next.js 15 App Router의 전역 에러 바운더리 패턴을 사용하여
 * 루트 레이아웃(app/layout.tsx)에서 발생한 에러를 처리합니다.
 *
 * 주요 기능:
 * 1. 루트 레이아웃 에러만 처리 (ClerkProvider, SyncUserProvider 등)
 * 2. html, body 태그 포함 (루트 레이아웃이 렌더링되지 않으므로)
 * 3. 최소한의 스타일링 (Tailwind CSS 기본 클래스)
 * 4. 개발 환경에서만 상세 에러 정보 표시
 *
 * 주의사항:
 * - global-error.tsx는 루트 레이아웃의 에러만 처리합니다
 * - 반드시 html, body 태그를 포함해야 합니다
 * - 최소한의 의존성만 사용해야 합니다 (ClerkProvider 등이 작동하지 않을 수 있음)
 *
 * @dependencies
 * - @/lib/utils/error-handler: getErrorMessage, getErrorDetails
 */

"use client";

import { useEffect } from "react";
import { getErrorMessage, getErrorDetails } from "@/lib/utils/error-handler";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // 개발 환경에서만 에러 로그 출력
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("GlobalError caught an error:", error);
    }
  }, [error]);

  const errorMessage = getErrorMessage(error);
  const errorDetails = getErrorDetails(error);

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <div className="mx-auto max-w-2xl text-center">
            {/* 에러 아이콘 및 메시지 */}
            <div className="mb-8">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <svg
                    className="h-8 w-8 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                오류가 발생했습니다
              </h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>

            {/* 재시도 버튼 */}
            <div className="mb-8">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                다시 시도
              </button>
            </div>

            {/* 개발 환경에서만 상세 에러 정보 표시 */}
            {errorDetails && (
              <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left">
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

            {/* 추가 안내 */}
            <div className="mt-8 text-sm text-muted-foreground">
              <p>
                문제가 지속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

