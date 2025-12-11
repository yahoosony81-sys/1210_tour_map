# 환경변수 설정 가이드

> My Trip 프로젝트의 환경변수 설정 및 관리 가이드

## 목차

1. [개요](#개요)
2. [필수 환경변수 목록](#필수-환경변수-목록)
3. [환경변수별 상세 설명](#환경변수별-상세-설명)
4. [Vercel 배포 시 설정 방법](#vercel-배포-시-설정-방법)
5. [보안 주의사항](#보안-주의사항)
6. [문제 해결 (FAQ)](#문제-해결-faq)

---

## 개요

이 프로젝트는 여러 외부 서비스(한국관광공사 API, 네이버 지도, Clerk, Supabase)를 사용하므로, 각 서비스의 인증 키를 환경변수로 관리해야 합니다.

### 환경변수 종류

- **필수 환경변수**: 프로젝트가 정상 작동하기 위해 반드시 필요한 환경변수
- **선택 환경변수**: 없어도 작동하지만, 일부 기능이 제한될 수 있는 환경변수

### 환경변수 접두사

- `NEXT_PUBLIC_`: 클라이언트와 서버 모두에서 사용 가능 (브라우저에 노출됨)
- 접두사 없음: 서버 전용 (클라이언트 번들에 포함되지 않음)

---

## 필수 환경변수 목록

다음 환경변수들은 프로젝트가 정상 작동하기 위해 반드시 필요합니다:

| 환경변수 | 설명 | 서버 전용 |
|---------|------|----------|
| `NEXT_PUBLIC_TOUR_API_KEY` 또는 `TOUR_API_KEY` | 한국관광공사 API 키 | `TOUR_API_KEY`만 서버 전용 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | ❌ |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ❌ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | ✅ |

### 선택 환경변수 목록

다음 환경변수들은 없어도 작동하지만, 일부 기능이 제한될 수 있습니다:

| 환경변수 | 설명 | 영향 |
|---------|------|------|
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 네이버 지도 클라이언트 ID | 지도 기능이 작동하지 않음 |
| `NEXT_PUBLIC_STORAGE_BUCKET` | Supabase Storage 버킷 이름 | Storage 기능이 작동하지 않음 |
| `NEXT_PUBLIC_APP_URL` | 앱 기본 URL | Open Graph 메타태그가 제대로 작동하지 않을 수 있음 |

---

## 환경변수별 상세 설명

### 한국관광공사 API

#### `NEXT_PUBLIC_TOUR_API_KEY` 또는 `TOUR_API_KEY`

**설명**: 한국관광공사 공공 API 인증 키

**필수 여부**: ✅ 필수 (둘 중 하나)

**사용 위치**: 
- `lib/api/tour-api.ts`
- `lib/api/stats-api.ts`
- `actions/tour-actions.ts`

**발급 방법**:
1. https://www.data.go.kr/ 접속
2. "한국관광공사" 검색
3. "한국관광공사_국문 관광정보 서비스" 선택
4. 활용신청 후 인증키 발급

**주의사항**:
- `NEXT_PUBLIC_TOUR_API_KEY`: 클라이언트/서버 모두에서 사용 가능
- `TOUR_API_KEY`: 서버 전용 (대체용, `NEXT_PUBLIC_TOUR_API_KEY`가 없을 때 사용)

---

### 네이버 지도 API

#### `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`

**설명**: 네이버 클라우드 플랫폼(NCP) Maps API 클라이언트 ID

**필수 여부**: ❌ 선택 (지도 기능 사용 시 필수)

**사용 위치**:
- `components/naver-map.tsx`
- `components/tour-detail/detail-map.tsx`

**발급 방법**:
1. https://www.ncloud.com/ 접속
2. 네이버 클라우드 플랫폼 회원가입 (신용카드 등록 필요)
3. AI·NAVER API > Maps > Web Dynamic Map 서비스 활성화
4. Application 등록 후 Client ID 발급

**주의사항**:
- 월 10,000,000건 무료 제공
- 신용카드 등록 필수
- `ncpKeyId` 파라미터로 사용 (구 `ncpClientId` 아님)

---

### Clerk 인증

#### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**설명**: Clerk 공개 키 (인증 기능)

**필수 여부**: ✅ 필수

**사용 위치**:
- `app/layout.tsx` (ClerkProvider)

**발급 방법**:
1. https://clerk.com/ 접속
2. 회원가입 및 프로젝트 생성
3. API Keys 페이지에서 Publishable Key 확인

**형식**: `pk_test_...` (테스트) 또는 `pk_live_...` (프로덕션)

---

#### `CLERK_SECRET_KEY`

**설명**: Clerk 비밀 키 (서버 전용)

**필수 여부**: ✅ 필수

**사용 위치**:
- `middleware.ts`
- `app/api/sync-user/route.ts`

**발급 방법**:
1. Clerk 대시보드 > API Keys 페이지
2. Secret Key 확인

**주의사항**:
- ⚠️ **서버 전용**: 클라이언트에 노출되면 안됩니다
- `NEXT_PUBLIC_` 접두사가 없습니다
- 프로덕션에서는 `sk_live_...` 형식 사용

---

### Supabase

#### `NEXT_PUBLIC_SUPABASE_URL`

**설명**: Supabase 프로젝트 URL

**필수 여부**: ✅ 필수

**사용 위치**:
- `lib/supabase/*.ts`

**발급 방법**:
1. https://supabase.com/ 접속
2. 회원가입 및 프로젝트 생성
3. Settings > API 페이지에서 Project URL 확인

**형식**: `https://your-project-id.supabase.co`

---

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**설명**: Supabase Anon Key (공개 키)

**필수 여부**: ✅ 필수

**사용 위치**:
- `lib/supabase/*.ts`

**발급 방법**:
1. Supabase 대시보드 > Settings > API
2. anon public key 확인

**주의사항**:
- 클라이언트에 노출되어도 안전합니다 (RLS 정책으로 보호)
- Row Level Security (RLS) 정책이 활성화되어 있어야 합니다

---

#### `SUPABASE_SERVICE_ROLE_KEY`

**설명**: Supabase Service Role Key (관리자 권한)

**필수 여부**: ✅ 필수

**사용 위치**:
- `lib/supabase/service-role.ts`

**발급 방법**:
1. Supabase 대시보드 > Settings > API
2. service_role key 확인

**주의사항**:
- ⚠️ **서버 전용**: 클라이언트에 노출되면 안됩니다
- `NEXT_PUBLIC_` 접두사가 없습니다
- RLS를 우회하여 모든 데이터에 접근할 수 있습니다
- 절대 클라이언트 코드에 포함하지 마세요

---

#### `NEXT_PUBLIC_STORAGE_BUCKET`

**설명**: Supabase Storage 버킷 이름

**필수 여부**: ❌ 선택 (Storage 기능 사용 시 필수)

**기본값**: `uploads`

**사용 위치**:
- `lib/supabase/*.ts` (Storage 기능 사용 시)

**설정 방법**:
1. Supabase 대시보드 > Storage
2. 버킷 생성 또는 기존 버킷 이름 확인

---

### 앱 설정

#### `NEXT_PUBLIC_APP_URL`

**설명**: 앱 기본 URL (프로덕션 권장)

**필수 여부**: ❌ 선택 (프로덕션 권장)

**사용 위치**:
- `app/layout.tsx` (메타데이터)
- `lib/utils/url.ts` (절대 URL 생성)

**설정 예시**:
- 개발: `http://localhost:3000` (기본값)
- 프로덕션: `https://my-trip.vercel.app`

**주의사항**:
- 프로덕션 환경에서는 반드시 설정하는 것을 권장합니다
- Open Graph 메타태그 및 절대 URL 생성에 사용됩니다

---

## Vercel 배포 시 설정 방법

### 1. Vercel 대시보드에서 설정

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. Settings > Environment Variables 메뉴로 이동
4. 각 환경변수를 추가:
   - **Name**: 환경변수 이름 (예: `NEXT_PUBLIC_TOUR_API_KEY`)
   - **Value**: 환경변수 값
   - **Environment**: 적용할 환경 선택
     - Production: 프로덕션 환경
     - Preview: 프리뷰 환경
     - Development: 개발 환경

### 2. 환경변수 추가 예시

```
Name: NEXT_PUBLIC_TOUR_API_KEY
Value: your_actual_api_key_here
Environment: Production, Preview, Development
```

### 3. 환경변수 적용

- 환경변수를 추가한 후 **재배포**해야 적용됩니다
- Vercel 대시보드에서 "Redeploy" 버튼 클릭

### 4. 환경변수 확인

배포 후 환경변수가 제대로 설정되었는지 확인:

1. Vercel 대시보드 > 프로젝트 > Deployments
2. 최신 배포 선택 > Runtime Logs 확인
3. 환경변수 누락 시 에러 메시지 확인

---

## 보안 주의사항

### 1. 서버 전용 환경변수 보호

다음 환경변수들은 **절대 클라이언트에 노출되면 안됩니다**:

- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TOUR_API_KEY` (서버 전용으로 사용하는 경우)

**보호 방법**:
- `NEXT_PUBLIC_` 접두사를 사용하지 않음
- Server Component 또는 Server Action에서만 사용
- 클라이언트 코드에 포함되지 않도록 확인

### 2. .env 파일 관리

**개발 환경**:
- `.env` 파일을 생성하여 환경변수 설정
- `.env` 파일은 `.gitignore`에 포함되어 있어야 함
- `.env.example` 파일을 참고하여 설정

**프로덕션 환경**:
- Vercel 대시보드에서 환경변수 설정
- 환경변수 값은 암호화되어 저장됨
- 절대 코드에 하드코딩하지 마세요

### 3. 환경변수 노출 시 대응

환경변수가 Git에 커밋되거나 노출된 경우:

1. **즉시 키 재발급**
   - 각 서비스 대시보드에서 키 재발급
   - 기존 키는 즉시 삭제

2. **Git 히스토리 정리** (필요 시)
   - `git filter-branch` 또는 `git filter-repo` 사용
   - 또는 저장소를 새로 생성

3. **환경변수 업데이트**
   - 모든 환경(개발, 프로덕션)에서 새 키로 업데이트

---

## 문제 해결 (FAQ)

### Q1: "API 키가 설정되지 않았습니다" 에러가 발생합니다

**원인**: 필수 환경변수가 설정되지 않았습니다.

**해결 방법**:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. `.env.example` 파일을 참고하여 필수 환경변수 설정
3. 환경변수 이름이 정확한지 확인 (대소문자 구분)
4. 서버를 재시작 (환경변수 변경 후 반드시 재시작 필요)

### Q2: 지도가 표시되지 않습니다

**원인**: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 환경변수가 설정되지 않았습니다.

**해결 방법**:
1. 네이버 클라우드 플랫폼에서 Client ID 발급
2. `.env` 파일에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 추가
3. 서버 재시작

### Q3: Vercel 배포 후 환경변수가 적용되지 않습니다

**원인**: 환경변수를 추가한 후 재배포하지 않았습니다.

**해결 방법**:
1. Vercel 대시보드에서 환경변수 확인
2. "Redeploy" 버튼 클릭하여 재배포
3. 배포 완료 후 확인

### Q4: "Supabase Service Role Key가 설정되지 않았습니다" 에러

**원인**: `SUPABASE_SERVICE_ROLE_KEY` 환경변수가 설정되지 않았습니다.

**해결 방법**:
1. Supabase 대시보드 > Settings > API에서 Service Role Key 확인
2. `.env` 파일에 추가 (주의: `NEXT_PUBLIC_` 접두사 없음)
3. 서버 재시작

### Q5: 개발 환경에서는 작동하는데 프로덕션에서 에러가 발생합니다

**원인**: 프로덕션 환경변수가 Vercel에 설정되지 않았습니다.

**해결 방법**:
1. Vercel 대시보드 > Settings > Environment Variables 확인
2. Production 환경에 환경변수 추가
3. 재배포

### Q6: 환경변수 검증 에러 메시지가 너무 길어서 읽기 어렵습니다

**원인**: 여러 환경변수가 누락되었습니다.

**해결 방법**:
1. 에러 메시지에서 누락된 환경변수 목록 확인
2. `.env.example` 파일을 참고하여 모든 필수 환경변수 설정
3. `docs/ENV_SETUP.md` 문서를 참고하여 각 환경변수 발급 방법 확인

---

## 추가 리소스

- [Next.js 환경변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 환경변수 설정 가이드](https://vercel.com/docs/concepts/projects/environment-variables)
- [한국관광공사 API 문서](https://www.data.go.kr/data/15101578/openapi.do)
- [네이버 지도 API 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)

---

**마지막 업데이트**: 2025-01-10

