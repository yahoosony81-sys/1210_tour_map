/**
 * @file bookmark-actions.ts
 * @description 북마크 기능을 위한 Server Actions
 *
 * 클라이언트에서 호출할 북마크 관련 Server Actions를 제공합니다.
 *
 * 주요 기능:
 * 1. 북마크 상태 확인 (checkBookmark)
 * 2. 북마크 추가/제거 토글 (toggleBookmark)
 * 3. 사용자 북마크 목록 조회 (getUserBookmarks)
 *
 * @dependencies
 * - @clerk/nextjs/server: auth (Clerk 인증 확인)
 * - @/lib/api/supabase-api: Supabase 쿼리 함수들
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getSupabaseUserId,
  getBookmark,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  type Bookmark,
} from "@/lib/api/supabase-api";

/**
 * 북마크 상태 확인
 * @param contentId - 한국관광공사 API contentid (예: "125266")
 * @returns 북마크 상태 (true: 북마크됨, false: 북마크 안됨, null: 인증되지 않음)
 */
export async function checkBookmark(
  contentId: string
): Promise<boolean | null> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      // 인증되지 않은 경우 null 반환
      return null;
    }

    // Supabase user_id 조회
    const supabaseUserId = await getSupabaseUserId(userId);

    if (!supabaseUserId) {
      // Supabase에 사용자가 없는 경우 (SyncUserProvider가 자동 동기화하지만, 혹시 모를 경우)
      console.warn("Supabase user not found for Clerk ID:", userId);
      return null;
    }

    // 북마크 조회
    const bookmark = await getBookmark(supabaseUserId, contentId);

    return bookmark !== null;
  } catch (error) {
    console.error("checkBookmark error:", error);
    // 에러 발생 시 null 반환 (인증되지 않은 것으로 처리)
    return null;
  }
}

/**
 * 북마크 추가/제거 토글
 * @param contentId - 한국관광공사 API contentid (예: "125266")
 * @returns 새로운 북마크 상태 (true: 북마크됨, false: 북마크 안됨)
 * @throws 인증되지 않은 경우 에러 throw
 */
export async function toggleBookmark(
  contentId: string
): Promise<boolean> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }

    // Supabase user_id 조회
    const supabaseUserId = await getSupabaseUserId(userId);

    if (!supabaseUserId) {
      // Supabase에 사용자가 없는 경우
      // SyncUserProvider가 자동 동기화하지만, 혹시 모를 경우를 대비
      throw new Error("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
    }

    // 현재 북마크 상태 확인
    const bookmark = await getBookmark(supabaseUserId, contentId);

    if (bookmark) {
      // 북마크가 있으면 제거
      await removeBookmark(supabaseUserId, contentId);
      return false;
    } else {
      // 북마크가 없으면 추가
      await addBookmark(supabaseUserId, contentId);
      return true;
    }
  } catch (error) {
    console.error("toggleBookmark error:", error);
    
    // 사용자 친화적 에러 메시지로 변환
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("북마크 처리 중 오류가 발생했습니다.");
  }
}

/**
 * 사용자의 북마크 목록 조회
 * @returns 북마크 배열 (created_at 내림차순 정렬)
 */
export async function getUserBookmarksList(): Promise<Bookmark[]> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      // 인증되지 않은 경우 빈 배열 반환
      return [];
    }

    // Supabase user_id 조회
    const supabaseUserId = await getSupabaseUserId(userId);

    if (!supabaseUserId) {
      // Supabase에 사용자가 없는 경우 빈 배열 반환
      return [];
    }

    // 북마크 목록 조회
    const bookmarks = await getUserBookmarks(supabaseUserId);

    return bookmarks;
  } catch (error) {
    console.error("getUserBookmarksList error:", error);
    // 에러 발생 시 빈 배열 반환
    return [];
  }
}

