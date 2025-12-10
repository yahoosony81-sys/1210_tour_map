/**
 * @file url.ts
 * @description URL 관련 유틸리티 함수
 *
 * URL을 안전하게 처리하는 유틸리티 함수들
 */

/**
 * 상대 경로를 절대 URL로 변환
 * Server Component에서 사용 (headers() 사용 가능)
 * Client Component에서는 window.location.href 사용
 *
 * @param path - 상대 경로 (예: "/places/125266")
 * @param host - 호스트 정보 (선택 사항, headers()에서 가져온 값)
 * @returns 절대 URL (예: "https://example.com/places/125266")
 */
export function getAbsoluteUrl(path: string, host?: string): string {
  // 환경변수에서 기본 URL 가져오기
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // path가 이미 절대 URL인 경우 그대로 반환
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // path가 /로 시작하지 않으면 추가
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // baseUrl이 있으면 사용
  if (baseUrl) {
    return `${baseUrl}${normalizedPath}`;
  }

  // host가 제공된 경우 사용 (Server Component에서 headers() 사용)
  if (host) {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${protocol}://${host}${normalizedPath}`;
  }

  // 기본값: localhost (개발 환경)
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000${normalizedPath}`;
  }

  // 프로덕션 환경에서 baseUrl도 host도 없으면 경고
  console.warn(
    "getAbsoluteUrl: NEXT_PUBLIC_APP_URL 환경변수가 설정되지 않았습니다. 상대 경로를 반환합니다."
  );
  return normalizedPath;
}

/**
 * 텍스트를 지정된 길이로 자르기 (HTML 태그 제거 후)
 *
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이 (기본값: 100)
 * @returns 잘린 텍스트
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return "";
  
  // HTML 태그 제거
  const plainText = text.replace(/<[^>]*>/g, "").trim();
  
  // 길이 제한
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // 마지막 공백에서 자르기 (단어 중간에서 자르지 않도록)
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

