/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 조회 (getUserBookmarksList)
 * 2. 각 관광지 상세 정보 조회 (getDetailCommon)
 * 3. TourDetail을 TourItem으로 변환
 * 4. 정렬 옵션 적용
 * 5. TourList 컴포넌트로 표시
 *
 * @dependencies
 * - @/actions/bookmark-actions: getUserBookmarksList
 * - @/lib/api/tour-api: getDetailCommon
 * - @/lib/types/tour: TourItem, TourDetail
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 * - @/components/ui/skeleton: Skeleton UI
 */

import { getUserBookmarksList } from "@/actions/bookmark-actions";
import { getDetailCommon } from "@/lib/api/tour-api";
import type { TourItem, TourDetail } from "@/lib/types/tour";
import type { Bookmark } from "@/lib/api/supabase-api";
import { BookmarkListClient } from "@/components/bookmarks/bookmark-list-client";
import { ErrorDisplay } from "@/components/ui/error";

/**
 * TourDetail을 TourItem으로 변환
 * 북마크 목록에서 사용하기 위해 TourDetail을 TourItem 형태로 변환합니다.
 * @param detail - 관광지 상세 정보
 * @param bookmark - 북마크 정보 (created_at 포함)
 * @returns 관광지 목록 항목
 */
function convertDetailToItem(detail: TourDetail, bookmark: Bookmark): TourItem {
  // created_at을 modifiedtime 형식으로 변환 (YYYYMMDDHHmmss)
  const createdAt = new Date(bookmark.created_at);
  const modifiedtime = createdAt
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);

  return {
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: "", // getDetailCommon에는 areacode가 없으므로 빈 문자열 사용
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    modifiedtime,
  };
}

/**
 * 북마크 목록 정렬 함수
 * @param bookmarks - 북마크 목록
 * @param tours - 관광지 목록
 * @param sortOption - 정렬 옵션
 * @returns 정렬된 관광지 목록
 */
function sortBookmarkTours(
  bookmarks: Bookmark[],
  tours: TourItem[],
  sortOption: "latest" | "name" | "region" = "latest"
): TourItem[] {
  // 북마크와 관광지를 content_id로 매핑
  const tourMap = new Map(tours.map((t) => [t.contentid, t]));

  if (sortOption === "latest") {
    // 최신순: created_at 내림차순
    return bookmarks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((b) => tourMap.get(b.content_id))
      .filter((t): t is TourItem => t !== undefined);
  }

  if (sortOption === "name") {
    // 이름순: title 오름차순 (가나다순)
    return [...tours].sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  if (sortOption === "region") {
    // 지역별: areacode 오름차순 (현재는 빈 문자열이므로 의미 없음)
    return [...tours].sort((a, b) => a.areacode.localeCompare(b.areacode));
  }

  return tours;
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-lg font-medium text-muted-foreground">
        북마크한 관광지가 없습니다
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        관광지를 북마크하면 여기에 표시됩니다
      </p>
    </div>
  );
}

/**
 * 북마크 목록 컴포넌트
 * Server Component로 구현
 */
export async function BookmarkList({
  sortOption = "latest",
}: {
  sortOption?: "latest" | "name" | "region";
}) {
  try {
    // 북마크 목록 조회
    const bookmarks = await getUserBookmarksList();

    // 북마크가 없는 경우
    if (bookmarks.length === 0) {
      return <EmptyState />;
    }

    // 각 관광지 상세 정보 조회 (병렬 처리)
    const tourDetailsPromises = bookmarks.map((bookmark) =>
      getDetailCommon(bookmark.content_id).catch((error) => {
        console.error(`Failed to fetch detail for ${bookmark.content_id}:`, error);
        return null; // 일부 실패해도 계속 진행
      })
    );

    const tourDetailsResults = await Promise.all(tourDetailsPromises);

    // 성공한 관광지 정보만 필터링 및 변환
    const tourItems: TourItem[] = [];
    for (let i = 0; i < tourDetailsResults.length; i++) {
      const result = tourDetailsResults[i];
      if (result && result.length > 0) {
        const detail = result[0]; // getDetailCommon은 배열을 반환하지만 첫 번째 항목만 사용
        const bookmark = bookmarks[i];
        const tourItem = convertDetailToItem(detail, bookmark);
        tourItems.push(tourItem);
      }
    }

    // 관광지 정보가 없는 경우
    if (tourItems.length === 0) {
      return <EmptyState />;
    }

    // 정렬 적용
    const sortedTours = sortBookmarkTours(bookmarks, tourItems, sortOption);

    // BookmarkListClient 컴포넌트로 표시 (클라이언트 사이드 기능 포함)
    return <BookmarkListClient tours={sortedTours} />;
  } catch (error) {
    console.error("BookmarkList error:", error);

    // 에러 메시지 변환
    let errorMessage = "북마크 목록을 불러오는 중 오류가 발생했습니다.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return <ErrorDisplay message={errorMessage} />;
  }
}

