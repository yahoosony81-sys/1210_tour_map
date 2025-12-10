/**
 * @file detail-pet-tour.tsx
 * @description 관광지 반려동물 동반 정보 섹션 컴포넌트
 *
 * 관광지의 반려동물 동반 여행 정보를 표시하는 Server Component입니다.
 * detailPetTour2 API를 사용하여 반려동물 동반 가능 여부, 크기 제한,
 * 입장 가능 장소, 추가 요금, 전용 시설 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. getDetailPetTour() API 호출하여 반려동물 동반 정보 조회
 * 2. 반려동물 동반 가능 여부, 크기 제한, 입장 가능 장소 표시
 * 3. 추가 요금 및 주차장 정보 표시
 * 4. 기타 반려동물 정보 강조 표시 (주의사항)
 * 5. 크기별 정보 뱃지 디자인
 * 6. 정보 없는 항목 숨김 처리 (조건부 렌더링)
 * 7. 에러 처리 및 빈 상태 처리
 *
 * @dependencies
 * - @/lib/api/tour-api: getDetailPetTour 함수
 * - @/lib/types/tour: PetTourInfo 타입
 * - lucide-react: 아이콘
 * - @/components/ui/error: 에러 상태
 */

import {
  Dog,
  PawPrint,
  MapPin,
  DollarSign,
  Car,
  Info,
  AlertCircle,
} from "lucide-react";
import { getDetailPetTour } from "@/lib/api/tour-api";
import type { PetTourInfo } from "@/lib/types/tour";
import { Error } from "@/components/ui/error";
import { cn } from "@/lib/utils";

interface DetailPetTourProps {
  /** 관광지 콘텐츠 ID */
  contentId: string;
}

/**
 * HTML 태그 제거 함수
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * 크기별 뱃지 색상 매핑
 */
function getSizeBadgeColor(size: string): string {
  const lowerSize = size.toLowerCase();
  if (lowerSize.includes("소형") || lowerSize.includes("소")) {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  }
  if (lowerSize.includes("중형") || lowerSize.includes("중")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }
  if (lowerSize.includes("대형") || lowerSize.includes("대")) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
  }
  if (lowerSize.includes("모든") || lowerSize.includes("전체")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
  }
  // 기본 색상
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

/**
 * 관광지 반려동물 동반 정보 섹션 컴포넌트
 */
export async function DetailPetTour({ contentId }: DetailPetTourProps) {
  let petInfo: PetTourInfo | null = null;
  let error: Error | null = null;

  try {
    const petInfos = await getDetailPetTour(contentId);
    if (petInfos && petInfos.length > 0) {
      petInfo = petInfos[0];
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err
        : new Error("반려동물 정보를 불러오는데 실패했습니다");
  }

  // 에러 상태
  if (error) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold md:text-2xl">
          <PawPrint className="size-5" aria-hidden="true" />
          <span>반려동물 동반 정보</span>
        </h2>
        <Error message={error.message} size="medium" className="mt-4" />
      </section>
    );
  }

  // 데이터 없음
  if (!petInfo) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold md:text-2xl">
          <PawPrint className="size-5" aria-hidden="true" />
          <span>반려동물 동반 정보</span>
        </h2>
        <div className="mt-4 text-center text-muted-foreground">
          <p>반려동물 정보가 없습니다</p>
        </div>
      </section>
    );
  }

  // 데이터 파싱
  const chkpetleash = petInfo.chkpetleash
    ? stripHtmlTags(petInfo.chkpetleash)
    : null;
  const chkpetsize = petInfo.chkpetsize
    ? stripHtmlTags(petInfo.chkpetsize)
    : null;
  const chkpetplace = petInfo.chkpetplace
    ? stripHtmlTags(petInfo.chkpetplace)
    : null;
  const chkpetfee = petInfo.chkpetfee ? stripHtmlTags(petInfo.chkpetfee) : null;
  const petinfo = petInfo.petinfo ? stripHtmlTags(petInfo.petinfo) : null;
  const parking = petInfo.parking ? stripHtmlTags(petInfo.parking) : null;

  // 표시할 정보가 있는지 확인
  const hasInfo =
    chkpetleash ||
    chkpetsize ||
    chkpetplace ||
    chkpetfee ||
    petinfo ||
    parking;

  if (!hasInfo) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold md:text-2xl">
          <PawPrint className="size-5" aria-hidden="true" />
          <span>반려동물 동반 정보</span>
        </h2>
        <div className="mt-4 text-center text-muted-foreground">
          <p>반려동물 정보가 없습니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold md:text-2xl">
        <PawPrint className="size-5" aria-hidden="true" />
        <span>반려동물 동반 정보</span>
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 반려동물 동반 가능 여부 */}
        {chkpetleash && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Dog className="size-4" aria-hidden="true" />
              <span>반려동물 동반 가능</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {chkpetleash}
            </p>
          </div>
        )}

        {/* 반려동물 크기 제한 */}
        {chkpetsize && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PawPrint className="size-4" aria-hidden="true" />
              <span>크기 제한</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-block rounded-md px-3 py-1 text-xs font-medium",
                  getSizeBadgeColor(chkpetsize)
                )}
              >
                {chkpetsize}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {chkpetsize}
            </p>
          </div>
        )}

        {/* 입장 가능 장소 (실내/실외) */}
        {chkpetplace && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              <span>입장 가능 장소</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {chkpetplace}
            </p>
          </div>
        )}

        {/* 반려동물 동반 추가 요금 */}
        {chkpetfee && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4" aria-hidden="true" />
              <span>추가 요금</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {chkpetfee}
            </p>
          </div>
        )}

        {/* 주차장 정보 (반려동물 하차 공간) */}
        {parking && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Car className="size-4" aria-hidden="true" />
              <span>주차장 정보</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {parking}
            </p>
          </div>
        )}
      </div>

      {/* 기타 반려동물 정보 (주의사항 강조) */}
      {petinfo && (
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-900 dark:text-yellow-200">
            <AlertCircle className="size-4" aria-hidden="true" />
            <span>주의사항 및 추가 정보</span>
          </h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-yellow-800 dark:text-yellow-300">
            {petinfo}
          </p>
        </div>
      )}
    </section>
  );
}

