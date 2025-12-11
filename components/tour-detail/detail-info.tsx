/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 관광지의 기본 정보를 표시하는 Server Component입니다.
 * detailCommon2 API를 사용하여 관광지명, 이미지, 주소, 전화번호,
 * 홈페이지, 개요, 관광 타입을 표시합니다.
 *
 * 주요 기능:
 * 1. getDetailCommon() API 호출하여 관광지 상세 정보 조회
 * 2. 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
 * 3. 주소 복사 기능 (Client Component 사용)
 * 4. 전화번호 클릭 시 전화 연결
 * 5. 관광 타입 뱃지 표시
 * 6. 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - @/lib/api/tour-api: getDetailCommon 함수
 * - @/lib/types/tour: TourDetail 타입, getContentTypeName 함수
 * - next/image: 이미지 최적화
 * - @/components/tour-detail/copy-address-button: 주소 복사 버튼
 * - @/components/ui/skeleton: 로딩 상태
 * - @/components/ui/error: 에러 상태
 */

import { Phone, ExternalLink } from "lucide-react";
import { getDetailCommon } from "@/lib/api/tour-api";
import type { TourDetail } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/tour";
import { ensureHttps } from "@/lib/utils/image";
import { CopyAddressButton } from "./copy-address-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "@/components/ui/error";
import { SafeImage } from "@/components/ui/safe-image";

interface DetailInfoProps {
  /** 관광지 콘텐츠 ID */
  contentId: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 * 로컬 이미지 사용 (외부 서비스 의존성 제거)
 */
const DEFAULT_IMAGE = "/og-image.png";

/**
 * HTML 태그 제거 함수
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * 관광지 기본 정보 섹션 컴포넌트
 */
export async function DetailInfo({ contentId }: DetailInfoProps) {
  let detail: TourDetail | null = null;
  let error: Error | null = null;

  try {
    const details = await getDetailCommon(contentId);
    if (details && details.length > 0) {
      detail = details[0];
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error("정보를 불러오는데 실패했습니다");
  }

  // 에러 상태
  if (error) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">기본 정보</h2>
        <ErrorDisplay
          message={error.message}
          size="medium"
          className="mt-4"
        />
      </section>
    );
  }

  // 데이터 없음
  if (!detail) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">기본 정보</h2>
        <div className="mt-4 text-center text-muted-foreground">
          <p>정보를 찾을 수 없습니다</p>
        </div>
      </section>
    );
  }

  // 데이터 파싱
  const rawImageUrl = detail.firstimage || detail.firstimage2;
  // 로컬 이미지 경로인지 확인 (절대 경로로 시작하는 경우)
  const imageUrl = rawImageUrl
    ? rawImageUrl.startsWith("/")
      ? rawImageUrl
      : ensureHttps(rawImageUrl)
    : DEFAULT_IMAGE;
  const address = detail.addr2
    ? `${detail.addr1} ${detail.addr2}`
    : detail.addr1;
  const contentTypeName = getContentTypeName(detail.contenttypeid);
  const overview = detail.overview ? stripHtmlTags(detail.overview) : null;

  return (
    <section className="mb-8 border-b pb-8">
      <h2 className="mb-4 text-xl font-semibold md:text-2xl">기본 정보</h2>

      <div className="space-y-6">
        {/* 관광지명 */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
            {detail.title}
          </h1>
          {/* 관광 타입 뱃지 */}
          <div className="mt-2">
            <span className="inline-block rounded-md bg-primary/90 px-3 py-1 text-sm font-medium text-primary-foreground">
              {contentTypeName}
            </span>
          </div>
        </div>

        {/* 대표 이미지 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
          <SafeImage
            src={imageUrl}
            alt={detail.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 800px"
            priority
            fallbackSrc={DEFAULT_IMAGE}
          />
        </div>

        {/* 정보 그리드 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 주소 */}
          {address && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">주소</h3>
              <div className="flex items-start gap-2">
                <p className="flex-1 text-sm leading-relaxed">{address}</p>
                <CopyAddressButton address={address} />
              </div>
            </div>
          )}

          {/* 전화번호 */}
          {detail.tel && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">전화번호</h3>
              <a
                href={`tel:${detail.tel}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-label={`전화번호: ${detail.tel}`}
              >
                <Phone className="size-4" aria-hidden="true" />
                <span>{detail.tel}</span>
              </a>
            </div>
          )}

          {/* 홈페이지 */}
          {detail.homepage && (
            <div className="space-y-2 md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground">홈페이지</h3>
              <a
                href={detail.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-label={`홈페이지 열기: ${detail.homepage}`}
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                <span className="break-all">{detail.homepage}</span>
              </a>
            </div>
          )}
        </div>

        {/* 개요 */}
        {overview && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">개요</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {overview}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
export function DetailInfoSkeleton() {
  return (
    <section className="mb-8 border-b pb-8">
      <h2 className="mb-4 text-xl font-semibold md:text-2xl">기본 정보</h2>
      <div className="space-y-6">
        {/* 제목 스켈레톤 */}
        <div>
          <Skeleton className="mb-2 h-8 w-3/4 md:h-10" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* 이미지 스켈레톤 */}
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />

        {/* 정보 그리드 스켈레톤 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>

        {/* 개요 스켈레톤 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </section>
  );
}

