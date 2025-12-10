/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API (KorService2) 클라이언트
 *
 * 이 모듈은 한국관광공사 공공 API를 호출하는 모든 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (areaCode2)
 * 2. 지역 기반 관광지 목록 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 * 4. 관광지 상세 정보 조회 (detailCommon2, detailIntro2, detailImage2, detailPetTour2)
 *
 * 핵심 구현 로직:
 * - 공통 파라미터 자동 처리 (serviceKey, MobileOS, MobileApp, _type)
 * - 재시도 로직 (최대 3회, 지수 백오프)
 * - 타입 안전한 API 호출
 * - 서버/클라이언트 양쪽에서 사용 가능
 *
 * @dependencies
 * - Next.js 15 (환경변수 처리)
 * - Fetch API (네이티브)
 * - @/lib/types/tour - 관광지 타입 정의
 *
 * @see {@link /docs/PRD.md} - API 명세 및 요구사항
 */

import type {
  AreaCode,
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
} from "@/lib/types/tour";

// =====================================================
// 상수 정의
// =====================================================

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

const DEFAULT_NUM_OF_ROWS = 10;
const DEFAULT_PAGE_NO = 1;

// 재시도 설정
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1초, 2초, 4초

// =====================================================
// 타입 정의
// =====================================================

/**
 * API 응답 래퍼 타입
 * 한국관광공사 API는 response.body.items.item 형태로 응답
 */
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * API 에러 타입
 */
export class TourApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "TourApiError";
  }
}

/**
 * API 호출 옵션
 */
interface ApiCallOptions {
  retries?: number;
  timeout?: number;
}

// =====================================================
// 유틸리티 함수
// =====================================================

/**
 * 환경변수에서 API 키 가져오기
 * 서버 사이드: NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY
 * 클라이언트 사이드: NEXT_PUBLIC_TOUR_API_KEY만 사용 가능
 */
function getApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new TourApiError(
      "API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 확인하세요."
    );
  }

  return apiKey;
}

/**
 * URL 쿼리 파라미터 빌더
 * undefined/null 값은 제외하고, 문자열로 변환
 */
function buildQueryParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * 지수 백오프를 사용한 재시도 로직이 포함된 fetch 래퍼
 * 네트워크 에러 및 5xx 에러만 재시도
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // 5xx 에러인 경우 재시도
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    return response;
  } catch (error) {
    // 네트워크 에러인 경우 재시도
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    // 최대 재시도 횟수 초과
    throw new TourApiError(
      `네트워크 오류가 발생했습니다. ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
}

/**
 * API 응답 파싱 및 에러 처리
 */
async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new TourApiError(
      `API 요청 실패: ${response.status} ${response.statusText}`,
      undefined,
      response.status
    );
  }

  const data: ApiResponse<T> = await response.json();

  // API 응답 헤더에서 에러 확인
  if (data.response.header.resultCode !== "0000") {
    throw new TourApiError(
      data.response.header.resultMsg || "API 오류가 발생했습니다.",
      data.response.header.resultCode
    );
  }

  // items.item가 배열이 아닌 경우 배열로 변환
  const items = data.response.body.items.item;
  if (!items) {
    return [] as unknown as T;
  }

  return Array.isArray(items) ? items : ([items] as unknown as T);
}

/**
 * API 엔드포인트 호출 공통 함수
 */
async function callApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  options: ApiCallOptions = {}
): Promise<T> {
  const apiKey = getApiKey();

  // 공통 파라미터와 사용자 파라미터 병합
  const allParams = {
    serviceKey: apiKey,
    ...COMMON_PARAMS,
    ...params,
  };

  const queryString = buildQueryParams(allParams);
  const url = `${BASE_URL}${endpoint}?${queryString}`;

  const response = await fetchWithRetry(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseApiResponse<T>(response);
}

// =====================================================
// API 함수 구현
// =====================================================

/**
 * 지역코드 조회
 * @param areaCode - 시/도 코드 (선택, 없으면 전체 지역 조회)
 * @returns 지역 코드 목록
 */
export async function getAreaCode(areaCode?: string): Promise<AreaCode[]> {
  const params: Record<string, string | undefined> = {};
  if (areaCode) {
    params.areaCode = areaCode;
  }

  return callApi<AreaCode[]>("/areaCode2", params);
}

/**
 * 지역 기반 관광지 목록 조회
 * @param options - 조회 옵션
 * @param options.areaCode - 지역 코드 (선택)
 * @param options.contentTypeId - 관광 타입 ID (선택)
 * @param options.numOfRows - 페이지당 항목 수 (기본: 10)
 * @param options.pageNo - 페이지 번호 (기본: 1)
 * @returns 관광지 목록
 */
export async function getAreaBasedList(options: {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
} = {}): Promise<TourItem[]> {
  const params: Record<string, string | number | undefined> = {
    areaCode: options.areaCode,
    contentTypeId: options.contentTypeId,
    numOfRows: options.numOfRows || DEFAULT_NUM_OF_ROWS,
    pageNo: options.pageNo || DEFAULT_PAGE_NO,
  };

  return callApi<TourItem[]>("/areaBasedList2", params);
}

/**
 * 키워드 검색
 * @param keyword - 검색 키워드 (필수)
 * @param options - 검색 옵션
 * @param options.areaCode - 지역 코드 (선택)
 * @param options.contentTypeId - 관광 타입 ID (선택)
 * @param options.numOfRows - 페이지당 항목 수 (기본: 10)
 * @param options.pageNo - 페이지 번호 (기본: 1)
 * @returns 검색 결과 목록
 */
export async function searchKeyword(
  keyword: string,
  options: {
    areaCode?: string;
    contentTypeId?: string;
    numOfRows?: number;
    pageNo?: number;
  } = {}
): Promise<TourItem[]> {
  if (!keyword || keyword.trim().length === 0) {
    throw new TourApiError("검색 키워드를 입력해주세요.");
  }

  const params: Record<string, string | number | undefined> = {
    keyword: keyword.trim(),
    areaCode: options.areaCode,
    contentTypeId: options.contentTypeId,
    numOfRows: options.numOfRows || DEFAULT_NUM_OF_ROWS,
    pageNo: options.pageNo || DEFAULT_PAGE_NO,
  };

  return callApi<TourItem[]>("/searchKeyword2", params);
}

/**
 * 관광지 상세 정보 조회 (공통 정보)
 * @param contentId - 콘텐츠 ID (필수)
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(contentId: string): Promise<TourDetail[]> {
  if (!contentId || contentId.trim().length === 0) {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }

  const params: Record<string, string> = {
    contentId: contentId.trim(),
  };

  return callApi<TourDetail[]>("/detailCommon2", params);
}

/**
 * 관광지 상세 정보 조회 (소개 정보)
 * @param contentId - 콘텐츠 ID (필수)
 * @param contentTypeId - 콘텐츠 타입 ID (필수)
 * @returns 운영 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string
): Promise<TourIntro[]> {
  if (!contentId || contentId.trim().length === 0) {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }
  if (!contentTypeId || contentTypeId.trim().length === 0) {
    throw new TourApiError("콘텐츠 타입 ID를 입력해주세요.");
  }

  const params: Record<string, string> = {
    contentId: contentId.trim(),
    contentTypeId: contentTypeId.trim(),
  };

  return callApi<TourIntro[]>("/detailIntro2", params);
}

/**
 * 관광지 이미지 목록 조회
 * @param contentId - 콘텐츠 ID (필수)
 * @returns 이미지 목록
 */
export async function getDetailImage(contentId: string): Promise<TourImage[]> {
  if (!contentId || contentId.trim().length === 0) {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }

  const params: Record<string, string> = {
    contentId: contentId.trim(),
  };

  return callApi<TourImage[]>("/detailImage2", params);
}

/**
 * 반려동물 동반 여행 정보 조회
 * @param contentId - 콘텐츠 ID (필수)
 * @returns 반려동물 동반 정보
 */
export async function getDetailPetTour(contentId: string): Promise<PetTourInfo[]> {
  if (!contentId || contentId.trim().length === 0) {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }

  const params: Record<string, string> = {
    contentId: contentId.trim(),
  };

  return callApi<PetTourInfo[]>("/detailPetTour2", params);
}

