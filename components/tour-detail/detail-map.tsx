/**
 * @file detail-map.tsx
 * @description 관광지 상세페이지 지도 섹션 컴포넌트
 *
 * 단일 관광지의 위치를 네이버 지도에 표시하고, 길찾기 기능을 제공하는 Client Component입니다.
 *
 * 주요 기능:
 * 1. Naver Maps API v3 초기화
 * 2. 단일 관광지 위치를 마커로 표시
 * 3. 길찾기 버튼 (네이버 지도 앱/웹 연동)
 * 4. 좌표 정보 표시 및 복사 기능
 *
 * @dependencies
 * - @/lib/types/tour: TourDetail 타입, convertKATECToWGS84 함수, CONTENT_TYPE_ID
 * - @/lib/utils/naver-map: getNaverMapDirectionsUrl, formatCoordinates 함수
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/loading: Loading 컴포넌트
 * - @/components/ui/error: Error 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { convertKATECToWGS84, CONTENT_TYPE_ID, type ContentTypeId } from "@/lib/types/tour";
import { getNaverMapDirectionsUrl, formatCoordinates } from "@/lib/utils/naver-map";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DetailMapProps {
  /** 관광지 콘텐츠 ID */
  contentId: string;
  /** 관광지명 */
  title: string;
  /** 주소 */
  address: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
  /** 관광 타입 ID (마커 색상용) */
  contentTypeId?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광 타입별 마커 색상 매핑
 */
const MARKER_COLORS: Record<ContentTypeId, string> = {
  [CONTENT_TYPE_ID.TOURIST_SPOT]: "#3B82F6", // 파란색 - 관광지
  [CONTENT_TYPE_ID.CULTURAL_FACILITY]: "#8B5CF6", // 보라색 - 문화시설
  [CONTENT_TYPE_ID.FESTIVAL]: "#F59E0B", // 주황색 - 축제/행사
  [CONTENT_TYPE_ID.TOUR_COURSE]: "#10B981", // 초록색 - 여행코스
  [CONTENT_TYPE_ID.LEISURE_SPORTS]: "#EF4444", // 빨간색 - 레포츠
  [CONTENT_TYPE_ID.ACCOMMODATION]: "#6366F1", // 인디고색 - 숙박
  [CONTENT_TYPE_ID.SHOPPING]: "#EC4899", // 핑크색 - 쇼핑
  [CONTENT_TYPE_ID.RESTAURANT]: "#F97316", // 오렌지색 - 음식점
};

/**
 * 관광 타입에 따른 마커 색상 가져오기
 */
function getMarkerColor(contentTypeId?: string): string {
  return contentTypeId
    ? MARKER_COLORS[contentTypeId as ContentTypeId] || "#6B7280"
    : "#6B7280"; // 기본 회색
}

/**
 * HTML 마커 생성 (커스텀 색상)
 */
function createHTMLMarker(color: string, title: string): string {
  return `
    <div style="
      width: 32px;
      height: 32px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    " title="${title}">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `;
}

/**
 * 관광지 상세페이지 지도 컴포넌트
 */
export function DetailMap({
  contentId,
  title,
  address,
  mapx,
  mapy,
  contentTypeId,
  className,
}: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 좌표 변환
  useEffect(() => {
    try {
      const coords = convertKATECToWGS84(mapx, mapy);
      if (!coords) {
        console.warn(
          `좌표 변환 실패: ${title} (mapx: ${mapx}, mapy: ${mapy})`
        );
      }
      setCoordinates(coords);
    } catch (error) {
      console.error("좌표 변환 에러:", error);
      setCoordinates(null);
    }
  }, [mapx, mapy, title]);

  // Naver Maps API 스크립트 로드
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

    if (!clientId) {
      console.error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 설정되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    // 이미 스크립트가 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      setIsScriptLoaded(true);
      setIsLoading(false);
      return;
    }

    // 스크립트가 이미 로드 중인지 확인
    const existingScript = document.querySelector(
      `script[src*="oapi.map.naver.com"]`
    );
    if (existingScript) {
      // 스크립트가 이미 있으면 로드 완료를 기다림
      const checkInterval = setInterval(() => {
        if (window.naver && window.naver.maps) {
          setIsScriptLoaded(true);
          setIsLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);

      // 최대 5초 대기
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.naver || !window.naver.maps) {
          console.error("네이버 지도 API 스크립트 로드 시간 초과");
          setIsLoading(false);
        }
      }, 5000);

      return () => clearInterval(checkInterval);
    }

    // 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      console.error("네이버 지도 API 스크립트 로드 실패");
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 컴포넌트에서도 사용 가능)
    };
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || !window.naver?.maps || !coordinates) {
      return;
    }

    const naver = window.naver;
    const { maps } = naver;

    // 지도 초기화
    if (!mapInstanceRef.current) {
      const map = new maps.Map(mapRef.current, {
        center: new maps.LatLng(coordinates.lat, coordinates.lng),
        zoom: 15, // 상세 위치 표시에 적합한 줌 레벨
        zoomControl: true,
        zoomControlOptions: {
          position: maps.Position.TOP_RIGHT,
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: maps.Position.TOP_RIGHT,
        },
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // 기존 마커 및 인포윈도우 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 마커 생성
    try {
      const position = new maps.LatLng(coordinates.lat, coordinates.lng);
      const markerColor = getMarkerColor(contentTypeId);

      let marker;

      // HtmlIcon이 사용 가능한지 확인
      if (maps.HtmlIcon && typeof maps.HtmlIcon === "function") {
        // HtmlIcon이 있으면 커스텀 HTML 마커 사용
        const markerHTML = createHTMLMarker(markerColor, title);

        const htmlIcon = new maps.HtmlIcon({
          html: markerHTML,
          anchor: new maps.Point(16, 16), // 마커 중심점
        });

        marker = new maps.Marker({
          position: position,
          map: map,
          title: title,
          icon: htmlIcon,
        });
      } else {
        // HtmlIcon이 없으면 일반 마커 사용 (기본 마커)
        console.warn("HtmlIcon을 사용할 수 없어 기본 마커를 사용합니다.");
        marker = new maps.Marker({
          position: position,
          map: map,
          title: title,
        });
      }

      // 인포윈도우 생성
      const infoContent = `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${title}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${address}</p>
        </div>
      `;

      const infoWindow = new maps.InfoWindow({
        content: infoContent,
      });

      // 마커 클릭 이벤트
      maps.Event.addListener(marker, "click", () => {
        infoWindow.open(map, marker);
      });

      // 마커 클릭 시 인포윈도우 자동 열기
      infoWindow.open(map, marker);

      markerRef.current = marker;
      infoWindowRef.current = infoWindow;
    } catch (error) {
      console.error("마커 생성 실패:", error);
    }
  }, [isScriptLoaded, coordinates, title, address, contentTypeId]);

  // 좌표 복사 기능
  const handleCopyCoordinates = async () => {
    if (!coordinates) return;

    const coordText = formatCoordinates(coordinates.lat, coordinates.lng);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(coordText);
        setIsCopied(true);
        toast.success("좌표가 복사되었습니다");
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Fallback: 구형 브라우저 지원
        const textArea = document.createElement("textarea");
        textArea.value = coordText;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsCopied(true);
        toast.success("좌표가 복사되었습니다");
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error("좌표 복사 실패:", error);
      toast.error("좌표 복사에 실패했습니다");
    }
  };

  // 길찾기 URL 생성
  const directionsUrl = coordinates
    ? getNaverMapDirectionsUrl(coordinates.lat, coordinates.lng)
    : null;

  // 좌표 정보 없음 처리 (원본 좌표가 없거나 변환 실패)
  if (!mapx || !mapy || (isScriptLoaded && !isLoading && !coordinates)) {
    return (
      <section className={cn("mb-6 md:mb-8", className)}>
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">위치</h2>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-muted p-8 text-center text-muted-foreground">
          <MapPin className="size-8" aria-hidden="true" />
          <p className="font-medium">위치 정보가 없습니다</p>
          <p className="text-xs">
            {!mapx || !mapy
              ? "이 관광지의 위치 정보가 제공되지 않았습니다."
              : "좌표 정보가 유효하지 않아 지도를 표시할 수 없습니다."}
          </p>
        </div>
      </section>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <section className={cn("mb-6 md:mb-8", className)}>
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">위치</h2>
        <div
          className={cn(
            "flex items-center justify-center bg-muted rounded-lg",
            "h-[400px] md:h-[500px]"
          )}
        >
          <Loading text="지도를 불러오는 중..." />
        </div>
      </section>
    );
  }

  // 에러 상태 (스크립트 로드 실패 또는 API 키 없음)
  if (!isScriptLoaded || !process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID) {
    return (
      <section className={cn("mb-6 md:mb-8", className)}>
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">위치</h2>
        <Error
          message={
            !process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
              ? "지도 API 키가 설정되지 않았습니다."
              : "지도를 불러올 수 없습니다."
          }
          size="medium"
        />
      </section>
    );
  }

  return (
    <section className={cn("mb-6 md:mb-8", className)}>
      <h2 className="mb-4 text-xl font-semibold md:text-2xl">위치</h2>

      {/* 지도 컨테이너 */}
      <div className="relative w-full rounded-lg overflow-hidden mb-4">
        <div
          ref={mapRef}
          className={cn("w-full rounded-lg", "h-[400px] md:h-[500px]")}
          id={`detail-map-${contentId}`}
        />
      </div>

      {/* 길찾기 버튼 및 좌표 정보 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 길찾기 버튼 */}
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto min-h-[44px] min-w-[44px]"
              aria-label="네이버 지도에서 길찾기"
            >
              <Navigation className="mr-2 size-4" />
              길찾기
            </Button>
          </a>
        )}

        {/* 좌표 정보 */}
        {coordinates && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            <span className="font-mono">{formatCoordinates(coordinates.lat, coordinates.lng)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCoordinates}
              className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]"
              aria-label="좌표 복사"
              title="좌표 복사"
            >
              {isCopied ? (
                <Check className="size-4 text-green-600" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// Naver Maps API 타입 선언
declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement | string, options?: any) => any;
        LatLng: new (lat: number, lng: number) => any;
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
      };
    };
  }
}

