/**
 * @file stats.ts
 * @description 통계 대시보드 관련 타입 정의
 *
 * 이 파일은 통계 대시보드 페이지에서 사용하는 데이터 구조를
 * TypeScript 타입으로 정의합니다.
 *
 * 주요 타입:
 * 1. RegionStats - 지역별 관광지 통계
 * 2. TypeStats - 타입별 관광지 통계
 * 3. StatsSummary - 통계 요약 정보
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항
 */

import { ContentTypeId } from "./tour";

// =====================================================
// 지역별 통계 타입
// =====================================================

/**
 * 지역별 관광지 통계
 * 각 시/도별 관광지 개수를 나타냅니다.
 */
export interface RegionStats {
  /** 지역 코드 */
  areaCode: string;
  /** 지역명 (예: "서울", "부산", "제주") */
  regionName: string;
  /** 관광지 개수 */
  count: number;
}

// =====================================================
// 타입별 통계 타입
// =====================================================

/**
 * 타입별 관광지 통계
 * 각 관광 타입별 관광지 개수를 나타냅니다.
 */
export interface TypeStats {
  /** 콘텐츠 타입 ID */
  contentTypeId: ContentTypeId;
  /** 타입명 (예: "관광지", "문화시설") */
  typeName: string;
  /** 관광지 개수 */
  count: number;
  /** 전체 대비 비율 (백분율, 0-100) */
  percentage?: number;
}

// =====================================================
// 통계 요약 타입
// =====================================================

/**
 * 통계 요약 정보
 * 전체 통계 대시보드의 요약 정보를 나타냅니다.
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** 가장 많은 관광지가 있는 지역 Top 3 */
  topRegions: Array<{
    areaCode: string;
    regionName: string;
    count: number;
  }>;
  /** 가장 많은 관광 타입 Top 3 */
  topTypes: Array<{
    contentTypeId: ContentTypeId;
    typeName: string;
    count: number;
  }>;
  /** 마지막 업데이트 시간 (ISO 8601 형식) */
  lastUpdated: string;
}

// =====================================================
// 통계 API 응답 타입
// =====================================================

/**
 * 통계 데이터 집계 결과
 * 여러 API 호출 결과를 집계한 통계 데이터
 */
export interface StatsData {
  /** 지역별 통계 목록 */
  regionStats: RegionStats[];
  /** 타입별 통계 목록 */
  typeStats: TypeStats[];
  /** 통계 요약 */
  summary: StatsSummary;
}

