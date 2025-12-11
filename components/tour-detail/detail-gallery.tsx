/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 섹션 컴포넌트
 *
 * 관광지의 이미지 갤러리를 표시하는 Server Component입니다.
 * detailImage2 API를 사용하여 관광지 이미지 목록을 조회하고,
 * 그리드 레이아웃으로 표시합니다.
 *
 * 주요 기능:
 * 1. getDetailImage() API 호출하여 관광지 이미지 목록 조회
 * 2. 이미지 데이터 파싱 및 유효성 검사
 * 3. 이미지 URL 처리 (HTTPS 변환, 유효성 검사)
 * 4. 이미지 없을 때 빈 상태 메시지 표시
 * 5. 에러 처리
 *
 * @dependencies
 * - @/lib/api/tour-api: getDetailImage 함수
 * - @/lib/types/tour: TourImage 타입
 * - @/lib/utils/image: ensureHttps, isValidImageUrl 함수
 * - @/components/tour-detail/image-gallery-client: 이미지 갤러리 클라이언트 컴포넌트
 * - @/components/ui/error: 에러 상태
 */

import { getDetailImage } from "@/lib/api/tour-api";
import type { TourImage } from "@/lib/types/tour";
import { ensureHttps, isValidImageUrl } from "@/lib/utils/image";
import { ImageGalleryClient } from "./image-gallery-client";
import { ErrorDisplay } from "@/components/ui/error";

interface DetailGalleryProps {
  /** 관광지 콘텐츠 ID */
  contentId: string;
}

/**
 * 이미지 URL 처리 함수
 * originimgurl 우선, 없으면 smallimageurl 사용
 * 둘 다 없으면 null 반환
 */
function processImageUrl(image: TourImage): string | null {
  const url = image.originimgurl || image.smallimageurl;
  if (!url || !isValidImageUrl(url)) {
    return null;
  }
  return ensureHttps(url);
}

/**
 * 관광지 이미지 갤러리 섹션 컴포넌트
 */
export async function DetailGallery({ contentId }: DetailGalleryProps) {
  let images: TourImage[] = [];
  let error: Error | null = null;

  try {
    const imageList = await getDetailImage(contentId);
    if (imageList && imageList.length > 0) {
      images = imageList;
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err
        : new Error("이미지를 불러오는데 실패했습니다");
  }

  // 에러 상태
  if (error) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">이미지 갤러리</h2>
        <ErrorDisplay message={error.message} size="medium" className="mt-4" />
      </section>
    );
  }

  // 이미지 데이터 처리 및 필터링
  const processedImages = images
    .map((image) => {
      const url = processImageUrl(image);
      if (!url) return null;
      return {
        ...image,
        url,
      };
    })
    .filter((image): image is TourImage & { url: string } => image !== null);

  // 이미지가 없는 경우
  if (processedImages.length === 0) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">이미지 갤러리</h2>
        <div className="mt-4 text-center text-muted-foreground">
          <p>이미지가 없습니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
      <h2 className="mb-4 text-xl font-semibold md:text-2xl">이미지 갤러리</h2>
      <ImageGalleryClient images={processedImages} />
    </section>
  );
}

