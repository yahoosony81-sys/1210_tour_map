# 배포 체크리스트

> My Trip 프로젝트의 Vercel 배포 전/후 체크리스트

## 목차

1. [배포 전 체크리스트](#배포-전-체크리스트)
2. [Vercel 환경변수 확인](#vercel-환경변수-확인)
3. [빌드 테스트](#빌드-테스트)
4. [배포 후 검증](#배포-후-검증)
5. [문제 해결 가이드](#문제-해결-가이드)

---

## 배포 전 체크리스트

### 1. Git 준비

- [ ] `.gitignore` 확인 (`.env`, `.vercel` 등 제외 확인)
- [ ] 커밋할 파일 확인 (불필요한 파일 제외)
- [ ] 브랜치 확인 (main 또는 production 브랜치)
- [ ] 변경사항 확인 (`git status`)
- [ ] 최신 코드 확인 (`git pull`)

### 2. 코드 품질 확인

- [ ] TypeScript 타입 에러 없음 (`pnpm build` 실행)
- [ ] ESLint 에러 없음 (빌드 실패하는 경우)
- [ ] 환경변수 검증 통합 확인 (`app/layout.tsx`)

### 3. 의존성 확인

- [ ] `package.json`의 의존성 최신 상태
- [ ] `pnpm-lock.yaml` 최신 상태
- [ ] Node.js 버전 확인 (18+ 권장)

---

## Vercel 환경변수 확인

Vercel 대시보드 > Settings > Environment Variables에서 다음 환경변수를 확인하세요.

### 필수 환경변수

다음 환경변수들은 프로젝트가 정상 작동하기 위해 **반드시 필요**합니다:

| 환경변수 | 설명 | 확인 방법 |
|---------|------|----------|
| `NEXT_PUBLIC_TOUR_API_KEY` 또는 `TOUR_API_KEY` | 한국관광공사 API 키 | 둘 중 하나만 설정해도 됨 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | Clerk 대시보드 > API Keys |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 | Clerk 대시보드 > API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 대시보드 > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase 대시보드 > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Supabase 대시보드 > Settings > API |

### 선택 환경변수 (권장)

다음 환경변수들은 없어도 작동하지만, 일부 기능이 제한될 수 있습니다:

| 환경변수 | 설명 | 영향 |
|---------|------|------|
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 네이버 지도 클라이언트 ID | 지도 기능이 작동하지 않음 |
| `NEXT_PUBLIC_APP_URL` | 앱 기본 URL (프로덕션) | Open Graph 메타태그가 제대로 작동하지 않을 수 있음 |
| `NEXT_PUBLIC_STORAGE_BUCKET` | Supabase Storage 버킷 이름 | Storage 기능이 작동하지 않음 |

### 환경변수 설정 확인 방법

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. **Settings** > **Environment Variables** 메뉴로 이동
4. 각 환경변수가 다음 환경에 설정되어 있는지 확인:
   - **Production**: 프로덕션 환경
   - **Preview**: 프리뷰 환경 (선택 사항)
   - **Development**: 개발 환경 (선택 사항)

### 환경변수 추가 후 주의사항

- 환경변수를 추가한 후 **반드시 재배포**해야 적용됩니다
- Vercel 대시보드에서 "Redeploy" 버튼 클릭
- 또는 Git push를 통해 자동 재배포

---

## 빌드 테스트

배포 전에 로컬에서 빌드 테스트를 수행하세요.

### 1. 로컬 빌드 테스트

```bash
# 빌드 실행
pnpm build

# 예상 결과:
# - 빌드 성공 (에러 없음)
# - .next 디렉토리 생성 확인
# - 빌드 로그에서 환경변수 검증 메시지 확인
```

### 2. 환경변수 검증 테스트

`.env` 파일에 모든 필수 환경변수가 설정되어 있는지 확인:

- [ ] `NEXT_PUBLIC_TOUR_API_KEY` 또는 `TOUR_API_KEY`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 3. 프로덕션 빌드 검증

```bash
# 프로덕션 모드 빌드 (선택 사항)
NODE_ENV=production pnpm build
```

### 4. 빌드 에러 수정

빌드 중 에러가 발생한 경우:

- [ ] TypeScript 타입 에러 수정
- [ ] ESLint 에러 수정 (빌드 실패하는 경우)
- [ ] 환경변수 누락 에러 수정
- [ ] 의존성 문제 해결

---

## 배포 후 검증

배포가 완료된 후 다음 항목을 확인하세요.

### 1. 배포 상태 확인

- [ ] Vercel 대시보드 > **Deployments**에서 배포 상태 확인
  - 배포 상태: **Ready** (성공)
  - 빌드 로그 확인 (에러 없음)
- [ ] 배포 URL 확인 (프로덕션 도메인)
  - 예: `https://my-trip.vercel.app`

### 2. 주요 기능 테스트

#### 홈페이지 (`/`)

- [ ] 페이지 로딩 확인
- [ ] 관광지 목록 표시 확인
- [ ] 필터 기능 (지역, 타입) 확인
- [ ] 검색 기능 확인
- [ ] 지도 표시 확인 (네이버 지도 API 키 설정 시)

#### 상세페이지 (`/places/[contentId]`)

- [ ] 기본 정보 표시 확인
- [ ] 운영 정보 표시 확인
- [ ] 이미지 갤러리 확인
- [ ] 지도 표시 확인
- [ ] 북마크 기능 확인 (인증 필요)
- [ ] 공유 기능 확인

#### 통계 페이지 (`/stats`)

- [ ] 통계 요약 카드 표시 확인
- [ ] 지역별 분포 차트 (Bar Chart) 확인
- [ ] 타입별 분포 차트 (Donut Chart) 확인
- [ ] 차트 클릭 시 필터링된 목록 페이지로 이동 확인

#### 북마크 페이지 (`/bookmarks`)

- [ ] 로그인 필요 확인 (인증되지 않은 경우 리다이렉트)
- [ ] 북마크 목록 표시 확인
- [ ] 정렬 기능 확인
- [ ] 일괄 삭제 기능 확인

#### 인증 기능

- [ ] 로그인 기능 확인
- [ ] 로그아웃 기능 확인
- [ ] Clerk 연동 확인

### 3. 성능 확인

- [ ] 페이지 로딩 속도 확인 (초기 로딩 < 3초 목표)
- [ ] 이미지 최적화 확인 (Next.js Image 컴포넌트)
- [ ] API 응답 속도 확인
- [ ] 번들 크기 확인 (Vercel 대시보드)

### 4. 에러 모니터링

- [ ] Vercel 대시보드 > **Runtime Logs** 확인
  - 에러 로그 없음
  - 경고 로그 확인 (필요 시)
- [ ] 브라우저 콘솔 에러 확인
  - 개발자 도구 > Console 탭
  - 에러 없음 확인
- [ ] API 에러 확인
  - 네트워크 탭에서 API 호출 확인
  - 4xx, 5xx 에러 없음 확인
- [ ] 환경변수 누락 에러 확인
  - 빌드 로그에서 환경변수 검증 메시지 확인

### 5. SEO 및 메타태그 확인

- [ ] 메타태그 확인
  - 브라우저 개발자 도구 > Elements 탭
  - `<head>` 태그 내 메타태그 확인
- [ ] Open Graph 태그 확인
  - Facebook Debugger: https://developers.facebook.com/tools/debug/
  - 또는 유사 도구 사용
- [ ] Sitemap 접근 가능 여부 확인
  - `https://your-domain.vercel.app/sitemap.xml` 접근 확인
- [ ] Robots.txt 접근 가능 여부 확인
  - `https://your-domain.vercel.app/robots.txt` 접근 확인

---

## 문제 해결 가이드

### 빌드 실패 시

#### 환경변수 누락

**증상**: 빌드 로그에 "필수 환경변수가 누락되었습니다" 에러

**해결 방법**:
1. Vercel 대시보드 > Settings > Environment Variables 확인
2. 필수 환경변수가 모두 설정되어 있는지 확인
3. 환경변수 이름이 정확한지 확인 (대소문자 구분)
4. 재배포

#### TypeScript 에러

**증상**: 빌드 로그에 TypeScript 타입 에러

**해결 방법**:
1. 로컬에서 `pnpm build` 실행하여 에러 확인
2. 타입 에러 수정
3. Git push 후 재배포

#### 의존성 문제

**증상**: 빌드 로그에 패키지 설치 에러

**해결 방법**:
1. `package.json` 확인
2. `pnpm-lock.yaml` 확인
3. Vercel 대시보드에서 "Redeploy" 클릭

### 배포 후 에러 시

#### 환경변수 누락

**증상**: 런타임 에러, "API 키가 설정되지 않았습니다" 등

**해결 방법**:
1. Vercel 대시보드 > Settings > Environment Variables 확인
2. 필수 환경변수 추가
3. 재배포

#### API 키 문제

**증상**: API 호출 실패, 401/403 에러

**해결 방법**:
1. 각 서비스 대시보드에서 키 확인
   - 한국관광공사 API: https://www.data.go.kr/
   - Clerk: https://clerk.com/dashboard
   - Supabase: https://supabase.com/dashboard
2. 키가 올바른지 확인
3. 키가 만료되지 않았는지 확인
4. Vercel에 올바른 키가 설정되어 있는지 확인

#### CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러

**해결 방법**:
1. `next.config.ts`의 이미지 도메인 설정 확인
2. 외부 API의 CORS 설정 확인 (한국관광공사 API는 CORS 지원)

#### 지도가 표시되지 않음

**증상**: 네이버 지도가 로드되지 않음

**해결 방법**:
1. `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 환경변수 확인
2. 네이버 클라우드 플랫폼에서 서비스 활성화 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 성능 문제

#### 페이지 로딩이 느림

**해결 방법**:
1. Vercel 대시보드 > Analytics에서 성능 확인
2. 이미지 최적화 확인 (Next.js Image 컴포넌트 사용)
3. 번들 크기 확인 (`pnpm analyze`)
4. 불필요한 의존성 제거

#### API 응답이 느림

**해결 방법**:
1. 한국관광공사 API 응답 속도 확인
2. 캐싱 전략 확인 (`lib/api/tour-api.ts`)
3. 병렬 API 호출 최적화 확인

---

## 추가 리소스

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)
- [환경변수 설정 가이드](./ENV_SETUP.md)
- [프로젝트 README](../README.md)

---

**마지막 업데이트**: 2025-01-10

