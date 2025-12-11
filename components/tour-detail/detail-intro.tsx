/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 정보를 표시하는 Server Component입니다.
 * detailIntro2 API를 사용하여 운영시간, 휴무일, 이용요금, 주차,
 * 수용인원, 체험 프로그램, 유모차/반려동물 동반 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. getDetailIntro() API 호출하여 관광지 운영 정보 조회
 * 2. 운영시간, 휴무일, 이용요금, 주차, 수용인원, 체험 프로그램 표시
 * 3. 유모차/반려동물 동반 가능 여부 표시
 * 4. 정보 없는 항목 숨김 처리 (조건부 렌더링)
 * 5. 에러 처리 및 빈 상태 처리
 *
 * @dependencies
 * - @/lib/api/tour-api: getDetailIntro 함수
 * - @/lib/types/tour: TourIntro 타입
 * - lucide-react: 아이콘
 * - @/components/ui/error: 에러 상태
 */

import {
  Clock,
  Calendar,
  DollarSign,
  Car,
  Users,
  Activity,
  Baby,
  Dog,
} from "lucide-react";
import { getDetailIntro } from "@/lib/api/tour-api";
import type { TourIntro } from "@/lib/types/tour";
import { ErrorDisplay } from "@/components/ui/error";

interface DetailIntroProps {
  /** 관광지 콘텐츠 ID */
  contentId: string;
  /** 관광지 콘텐츠 타입 ID */
  contentTypeId: string;
}

/**
 * HTML 태그 제거 함수
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * 관광지 운영 정보 섹션 컴포넌트
 */
export async function DetailIntro({
  contentId,
  contentTypeId,
}: DetailIntroProps) {
  let intro: TourIntro | null = null;
  let error: Error | null = null;

  try {
    const intros = await getDetailIntro(contentId, contentTypeId);
    if (intros && intros.length > 0) {
      intro = intros[0];
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err
        : new Error("운영 정보를 불러오는데 실패했습니다");
  }

  // 에러 상태
  if (error) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">운영 정보</h2>
        <ErrorDisplay message={error.message} size="medium" className="mt-4" />
      </section>
    );
  }

  // 데이터 없음
  if (!intro) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">운영 정보</h2>
        <div className="mt-4 text-center text-muted-foreground">
          <p>운영 정보가 없습니다</p>
        </div>
      </section>
    );
  }

  // 데이터 파싱
  const usetime = intro.usetime ? stripHtmlTags(intro.usetime) : null;
  const restdate = intro.restdate ? stripHtmlTags(intro.restdate) : null;
  const usefee = intro.usefee ? stripHtmlTags(intro.usefee) : null;
  const parking = intro.parking ? stripHtmlTags(intro.parking) : null;
  const accomcount = intro.accomcount ? stripHtmlTags(intro.accomcount) : null;
  const expguide = intro.expguide ? stripHtmlTags(intro.expguide) : null;
  const chkbabycarriage = intro.chkbabycarriage
    ? stripHtmlTags(intro.chkbabycarriage)
    : null;
  const chkpet = intro.chkpet ? stripHtmlTags(intro.chkpet) : null;

  // 표시할 정보가 있는지 확인
  const hasInfo =
    usetime ||
    restdate ||
    usefee ||
    parking ||
    accomcount ||
    expguide ||
    chkbabycarriage ||
    chkpet;

  if (!hasInfo) {
    return (
      <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">운영 정보</h2>
        <div className="mt-4 text-center text-muted-foreground">
          <p>운영 정보가 없습니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 border-b pb-6 md:mb-8 md:pb-8">
      <h2 className="mb-4 text-xl font-semibold md:text-2xl">운영 정보</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 운영시간 */}
        {usetime && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              <span>운영시간</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {usetime}
            </p>
          </div>
        )}

        {/* 휴무일 */}
        {restdate && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="size-4" aria-hidden="true" />
              <span>휴무일</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {restdate}
            </p>
          </div>
        )}

        {/* 이용요금 */}
        {usefee && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4" aria-hidden="true" />
              <span>이용요금</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {usefee}
            </p>
          </div>
        )}

        {/* 주차 가능 여부 */}
        {parking && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Car className="size-4" aria-hidden="true" />
              <span>주차</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {parking}
            </p>
          </div>
        )}

        {/* 수용인원 */}
        {accomcount && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4" aria-hidden="true" />
              <span>수용인원</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {accomcount}
            </p>
          </div>
        )}

        {/* 체험 프로그램 */}
        {expguide && (
          <div className="space-y-2 md:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="size-4" aria-hidden="true" />
              <span>체험 프로그램</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {expguide}
            </p>
          </div>
        )}

        {/* 유모차 동반 가능 여부 */}
        {chkbabycarriage && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Baby className="size-4" aria-hidden="true" />
              <span>유모차 동반</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {chkbabycarriage}
            </p>
          </div>
        )}

        {/* 반려동물 동반 가능 여부 */}
        {chkpet && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Dog className="size-4" aria-hidden="true" />
              <span>반려동물 동반</span>
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {chkpet}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

