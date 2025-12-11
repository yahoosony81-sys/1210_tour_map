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

import Link from "next/link";
import type { TourItem } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import { ensureHttps } from "@/lib/utils/image";
import { SafeImage } from "@/components/ui/safe-image";

interface TourCardProps {
  /** 관광지 정보 */
  tour: TourItem;
  /** 선택된 상태 (지도 연동용) */
  isSelected?: boolean;
  /** 관광지 선택 핸들러 (지도 연동용) */
  onSelect?: (contentId: string) => void;
  /** 관광지 호버 핸들러 (지도 연동용) */
  onHover?: (contentId: string | null) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 * 로컬 이미지 사용 (외부 서비스 의존성 제거)
 */
const DEFAULT_IMAGE = "/og-image.png";

export function TourCard({
  tour,
  isSelected = false,
  onSelect,
  onHover,
  className,
}: TourCardProps) {
  const rawImageUrl = tour.firstimage;
  // 로컬 이미지 경로인지 확인 (절대 경로로 시작하는 경우)
  const imageUrl = rawImageUrl
    ? rawImageUrl.startsWith("/")
      ? rawImageUrl
      : ensureHttps(rawImageUrl)
    : DEFAULT_IMAGE;
  const contentTypeName = getContentTypeName(tour.contenttypeid);
  const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;

  const handleClick = (e: React.MouseEvent) => {
    // 지도 연동: 카드 클릭 시 지도로 이동
    if (onSelect) {
      e.preventDefault();
      onSelect(tour.contentid);
    }
  };

  const handleMouseEnter = () => {
    // 지도 연동: 카드 호버 시 마커 강조
    if (onHover) {
      onHover(tour.contentid);
    }
  };

  const handleMouseLeave = () => {
    // 지도 연동: 카드 호버 해제 시 마커 강조 해제
    if (onHover) {
      onHover(null);
    }
  };

  return (
    <Link
      href={`/places/${tour.contentid}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group block rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:scale-[1.02] hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
        <SafeImage
          src={imageUrl}
          alt={tour.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
          fallbackSrc={DEFAULT_IMAGE}
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

