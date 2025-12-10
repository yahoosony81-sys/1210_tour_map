/**
 * @file naver-map.ts
 * @description 네이버 지도 관련 유틸리티 함수
 *
 * 네이버 지도 길찾기 URL 생성 및 좌표 포맷팅 함수
 */

/**
 * 네이버 지도 길찾기 URL 생성
 * @param lat - 위도 (WGS84)
 * @param lng - 경도 (WGS84)
 * @returns 네이버 지도 길찾기 URL
 */
export function getNaverMapDirectionsUrl(lat: number, lng: number): string {
  return `https://map.naver.com/v5/directions/-/${lat},${lng}`;
}

/**
 * 좌표를 읽기 쉬운 형식으로 포맷팅
 * @param lat - 위도
 * @param lng - 경도
 * @returns 포맷팅된 좌표 문자열 (예: "37.5665°N, 126.9780°E")
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

