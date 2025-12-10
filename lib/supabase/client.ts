import { createBrowserClient } from "@supabase/ssr";

/**
 * 공개 데이터용 Supabase 클라이언트 (인증 불필요)
 *
 * 인증이 필요 없는 공개 데이터에 접근할 때 사용합니다.
 * RLS 정책이 `to anon`인 데이터만 접근 가능합니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { supabase } from '@/lib/supabase/client';
 *
 * export default function PublicData() {
 *   const { data } = await supabase.from('public_table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
