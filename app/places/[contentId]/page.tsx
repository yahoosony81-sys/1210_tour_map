/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 동적 라우팅으로 contentId 기반 상세페이지 표시
 * 2. 뒤로가기 버튼
 * 3. 기본 레이아웃 구조 (섹션별 구분)
 *
 * @dependencies
 * - next/link: 클라이언트 사이드 라우팅
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/skeleton: Skeleton UI
 * - lucide-react: 아이콘
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { getDetailCommon } from "@/lib/api/tour-api";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

interface PlaceDetailPageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * 관광지 상세페이지
 * Server Component로 구현하여 초기 로딩 최적화
 */
export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  // Next.js 15: params는 Promise로 받아야 함
  const { contentId } = await params;

  // contentId 유효성 검사
  if (!contentId || typeof contentId !== "string") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <h1 className="text-2xl font-bold">관광지를 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">
            잘못된 URL입니다. 올바른 관광지 ID를 입력해주세요.
          </p>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // contentTypeId 획득을 위해 기본 정보 조회
  let contentTypeId: string | null = null;
  try {
    const details = await getDetailCommon(contentId);
    if (details && details.length > 0) {
      contentTypeId = details[0].contenttypeid;
    }
  } catch (error) {
    // 에러가 발생해도 기본 정보 섹션은 표시 (DetailInfo에서 에러 처리)
    console.error("Failed to fetch contentTypeId:", error);
  }

  return (
    <div className="container mx-auto px-4 py-4 md:px-4 md:py-8">
      {/* 뒤로가기 버튼 */}
      <div className="mb-4 md:mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            <span>목록으로</span>
          </Button>
        </Link>
      </div>

      {/* 기본 정보 섹션 */}
      <DetailInfo contentId={contentId} />

      {/* 운영 정보 섹션 */}
      {contentTypeId ? (
        <DetailIntro contentId={contentId} contentTypeId={contentTypeId} />
      ) : (
        <section className="mb-8 border-b pb-8">
          <h2 className="mb-4 text-xl font-semibold md:text-2xl">운영 정보</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </section>
      )}

      {/* 이미지 갤러리 섹션 */}
      <DetailGallery contentId={contentId} />

      {/* 지도 섹션 */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">위치</h2>
        <Skeleton className="h-64 w-full rounded-lg md:h-96" />
        <div className="mt-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </section>

      {/* 디버깅용: contentId 표시 (개발 중에만) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 rounded-lg border bg-muted p-4 text-sm">
          <p className="font-mono text-muted-foreground">
            Content ID: <span className="font-semibold text-foreground">{contentId}</span>
          </p>
        </div>
      )}
    </div>
  );
}

