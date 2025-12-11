/**
 * @file error-handler.ts
 * @description 에러 처리 유틸리티 함수
 *
 * 에러 객체를 사용자 친화적인 메시지로 변환하고,
 * 에러 타입을 분류하는 유틸리티 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 에러 메시지 변환 (getErrorMessage)
 * 2. 네트워크 에러 확인 (isNetworkError)
 * 3. API 에러 확인 (isApiError)
 * 4. 재시도 가능 여부 확인 (shouldRetry)
 *
 * @dependencies
 * - @/lib/api/tour-api: TourApiError 클래스
 */

import { TourApiError } from "@/lib/api/tour-api";

/**
 * 에러 객체를 사용자 친화적인 메시지로 변환
 * @param error - 에러 객체 (unknown 타입)
 * @returns 사용자 친화적인 에러 메시지
 */
export function getErrorMessage(error: unknown): string {
  // TourApiError인 경우 메시지 그대로 사용
  if (error instanceof TourApiError) {
    return error.message;
  }

  // Error 인스턴스인 경우
  if (error instanceof Error) {
    const message = error.message;

    // 네트워크 에러
    if (
      message.includes("네트워크") ||
      message.includes("fetch") ||
      message.includes("Failed to fetch") ||
      message.includes("NetworkError") ||
      message.includes("ERR_NETWORK")
    ) {
      return "네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.";
    }

    // 404 에러
    if (message.includes("404") || message.includes("Not Found")) {
      return "요청한 정보를 찾을 수 없습니다.";
    }

    // 500 에러
    if (message.includes("500") || message.includes("Internal Server Error")) {
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    // 일반 에러 메시지 반환
    return message || "오류가 발생했습니다.";
  }

  // 문자열인 경우
  if (typeof error === "string") {
    return error;
  }

  // 알 수 없는 에러
  return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

/**
 * 네트워크 에러인지 확인
 * @param error - 에러 객체 (unknown 타입)
 * @returns 네트워크 에러 여부
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("네트워크") ||
      message.includes("fetch") ||
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("err_network") ||
      message.includes("network request failed")
    );
  }
  return false;
}

/**
 * API 에러인지 확인 (TourApiError)
 * @param error - 에러 객체 (unknown 타입)
 * @returns API 에러 여부
 */
export function isApiError(error: unknown): boolean {
  return error instanceof TourApiError;
}

/**
 * 재시도 가능한 에러인지 확인
 * @param error - 에러 객체 (unknown 타입)
 * @returns 재시도 가능 여부
 */
export function shouldRetry(error: unknown): boolean {
  // 네트워크 에러는 재시도 가능
  if (isNetworkError(error)) {
    return true;
  }

  // TourApiError인 경우 statusCode 확인
  if (error instanceof TourApiError) {
    // 5xx 에러는 재시도 가능
    if (error.statusCode && error.statusCode >= 500) {
      return true;
    }
    // 일시적인 에러 코드는 재시도 가능
    const retryableCodes = ["SERVICE_ERROR", "TIMEOUT", "RATE_LIMIT"];
    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }
  }

  // 일반 Error인 경우 5xx 에러는 재시도 가능
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("500") || message.includes("503") || message.includes("504")) {
      return true;
    }
  }

  return false;
}

/**
 * 개발 환경에서만 상세 에러 정보 반환
 * @param error - 에러 객체 (unknown 타입)
 * @returns 상세 에러 정보 (개발 환경) 또는 null (프로덕션)
 */
export function getErrorDetails(error: unknown): string | null {
  // 프로덕션 환경에서는 null 반환
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // 개발 환경에서만 상세 정보 반환
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return String(error);
}

