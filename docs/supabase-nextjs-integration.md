# Supabase + Next.js 통합 가이드

이 문서는 Supabase 공식 Next.js 퀵스타트를 기반으로 작성되었으며, Clerk 통합을 유지하면서 최신 모범 사례를 따릅니다.

## 설치된 패키지

프로젝트에는 다음 Supabase 패키지가 설치되어 있습니다:

- `@supabase/supabase-js`: Supabase JavaScript 클라이언트
- `@supabase/ssr`: Next.js App Router용 SSR 지원 패키지 (공식 권장)

## 프로젝트 구조

```
lib/supabase/
├── server.ts          # Server Component용 클라이언트 (Clerk 통합)
├── clerk-client.ts    # Client Component용 클라이언트 (Clerk 통합)
├── client.ts          # 공개 데이터용 클라이언트 (인증 불필요)
└── service-role.ts    # 관리자 권한 클라이언트 (RLS 우회)
```

## 사용 방법

### Server Component에서 사용

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  return <div>{/* 데이터 표시 */}</div>;
}
```

### Client Component에서 사용

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  
  async function fetchData() {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    return data;
  }
  
  return <div>{/* 컴포넌트 내용 */}</div>;
}
```

### 공개 데이터 접근 (인증 불필요)

```tsx
'use client';

import { supabase } from '@/lib/supabase/client';

export default function PublicData() {
  // RLS 정책이 'to anon'인 데이터만 접근 가능
  const { data } = await supabase
    .from('public_table')
    .select('*');
  
  return <div>{/* 데이터 표시 */}</div>;
}
```

## 예제: Instruments 테이블

프로젝트에는 Supabase 공식 퀵스타트 예제인 `instruments` 페이지가 포함되어 있습니다.

### 1. 테이블 생성

Supabase Dashboard → SQL Editor에서 다음 SQL을 실행:

```sql
-- 테이블 생성
CREATE TABLE instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO instruments (name)
VALUES ('violin'), ('viola'), ('cello');

-- RLS 활성화
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 추가
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);
```

### 2. 페이지 접근

브라우저에서 `/instruments` 경로로 접근하면 데이터를 확인할 수 있습니다.

## 주요 변경 사항

### Supabase 공식 패턴 적용

1. **`@supabase/ssr` 패키지 사용**
   - Server Component: `createServerClient` 사용
   - Client Component: `createBrowserClient` 사용
   - Cookie 기반 세션 관리 지원

2. **함수 이름 통일**
   - Server Component: `createClient()` (공식 패턴)
   - 기존 `createClerkSupabaseClient()`는 하위 호환성을 위해 유지

3. **Clerk 통합 유지**
   - `accessToken` 옵션으로 Clerk 토큰 전달
   - 기존 Clerk 통합 기능 모두 유지

## 환경 변수

`.env` 파일에 다음 환경 변수가 필요합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **참고**: 공식 문서에서는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 사용하지만, 이 프로젝트는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용합니다. 둘 다 같은 값(anon key)을 가리킵니다.

## 참고 자료

- [Supabase Next.js 퀵스타트](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase SSR 패키지 문서](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md)

## 문제 해결

### "Invalid JWT" 에러

Clerk와 Supabase 통합이 제대로 설정되지 않았을 수 있습니다. [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md)를 참고하여 설정을 확인하세요.

### 데이터가 표시되지 않음

1. Supabase Dashboard에서 테이블이 생성되었는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 타입 에러

Supabase 타입을 생성하려면:

```bash
pnpm run gen:types
```

이 명령어는 `database.types.ts` 파일을 생성합니다.

