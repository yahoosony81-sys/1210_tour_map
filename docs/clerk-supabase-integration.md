# Clerk + Supabase 통합 가이드

이 문서는 2025년 최신 모범 사례를 기반으로 Clerk와 Supabase를 통합하는 방법을 안내합니다.

> **중요**: 2025년 4월 1일부터 Clerk의 JWT 템플릿 방식은 deprecated되었습니다. 이제 **네이티브 Supabase 통합**을 사용해야 합니다.

## 통합의 장점

네이티브 통합 방식의 주요 장점:

- ✅ **JWT 템플릿 불필요**: Clerk Dashboard에서 JWT 템플릿을 설정할 필요가 없습니다
- ✅ **토큰 자동 갱신**: 각 Supabase 요청마다 새 토큰을 가져올 필요가 없습니다
- ✅ **보안 강화**: Supabase JWT Secret Key를 Clerk와 공유할 필요가 없습니다
- ✅ **간편한 설정**: Clerk Dashboard에서 한 번만 설정하면 됩니다

## 1단계: Clerk Dashboard에서 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **"Integrations"** 클릭
4. **"Supabase"** 카드 찾기
5. **"Activate Supabase integration"** 버튼 클릭
6. 설정 옵션 선택 후 **"Activate"** 클릭
7. **Clerk Domain**이 표시됩니다 (예: `https://your-app-12.clerk.accounts.dev`)
   - 이 도메인을 복사해두세요 (다음 단계에서 사용)

> **참고**: Clerk Dashboard의 Supabase 통합 페이지는 [여기](https://dashboard.clerk.com/setup/supabase)에서 직접 접근할 수 있습니다.

## 2단계: Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 추가

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **"Authentication"** 클릭
4. **"Sign In / Up"** 탭 선택
5. 페이지 하단으로 스크롤하여 **"Third-Party Auth"** 섹션 찾기
6. **"Add provider"** 버튼 클릭
7. 드롭다운에서 **"Clerk"** 선택
8. **"Clerk domain"** 필드에 1단계에서 복사한 Clerk Domain 입력
   - 예: `https://your-app-12.clerk.accounts.dev`
   - 또는 도메인만 입력: `your-app-12.clerk.accounts.dev`
9. **"Add provider"** 버튼 클릭하여 저장

> **참고**: Supabase는 자동으로 Clerk의 JWKS 엔드포인트(`/.well-known/jwks.json`)를 찾아서 설정합니다.

## 3단계: 환경 변수 확인

프로젝트의 `.env` 파일에 다음 환경 변수가 설정되어 있는지 확인하세요:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **중요**: `NEXT_PUBLIC_` 접두사는 클라이언트 사이드에서 사용되는 환경 변수에 필수입니다.

## 4단계: 코드에서 사용하기

### 클라이언트 컴포넌트에서 사용

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    return data;
  }

  return (
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

### 서버 컴포넌트에서 사용

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  return (
    <div>
      {data?.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Action에서 사용

```ts
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function addTask(name: string) {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });
  
  if (error) {
    throw new Error(`Failed to add task: ${error.message}`);
  }
  
  return data;
}
```

## 5단계: Row Level Security (RLS) 정책 설정

Clerk와 Supabase를 통합할 때는 RLS 정책에서 Clerk 사용자 ID를 사용해야 합니다.

### Clerk 사용자 ID 추출

Supabase에서 Clerk JWT의 `sub` 클레임을 사용하여 사용자 ID를 추출할 수 있습니다:

```sql
-- Clerk 사용자 ID는 auth.jwt()->>'sub'로 접근 가능
SELECT auth.jwt()->>'sub' AS clerk_user_id;
```

### RLS 정책 예시

```sql
-- 예시: tasks 테이블에 대한 RLS 정책

-- 사용자는 자신의 작업만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 사용자는 자신의 작업만 생성 가능
CREATE POLICY "Users can insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 사용자는 자신의 작업만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 사용자는 자신의 작업만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
);
```

### 테이블 생성 예시

```sql
-- tasks 테이블 생성 (Clerk user_id 포함)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

> **참고**: 개발 환경에서는 RLS를 비활성화할 수 있지만, 프로덕션에서는 반드시 활성화하고 적절한 정책을 설정해야 합니다.

## 통합 확인 방법

### 1. Clerk 세션 토큰 확인

브라우저 개발자 도구의 Console에서 다음을 실행:

```javascript
// Clerk 세션 토큰 확인 (클라이언트 사이드)
const session = await window.Clerk?.session;
const token = await session?.getToken();
console.log('Clerk Token:', token);
```

### 2. Supabase에서 인증 상태 확인

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useEffect } from 'react';

export default function TestAuth() {
  const supabase = useClerkSupabaseClient();
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Supabase User:', user);
      console.log('Error:', error);
    }
    
    checkAuth();
  }, [supabase]);
  
  return <div>Check console for auth status</div>;
}
```

### 3. 데이터베이스 쿼리 테스트

로그인한 상태에서 데이터를 조회/생성해보세요:

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useState } from 'react';

export default function TestQuery() {
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState([]);
  
  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }
    
    setTasks(data || []);
  }
  
  async function createTask() {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ name: 'Test Task' });
    
    if (error) {
      console.error('Error creating task:', error);
      return;
    }
    
    console.log('Task created:', data);
    loadTasks();
  }
  
  return (
    <div>
      <button onClick={loadTasks}>Load Tasks</button>
      <button onClick={createTask}>Create Task</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 문제 해결

### 문제: "Invalid JWT" 에러

**원인**: Clerk와 Supabase 통합이 제대로 설정되지 않았습니다.

**해결 방법**:
1. Clerk Dashboard에서 Supabase 통합이 활성화되어 있는지 확인
2. Supabase Dashboard에서 Clerk provider가 추가되어 있는지 확인
3. Clerk Domain이 정확히 입력되었는지 확인

### 문제: RLS 정책으로 인한 접근 거부

**원인**: RLS 정책이 올바르게 설정되지 않았거나, `user_id`가 Clerk ID와 일치하지 않습니다.

**해결 방법**:
1. RLS 정책에서 `auth.jwt()->>'sub'`를 사용하는지 확인
2. 테이블의 `user_id` 컬럼이 TEXT 타입인지 확인
3. 개발 환경에서는 임시로 RLS를 비활성화하여 테스트

### 문제: 토큰이 null인 경우

**원인**: 사용자가 로그인하지 않았거나, Clerk 세션이 만료되었습니다.

**해결 방법**:
1. 사용자가 로그인되어 있는지 확인
2. `useAuth().isSignedIn` 또는 `useSession()`으로 세션 상태 확인
3. 로그인 페이지로 리다이렉트

## 참고 자료

- [Clerk 공식 Supabase 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

## 요약

1. ✅ Clerk Dashboard에서 Supabase 통합 활성화
2. ✅ Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 추가
3. ✅ 환경 변수 확인
4. ✅ 코드에서 `useClerkSupabaseClient()` 또는 `createClerkSupabaseClient()` 사용
5. ✅ RLS 정책에서 `auth.jwt()->>'sub'`로 Clerk 사용자 ID 확인

이제 Clerk와 Supabase가 완전히 통합되었습니다! 🎉

