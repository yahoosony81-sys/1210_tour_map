/**
 * @file naver-maps.d.ts
 * @description Naver Maps API 전역 타입 선언
 *
 * 네이버 지도 API의 Window 전역 타입을 정의합니다.
 * 여러 컴포넌트에서 중복 선언을 방지하기 위해 단일 파일로 관리합니다.
 */

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement | string, options?: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        LatLngBounds: new () => any;
        Marker: new (options?: any) => any;
        InfoWindow: new (options?: any) => any;
        HtmlIcon: new (options?: any) => any;
        Point: new (x: number, y: number) => any;
        Event: {
          addListener: (target: any, type: string, listener: () => void) => void;
        };
        Position: {
          TOP_RIGHT: any;
        };
        MapTypeId: {
          NORMAL: string;
          SATELLITE: string;
        };
      };
    };
  }
}

export {};

