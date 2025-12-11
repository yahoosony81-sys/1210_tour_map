/**
 * @file not-found.tsx
 * @description 404 페이지 - 페이지를 찾을 수 없음
 *
 * Next.js 15 App Router의 not-found.tsx 파일입니다.
 * 존재하지 않는 페이지 접근 시 자동으로 렌더링됩니다.
 *
 * 주요 기능:
 * 1. 사용자 친화적인 404 메시지 표시
 * 2. 홈으로 돌아가기 버튼
 * 3. 검색 페이지로 이동 버튼
 * 4. 일관된 스타일링 (기존 페이지와 동일)
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - next/link: Link 컴포넌트
 * - lucide-react: FileQuestion, Home, Search 아이콘
 */

import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 페이지
 * Server Component로 구현
 */
export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <section className="flex flex-col items-center justify-center gap-6 text-center">
          {/* 404 아이콘 */}
          <div className="flex flex-col items-center gap-4">
            <FileQuestion
              className="h-16 w-16 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold md:text-4xl">
                404 - 페이지를 찾을 수 없습니다
              </h1>
              <p className="text-base text-muted-foreground md:text-lg">
                요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                <br className="hidden sm:block" />
                홈으로 돌아가거나 검색을 통해 원하는 관광지를 찾아보세요.
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="/" aria-label="홈으로 돌아가기">
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                홈으로 돌아가기
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/" aria-label="검색하기">
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                검색하기
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

