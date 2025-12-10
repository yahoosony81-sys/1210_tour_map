/**
 * @file image.ts
 * @description 이미지 관련 유틸리티 함수
 *
 * 이미지 URL을 안전하게 처리하는 유틸리티 함수들
 */

/**
 * 이미지 URL을 HTTPS로 변환
 * 한국관광공사 API가 일부 이미지를 HTTP로 제공하는 경우를 대비
 *
 * @param url - 이미지 URL
 * @returns HTTPS로 변환된 URL
 */
export function ensureHttps(url: string): string {
  if (!url) return url;
  
  // HTTP로 시작하는 경우 HTTPS로 변환
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  
  return url;
}

/**
 * 이미지 URL이 유효한지 확인
 *
 * @param url - 이미지 URL
 * @returns 유효한 URL인지 여부
 */
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

