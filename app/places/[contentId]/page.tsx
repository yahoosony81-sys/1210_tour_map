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
 * 4. Open Graph 메타태그 동적 생성 (공유 기능)
 *
 * @dependencies
 * - next/link: 클라이언트 사이드 라우팅
 * - next/headers: headers() 함수 (메타데이터 생성용)
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/skeleton: Skeleton UI
 * - lucide-react: 아이콘
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { ShareButton } from "@/components/tour-detail/share-button";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { getDetailCommon, getAreaBasedList } from "@/lib/api/tour-api";
import { Skeleton } from "@/components/ui/skeleton";
import { getAbsoluteUrl, truncateText } from "@/lib/utils/url";
import { ensureHttps } from "@/lib/utils/image";
import { getErrorMessage } from "@/lib/utils/error-handler";

// 반려동물 정보와 추천 관광지는 선택적이므로 동적 import
const DetailPetTour = dynamicImport(() => import("@/components/tour-detail/detail-pet-tour").then((mod) => ({ default: mod.DetailPetTour })), {
  loading: () => <Skeleton className="h-[200px] w-full" />,
});

const DetailRecommendations = dynamicImport(() => import("@/components/tour-detail/detail-recommendations").then((mod) => ({ default: mod.DetailRecommendations })), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

export const dynamic = "force-dynamic";

interface PlaceDetailPageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * HTML 태그 제거 함수
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 */
const DEFAULT_OG_IMAGE = "/og-image.png";

/**
 * 동적 메타데이터 생성 함수
 * Open Graph 및 Twitter Card 메타태그를 생성합니다.
 */
export async function generateMetadata({
  params,
}: PlaceDetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  // 기본 메타데이터
  const defaultMetadata: Metadata = {
    title: "관광지 정보 | My Trip",
    description: "한국관광공사 관광지 정보를 확인하세요",
    openGraph: {
      title: "관광지 정보 | My Trip",
      description: "한국관광공사 관광지 정보를 확인하세요",
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "My Trip",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "관광지 정보 | My Trip",
      description: "한국관광공사 관광지 정보를 확인하세요",
      images: [DEFAULT_OG_IMAGE],
    },
  };

  // contentId 유효성 검사
  if (!contentId || typeof contentId !== "string") {
    return defaultMetadata;
  }

  try {
    // 관광지 정보 조회
    const details = await getDetailCommon(contentId);
    if (!details || details.length === 0) {
      return defaultMetadata;
    }

    const detail = details[0];

    // 절대 URL 생성 (headers() 사용)
    const headersList = await headers();
    const host = headersList.get("host") || undefined;
    const pageUrl = getAbsoluteUrl(`/places/${contentId}`, host);

    // 제목
    const title = detail.title || "관광지 정보";

    // 설명 (overview에서 추출, HTML 태그 제거, 100자 이내)
    const rawDescription = detail.overview || "";
    const description = truncateText(stripHtmlTags(rawDescription), 100) || 
      "한국관광공사 관광지 정보를 확인하세요";

    // 이미지 URL (HTTPS 변환)
    const rawImageUrl = detail.firstimage || detail.firstimage2;
    const imageUrl = rawImageUrl ? ensureHttps(rawImageUrl) : DEFAULT_OG_IMAGE;

    // 메타데이터 생성
    return {
      title: `${title} | My Trip`,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    // 에러 발생 시 기본 메타데이터 반환
    return defaultMetadata;
  }
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

  // contentTypeId, areaCode 및 지도 데이터 획득을 위해 기본 정보 조회
  let contentTypeId: string | null = null;
  let areaCode: string | null = null;
  let detailData: {
    title: string;
    address: string;
    mapx: string;
    mapy: string;
    contentTypeId?: string;
  } | null = null;

  try {
    const details = await getDetailCommon(contentId);
    if (details && details.length > 0) {
      const detail = details[0];
      contentTypeId = detail.contenttypeid;
      
      // areaCode 추출 (추천 관광지용)
      // TourDetail 타입에는 areacode가 없으므로 getAreaBasedList로 현재 관광지 조회
      // 최적화: contentTypeId로 필터링하여 조회 범위 축소
      try {
        const currentTour = await getAreaBasedList({
          contentTypeId: detail.contenttypeid,
          numOfRows: 50, // 충분한 수 조회 (너무 많으면 API 응답 느려질 수 있음)
          pageNo: 1,
        });
        const foundTour = currentTour.find((tour) => tour.contentid === contentId);
        if (foundTour) {
          areaCode = foundTour.areacode;
        }
      } catch (error) {
        // areaCode 조회 실패해도 계속 진행 (추천 섹션은 선택적)
        // areaCode가 없어도 같은 타입만으로 추천 가능
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch areaCode:", getErrorMessage(error));
        }
      }
      
      // 지도 데이터 준비
      const address = detail.addr2
        ? `${detail.addr1} ${detail.addr2}`
        : detail.addr1;
      
      detailData = {
        title: detail.title,
        address: address,
        mapx: detail.mapx,
        mapy: detail.mapy,
        contentTypeId: detail.contenttypeid,
      };
    }
  } catch (error) {
    // 에러가 발생해도 기본 정보 섹션은 표시 (DetailInfo에서 에러 처리)
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch contentTypeId:", getErrorMessage(error));
    }
  }

  // 공유 URL 생성 (headers() 사용)
  const headersList = await headers();
  const host = headersList.get("host") || undefined;
  const shareUrl = getAbsoluteUrl(`/places/${contentId}`, host);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-8">
      {/* 뒤로가기 버튼 및 공유 버튼 */}
      <div className="mb-6 flex items-center justify-between md:mb-8">
        <Link href="/" aria-label="목록으로 돌아가기">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 min-h-[44px] min-w-[44px]"
            aria-label="목록으로 돌아가기"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="text-sm md:text-base">목록으로</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <BookmarkButton 
            contentId={contentId} 
            size="sm" 
            variant="outline" 
            className="min-h-[44px] min-w-[44px]"
          />
          <ShareButton 
            url={shareUrl} 
            size="sm" 
            variant="outline" 
            className="min-h-[44px] min-w-[44px]"
          />
        </div>
      </div>

      {/* 기본 정보 섹션 */}
      <DetailInfo contentId={contentId} />

      {/* 운영 정보 섹션 */}
      {contentTypeId ? (
        <DetailIntro contentId={contentId} contentTypeId={contentTypeId} />
      ) : (
        <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
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

      {/* 반려동물 동반 정보 섹션 */}
      <DetailPetTour contentId={contentId} />

      {/* 이미지 갤러리 섹션 */}
      <DetailGallery contentId={contentId} />

      {/* 지도 섹션 */}
      {detailData ? (
        <DetailMap
          contentId={contentId}
          title={detailData.title}
          address={detailData.address}
          mapx={detailData.mapx}
          mapy={detailData.mapy}
          contentTypeId={detailData.contentTypeId}
        />
      ) : (
        <section className="mb-6 md:mb-8">
          <h2 className="mb-4 text-xl font-semibold md:text-2xl">위치</h2>
          <Skeleton className="h-[400px] w-full rounded-lg md:h-[500px]" />
          <div className="mt-4">
            <Skeleton className="h-11 w-32 min-h-[44px]" />
          </div>
        </section>
      )}

      {/* 추천 관광지 섹션 */}
      {contentTypeId ? (
        <DetailRecommendations
          contentId={contentId}
          areaCode={areaCode || undefined}
          contentTypeId={contentTypeId}
        />
      ) : null}

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

