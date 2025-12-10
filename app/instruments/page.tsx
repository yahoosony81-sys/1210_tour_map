import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Instruments 데이터를 가져오는 Server Component
 * 
 * Supabase 공식 Next.js 퀵스타트 예제를 기반으로 작성되었습니다.
 * Clerk 통합을 통해 인증된 사용자의 데이터에 접근할 수 있습니다.
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    console.error("Error fetching instruments:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          데이터가 없습니다. Supabase Dashboard에서 instruments 테이블을 생성하고
          데이터를 추가해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">악기 목록</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: { id: number; name: string }) => (
          <li
            key={instrument.id}
            className="p-3 bg-white border rounded-lg hover:bg-gray-50"
          >
            {instrument.name}
          </li>
        ))}
      </ul>
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          원시 데이터 보기 (JSON)
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto text-xs">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </details>
    </div>
  );
}

/**
 * Instruments 페이지
 * 
 * Supabase에서 instruments 테이블의 데이터를 조회하여 표시합니다.
 * 
 * 테이블 생성 방법:
 * 1. Supabase Dashboard → SQL Editor에서 다음 SQL 실행:
 * 
 * ```sql
 * CREATE TABLE instruments (
 *   id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
 *   name TEXT NOT NULL
 * );
 * 
 * INSERT INTO instruments (name)
 * VALUES ('violin'), ('viola'), ('cello');
 * 
 * ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "public can read instruments"
 * ON public.instruments
 * FOR SELECT
 * TO anon
 * USING (true);
 * ```
 */
export default function Instruments() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Instruments</h1>
        <p className="text-gray-600">
          Supabase에서 가져온 악기 목록입니다. 이 페이지는 Supabase 공식 Next.js
          퀵스타트 예제를 기반으로 작성되었습니다.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center">
            <p className="text-gray-600">악기 목록을 불러오는 중...</p>
          </div>
        }
      >
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

