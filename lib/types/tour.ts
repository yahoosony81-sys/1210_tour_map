/**
 * @file tour.ts
 * @description 한국관광공사 API 관광지 관련 타입 정의
 *
 * 이 파일은 한국관광공사 공공 API(KorService2)의 응답 데이터 구조를
 * TypeScript 타입으로 정의합니다.
 *
 * 주요 타입:
 * 1. TourItem - 관광지 목록 항목
 * 2. TourDetail - 관광지 상세 정보
 * 3. TourIntro - 관광지 운영 정보
 * 4. TourImage - 관광지 이미지
 * 5. PetTourInfo - 반려동물 동반 정보
 * 6. AreaCode - 지역 코드
 *
 * @see {@link /docs/PRD.md} - API 명세 및 데이터 구조
 */

// =====================================================
// Content Type ID 상수
// =====================================================

/**
 * 관광 타입 ID
 * 한국관광공사 API에서 사용하는 콘텐츠 타입 구분 코드
 */
export const CONTENT_TYPE_ID = {
  TOURIST_SPOT: "12", // 관광지
  CULTURAL_FACILITY: "14", // 문화시설
  FESTIVAL: "15", // 축제/행사
  TOUR_COURSE: "25", // 여행코스
  LEISURE_SPORTS: "28", // 레포츠
  ACCOMMODATION: "32", // 숙박
  SHOPPING: "38", // 쇼핑
  RESTAURANT: "39", // 음식점
} as const;

export type ContentTypeId = (typeof CONTENT_TYPE_ID)[keyof typeof CONTENT_TYPE_ID];

/**
 * 관광 타입 ID와 이름 매핑
 */
export const CONTENT_TYPE_NAME: Record<ContentTypeId, string> = {
  [CONTENT_TYPE_ID.TOURIST_SPOT]: "관광지",
  [CONTENT_TYPE_ID.CULTURAL_FACILITY]: "문화시설",
  [CONTENT_TYPE_ID.FESTIVAL]: "축제/행사",
  [CONTENT_TYPE_ID.TOUR_COURSE]: "여행코스",
  [CONTENT_TYPE_ID.LEISURE_SPORTS]: "레포츠",
  [CONTENT_TYPE_ID.ACCOMMODATION]: "숙박",
  [CONTENT_TYPE_ID.SHOPPING]: "쇼핑",
  [CONTENT_TYPE_ID.RESTAURANT]: "음식점",
};

// =====================================================
// 지역 코드 타입
// =====================================================

/**
 * 지역 코드 정보
 * areaCode2 API 응답 타입
 */
export interface AreaCode {
  code: string; // 지역 코드
  name: string; // 지역명
  rnum?: number; // 순번
}

// =====================================================
// 관광지 목록 타입
// =====================================================

/**
 * 관광지 목록 항목
 * areaBasedList2, searchKeyword2 API 응답 타입
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID (한국관광공사 API의 고유 ID) */
  contentid: string;
  /** 콘텐츠타입ID (12: 관광지, 14: 문화시설 등) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 (YYYYMMDDHHmmss 형식) */
  modifiedtime: string;
}

// =====================================================
// 관광지 상세 정보 타입
// =====================================================

/**
 * 관광지 상세 정보
 * detailCommon2 API 응답 타입
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 개요 (긴 설명문) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
}

// =====================================================
// 관광지 운영 정보 타입
// =====================================================

/**
 * 관광지 운영 정보
 * detailIntro2 API 응답 타입
 *
 * 주의: 콘텐츠 타입별로 필드가 다릅니다.
 * 예를 들어, 관광지(12)와 음식점(39)의 필드가 다를 수 있습니다.
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 유모차 대여 가능 여부 */
  chkbabycarriage?: string;
  /** 체험 가능 연령 */
  expagerange?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 입장료 */
  usefee?: string;
  /** 기타 정보 */
  [key: string]: string | undefined;
}

// =====================================================
// 관광지 이미지 타입
// =====================================================

/**
 * 관광지 이미지 정보
 * detailImage2 API 응답 타입
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 원본 이미지 URL */
  originimgurl?: string;
  /** 순번 */
  serialnum?: string;
  /** 작은 이미지 URL */
  smallimageurl?: string;
}

// =====================================================
// 반려동물 동반 정보 타입
// =====================================================

/**
 * 반려동물 동반 여행 정보
 * detailPetTour2 API 응답 타입
 */
export interface PetTourInfo {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 애완동물 동반 여부 */
  chkpetleash?: string;
  /** 애완동물 크기 제한 */
  chkpetsize?: string;
  /** 입장 가능 장소 (실내/실외) */
  chkpetplace?: string;
  /** 추가 요금 */
  chkpetfee?: string;
  /** 기타 반려동물 정보 */
  petinfo?: string;
  /** 주차장 정보 */
  parking?: string;
}

// =====================================================
// 유틸리티 타입
// =====================================================

/**
 * 좌표 변환 유틸리티
 * KATEC 좌표계를 WGS84로 변환
 * @param mapx - 경도 (KATEC, 정수형)
 * @param mapy - 위도 (KATEC, 정수형)
 * @returns WGS84 좌표 { lng: number, lat: number }
 */
export function convertKATECToWGS84(
  mapx: string | number,
  mapy: string | number
): { lng: number; lat: number } {
  const x = typeof mapx === "string" ? parseFloat(mapx) : mapx;
  const y = typeof mapy === "string" ? parseFloat(mapy) : mapy;

  return {
    lng: x / 10000000,
    lat: y / 10000000,
  };
}

/**
 * Content Type ID로 타입명 가져오기
 * @param contentTypeId - 콘텐츠 타입 ID
 * @returns 타입명 (예: "관광지", "문화시설")
 */
export function getContentTypeName(contentTypeId: string): string {
  return CONTENT_TYPE_NAME[contentTypeId as ContentTypeId] || "알 수 없음";
}

