# 성능 최적화 문서

이 문서는 My Trip 프로젝트의 성능 최적화 전략과 구현 내용을 설명합니다.

## 목차

1. [API 캐싱 전략](#api-캐싱-전략)
2. [코드 분할 전략](#코드-분할-전략)
3. [번들 최적화](#번들-최적화)
4. [성능 측정](#성능-측정)

## API 캐싱 전략

### 개요

한국관광공사 API는 공공 데이터이므로 자주 변경되지 않습니다. 따라서 적절한 캐싱을 통해 API 호출을 줄이고 응답 속도를 개선할 수 있습니다.

### 캐싱 시간 설정

Next.js의 `fetch` API의 `next.revalidate` 옵션을 사용하여 각 API 엔드포인트별로 캐싱 시간을 설정했습니다.

| API 함수 | 엔드포인트 | 캐싱 시간 | 근거 |
|---------|-----------|----------|------|
| `getAreaCode()` | `/areaCode2` | 24시간 (86400초) | 지역 코드는 거의 변경되지 않음 |
| `getAreaBasedList()` | `/areaBasedList2` | 1시간 (3600초) | 관광지 목록은 가끔 업데이트됨 |
| `searchKeyword()` | `/searchKeyword2` | 30분 (1800초) | 검색어가 다양하므로 짧게 설정 |
| `getDetailCommon()` | `/detailCommon2` | 1시간 (3600초) | 상세 정보는 가끔 업데이트됨 |
| `getDetailIntro()` | `/detailIntro2` | 1시간 (3600초) | 운영 정보는 가끔 업데이트됨 |
| `getDetailImage()` | `/detailImage2` | 24시간 (86400초) | 이미지 목록은 거의 변경되지 않음 |
| `getDetailPetTour()` | `/detailPetTour2` | 1시간 (3600초) | 반려동물 정보는 가끔 업데이트됨 |

### 구현 방법

`lib/api/tour-api.ts`의 `callApi()` 함수에서 `ApiCallOptions`의 `revalidate` 옵션을 받아 Next.js fetch의 `next.revalidate` 옵션으로 전달합니다.

```typescript
// 예시: getAreaCode 함수
export async function getAreaCode(areaCode?: string): Promise<AreaCode[]> {
  // ...
  // 지역 코드는 자주 변경되지 않으므로 24시간 캐싱
  return callApi<AreaCode[]>("/areaCode2", params, { revalidate: 86400 });
}
```

### 캐시 무효화

- **자동 무효화**: 설정된 시간(`revalidate`)이 지나면 자동으로 캐시가 무효화되고 다음 요청 시 새로운 데이터를 가져옵니다.
- **수동 무효화**: 필요시 `revalidatePath()` 또는 `revalidateTag()`를 사용하여 특정 경로나 태그의 캐시를 무효화할 수 있습니다.

## 코드 분할 전략

### 개요

초기 번들 크기를 줄이고 로딩 시간을 단축하기 위해 무거운 컴포넌트를 동적 import로 분리했습니다.

### 동적 import 적용 컴포넌트

| 컴포넌트 | 위치 | 이유 |
|---------|------|------|
| `NaverMap` | `components/naver-map.tsx` | 네이버 지도 API 스크립트가 무거움, SSR 불필요 |
| `RegionChart` | `components/stats/region-chart.tsx` | recharts 라이브러리가 무거움 |
| `TypeChart` | `components/stats/type-chart.tsx` | recharts 라이브러리가 무거움 |
| `ImageModal` | `components/tour-detail/image-modal.tsx` | 모달은 필요할 때만 로드 |
| `DetailPetTour` | `components/tour-detail/detail-pet-tour.tsx` | 선택적 컴포넌트 (반려동물 정보가 없는 경우 많음) |
| `DetailRecommendations` | `components/tour-detail/detail-recommendations.tsx` | 페이지 하단에 위치, 선택적 컴포넌트 |

### 구현 방법

Next.js의 `dynamic()` 함수를 사용하여 컴포넌트를 동적으로 로드합니다.

```typescript
// 예시: NaverMap 컴포넌트
const NaverMap = dynamic(() => import("@/components/naver-map").then((mod) => ({ default: mod.NaverMap })), {
  ssr: false, // SSR 비활성화 (지도는 클라이언트에서만 필요)
  loading: () => <div>지도를 불러오는 중...</div>, // 로딩 상태
});
```

### 효과

- **초기 번들 크기 감소**: 무거운 컴포넌트가 초기 번들에서 제외됨
- **로딩 시간 단축**: 필요한 컴포넌트만 로드하여 초기 로딩 시간 단축
- **사용자 경험 개선**: 로딩 상태를 표시하여 사용자에게 피드백 제공

## 번들 최적화

### Bundle Analyzer

번들 크기를 분석하기 위해 `@next/bundle-analyzer`를 설정했습니다.

#### 사용 방법

```bash
# 번들 분석 실행
pnpm analyze

# 또는 환경변수 직접 설정
ANALYZE=true pnpm build
```

분석 결과는 빌드 후 자동으로 브라우저에서 열립니다.

### 최적화 전략

1. **Tree-shaking**: Named import 사용 (`import { func } from 'lib'`)
2. **불필요한 의존성 제거**: 사용하지 않는 패키지 제거
3. **코드 분할**: 동적 import를 통한 코드 분할
4. **이미지 최적화**: Next.js Image 컴포넌트 사용

## 성능 측정

### Lighthouse

Lighthouse를 사용하여 성능 점수를 측정합니다.

#### 사용 방법

1. 개발 서버 실행: `pnpm dev`
2. 다른 터미널에서 측정: `pnpm measure:perf`

측정 결과는 `lighthouse-reports/` 디렉토리에 저장됩니다.

#### 측정 항목

- **Performance**: 성능 점수 (목표: 80점 이상)
- **Accessibility**: 접근성 점수
- **Best Practices**: 모범 사례 점수
- **SEO**: SEO 점수
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): 목표 < 2.5초
  - FID (First Input Delay): 목표 < 100ms
  - CLS (Cumulative Layout Shift): 목표 < 0.1

### 성능 목표

| 메트릭 | 목표 | 현재 상태 |
|--------|------|----------|
| Lighthouse Performance | 80점 이상 | 측정 필요 |
| 초기 번들 크기 (gzipped) | 200KB 이하 | 측정 필요 |
| LCP | < 2.5초 | 측정 필요 |
| FID | < 100ms | 측정 필요 |
| CLS | < 0.1 | 측정 필요 |

## 추가 최적화 권장 사항

### 이미지 최적화

- [x] Next.js Image 컴포넌트 사용
- [x] `priority` 속성 적절히 사용
- [x] `sizes` 속성 최적화
- [ ] WebP 형식 변환 (필요시)

### 폰트 최적화

- [ ] 폰트 로딩 전략 확인 (`font-display`)
- [ ] 불필요한 폰트 제거

### 서버 컴포넌트 최적화

- [x] Server Component 우선 사용
- [x] Client Component 최소화
- [x] `"use client"` 디렉티브 최소화

## 참고 자료

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Core Web Vitals](https://web.dev/vitals/)

