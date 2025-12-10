/**
 * @file supabase-api.ts
 * @description Supabase 데이터베이스 쿼리 함수들
 *
 * 북마크 기능을 위한 Supabase 쿼리 함수들을 제공합니다.
 * Server Actions에서 사용하기 위한 함수들입니다.
 *
 * 주요 기능:
 * 1. Clerk ID로 Supabase user_id 조회
 * 2. 북마크 조회/추가/제거
 * 3. 사용자 북마크 목록 조회
 *
 * @dependencies
 * - @/lib/supabase/server: createClient (Server Component/Server Action용)
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Clerk ID로 Supabase users 테이블에서 user_id 조회
 * @param clerkId - Clerk User ID (예: "user_2abc...")
 * @returns Supabase user_id (UUID) 또는 null (사용자가 없을 경우)
 */
export async function getSupabaseUserId(
  clerkId: string
): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      // 사용자가 없는 경우 (PGRST116: no rows returned)
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Failed to get Supabase user ID:", error);
      throw new Error(`사용자 조회 실패: ${error.message}`);
    }

    return data?.id || null;
  } catch (error) {
    console.error("getSupabaseUserId error:", error);
    throw error;
  }
}

/**
 * 북마크 타입 정의
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * 특정 관광지 북마크 조회
 * @param userId - Supabase user_id (UUID)
 * @param contentId - 한국관광공사 API contentid (예: "125266")
 * @returns 북마크 객체 또는 null (북마크가 없을 경우)
 */
export async function getBookmark(
  userId: string,
  contentId: string
): Promise<Bookmark | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .single();

    if (error) {
      // 북마크가 없는 경우 (PGRST116: no rows returned)
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Failed to get bookmark:", error);
      throw new Error(`북마크 조회 실패: ${error.message}`);
    }

    return data as Bookmark;
  } catch (error) {
    console.error("getBookmark error:", error);
    throw error;
  }
}

/**
 * 북마크 추가
 * @param userId - Supabase user_id (UUID)
 * @param contentId - 한국관광공사 API contentid (예: "125266")
 * @returns 추가된 북마크 객체
 */
export async function addBookmark(
  userId: string,
  contentId: string
): Promise<Bookmark> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      // 중복 북마크 시도 (UNIQUE 제약 위반)
      if (error.code === "23505") {
        throw new Error("이미 북마크된 관광지입니다.");
      }
      console.error("Failed to add bookmark:", error);
      throw new Error(`북마크 추가 실패: ${error.message}`);
    }

    return data as Bookmark;
  } catch (error) {
    console.error("addBookmark error:", error);
    throw error;
  }
}

/**
 * 북마크 제거
 * @param userId - Supabase user_id (UUID)
 * @param contentId - 한국관광공사 API contentid (예: "125266")
 * @returns 성공 시 true
 */
export async function removeBookmark(
  userId: string,
  contentId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId);

    if (error) {
      console.error("Failed to remove bookmark:", error);
      throw new Error(`북마크 제거 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("removeBookmark error:", error);
    throw error;
  }
}

/**
 * 사용자의 모든 북마크 목록 조회
 * @param userId - Supabase user_id (UUID)
 * @returns 북마크 배열 (created_at 내림차순 정렬)
 */
export async function getUserBookmarks(
  userId: string
): Promise<Bookmark[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get user bookmarks:", error);
      throw new Error(`북마크 목록 조회 실패: ${error.message}`);
    }

    return (data || []) as Bookmark[];
  } catch (error) {
    console.error("getUserBookmarks error:", error);
    throw error;
  }
}

