/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 클릭 시 상세페이지로 이동합니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (기본 이미지 fallback)
 * 2. 관광지명, 주소, 타입 뱃지 표시
 * 3. 호버 효과 및 클릭 시 상세페이지 이동
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 라우팅
 * - @/lib/types/tour: TourItem 타입, getContentTypeName 함수
 */

import Image from "next/image";
import Link from "next/link";
import type { TourItem } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  /** 관광지 정보 */
  tour: TourItem;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 * placeholder 이미지 서비스 사용
 */
const DEFAULT_IMAGE =
  "https://via.placeholder.com/400x300?text=No+Image";

export function TourCard({ tour, className }: TourCardProps) {
  const imageUrl = tour.firstimage || DEFAULT_IMAGE;
  const contentTypeName = getContentTypeName(tour.contenttypeid);
  const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className={cn(
        "group block rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:scale-[1.02] hover:shadow-md",
        className
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
        <Image
          src={imageUrl}
          alt={tour.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
        {/* 관광 타입 뱃지 */}
        <div className="absolute top-2 right-2">
          <span className="rounded-md bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            {contentTypeName}
          </span>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="p-4">
        {/* 관광지명 */}
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight">
          {tour.title}
        </h3>

        {/* 주소 */}
        <p className="text-sm text-muted-foreground line-clamp-1">{address}</p>
      </div>
    </Link>
  );
}

