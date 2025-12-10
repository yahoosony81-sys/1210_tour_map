# Phase 2: 필터 기능 구현 계획

## 목표
- 지역 필터 (시/도 선택)
- 관광 타입 필터 (다중 선택 가능)
- 정렬 옵션 (최신순, 이름순)
- URL 쿼리 파라미터로 필터 상태 관리

## 구현 단계

### 1. 필터 컴포넌트 생성 (`components/tour-filters.tsx`)

**기능**:
- 지역 필터 UI
- 관광 타입 필터 UI (다중 선택)
- 정렬 옵션 UI
- URL 쿼리 파라미터로 상태 관리

**구현 내용**:
- Client Component로 구현 ("use client")
- `useRouter`, `useSearchParams` 사용 (Next.js 15)
- 지역 목록은 `getAreaCode()` API로 로드 (useEffect)
- 필터 변경 시 URL 쿼리 파라미터 업데이트

**UI 구성**:
- 지역 필터: Select 또는 Button Group
- 관광 타입 필터: 다중 선택 가능한 Button Group
- 정렬 옵션: Select 또는 Button Group

**참고 파일**:
- [lib/api/tour-api.ts](lib/api/tour-api.ts) - getAreaCode() 함수
- [lib/types/tour.ts](lib/types/tour.ts) - CONTENT_TYPE_ID, AreaCode 타입

### 2. 홈페이지에 필터 통합 (`app/page.tsx`)

**변경 사항**:
- `searchParams`를 props로 받기 (Next.js 15 async)
- 필터 파라미터 파싱
- `getAreaBasedList()`에 필터 적용
- 정렬 로직 추가

**URL 쿼리 파라미터 구조**:
- `areaCode`: 지역 코드 (예: "1" = 서울)
- `contentTypeId`: 관광 타입 (다중 선택 시 콤마로 구분, 예: "12,14,15")
- `sort`: 정렬 옵션 ("latest" | "name")

**구현 내용**:
```typescript
// app/page.tsx 구조
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const areaCode = params.areaCode as string | undefined;
  const contentTypeId = params.contentTypeId as string | undefined;
  const sort = (params.sort as string) || "latest";
  
  // 필터 적용하여 데이터 조회
  const tours = await getAreaBasedList({
    areaCode,
    contentTypeId,
    numOfRows: 20,
    pageNo: 1,
  });
  
  // 정렬 적용
  const sortedTours = sortTours(tours, sort);
  
  return (
    <main>
      <TourFilters />
      <TourList tours={sortedTours} />
    </main>
  );
}
```

### 3. 정렬 유틸리티 함수 생성

**구현 내용**:
- `lib/utils/tour-sort.ts` 또는 `lib/types/tour.ts`에 추가
- `sortTours()` 함수 생성
- 정렬 옵션:
  - "latest": `modifiedtime` 내림차순 (최신순)
  - "name": `title` 오름차순 (가나다순)

**구현 예시**:
```typescript
export function sortTours(
  tours: TourItem[],
  sortOption: "latest" | "name"
): TourItem[] {
  const sorted = [...tours];
  
  if (sortOption === "latest") {
    return sorted.sort((a, b) => {
      const dateA = new Date(a.modifiedtime);
      const dateB = new Date(b.modifiedtime);
      return dateB.getTime() - dateA.getTime();
    });
  }
  
  if (sortOption === "name") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }
  
  return sorted;
}
```

### 4. shadcn/ui Select 컴포넌트 설치 (선택 사항)

**필요 시**:
- `pnpx shadcn@latest add select`
- Select 컴포넌트가 없으면 Button Group으로 대체 가능

## 파일 구조

```
components/
  tour-filters.tsx          # 필터 컴포넌트 (Client Component)
lib/
  utils/
    tour-sort.ts           # 정렬 유틸리티 함수 (선택)
app/
  page.tsx                 # 홈페이지 (필터 통합)
```

## 기술 스택

- **Next.js 15**: useSearchParams, useRouter
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **shadcn/ui**: UI 컴포넌트 (Button, Select 등)
- **lucide-react**: 아이콘

## 주의사항

1. **URL 쿼리 파라미터**: 필터 상태를 URL에 저장하여 공유 가능하게 함
2. **다중 선택**: 관광 타입 필터는 다중 선택 가능
3. **정렬**: 서버 사이드에서 정렬하여 성능 최적화
4. **반응형**: 모바일에서도 필터 UI가 잘 보이도록 구현
5. **접근성**: ARIA 라벨, 키보드 네비게이션 지원

## 다음 단계

- 검색 기능 추가
- 네이버 지도 연동
- 페이지네이션 또는 무한 스크롤

