/**
 * @file image-gallery-client.tsx
 * @description 이미지 갤러리 클라이언트 컴포넌트
 *
 * 이미지 갤러리를 그리드 레이아웃으로 표시하고,
 * 이미지 클릭 시 전체화면 모달을 여는 Client Component입니다.
 *
 * 주요 기능:
 * 1. 이미지 그리드 레이아웃 표시 (반응형)
 * 2. 이미지 클릭 시 전체화면 모달 열기
 * 3. Next.js Image 컴포넌트 사용 (최적화, lazy loading)
 * 4. 호버 효과 (scale, cursor pointer)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - @/components/tour-detail/image-modal: 전체화면 이미지 뷰어 모달
 * - @/lib/types/tour: TourImage 타입
 */

"use client";

import { useState } from "react";
import type { TourImage } from "@/lib/types/tour";
import { ImageModal } from "./image-modal";
import { SafeImage } from "@/components/ui/safe-image";

interface ImageGalleryClientProps {
  /** 이미지 목록 (url 필드가 추가된 TourImage 배열) */
  images: (TourImage & { url: string })[];
}

/**
 * 이미지 갤러리 클라이언트 컴포넌트
 */
export function ImageGalleryClient({ images }: ImageGalleryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedIndex(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {images.map((image, index) => (
          <button
            key={`${image.contentid}-${image.serialnum || index}`}
            onClick={() => handleImageClick(index)}
            className="group relative aspect-square w-full overflow-hidden rounded-lg bg-muted transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`이미지 ${index + 1} 보기`}
          >
            <SafeImage
              src={image.url}
              alt={`관광지 이미지 ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              fallbackSrc="/og-image.png"
            />
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {/* 전체화면 이미지 모달 */}
      {selectedIndex !== null && (
        <ImageModal
          images={images}
          initialIndex={selectedIndex}
          open={selectedIndex !== null}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseModal();
            }
          }}
        />
      )}
    </>
  );
}

