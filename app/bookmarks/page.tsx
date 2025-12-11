/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하고 관리할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. 북마크한 관광지 목록 표시
 * 2. 정렬 옵션 (최신순, 이름순, 지역별)
 * 3. 개별 삭제 기능
 * 4. 일괄 삭제 기능
 *
 * @dependencies
 * - @clerk/nextjs/server: auth (인증 확인)
 * - @/components/ui/error: Error 컴포넌트
 * - @/components/bookmarks/bookmark-list: BookmarkList 컴포넌트
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Error } from "@/components/ui/error";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { BookmarkSort } from "@/components/bookmarks/bookmark-sort";
import { getErrorMessage, shouldRetry } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

/**
 * 북마크 목록 페이지
 * Server Component로 구현하여 초기 로딩 최적화
 */
export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!userId) {
      redirect("/sign-in");
    }

    // 정렬 옵션 파싱
    const params = await searchParams;
    const sortOption = (params.sort as "latest" | "name" | "region") || "latest";

    return (
      <main className="container mx-auto px-4 py-4 md:px-4 md:py-8">
        {/* 제목 영역 */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">내 북마크</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            북마크한 관광지를 확인하고 관리하세요
          </p>
        </div>

        {/* 정렬 옵션 영역 */}
        <section className="mb-4 md:mb-6">
          <BookmarkSort />
        </section>

        {/* 북마크 목록 영역 */}
        <section>
          <BookmarkList sortOption={sortOption} />
        </section>
      </main>
    );
  } catch (error) {
    // 에러 처리 - getErrorMessage 유틸리티 사용
    const errorMessage = getErrorMessage(error);
    const canRetry = shouldRetry(error);

    return (
      <main className="container mx-auto px-4 py-8">
        <Error
          message={errorMessage}
          onRetry={canRetry ? () => window.location.reload() : undefined}
          retryText="다시 시도"
        />
      </main>
    );
  }
}

