/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 네이버 클라우드 플랫폼(NCP) Maps API v3를 사용하여 관광지 목록을 지도에 마커로 표시합니다.
 *
 * 주요 기능:
 * 1. Naver Maps API v3 초기화
 * 2. 관광지 목록을 마커로 표시
 * 3. 마커 클릭 시 인포윈도우 표시
 * 4. 지도-리스트 연동 (특정 관광지로 이동)
 * 5. 지도 컨트롤 (줌, 지도 유형)
 * 6. 반응형 레이아웃 지원
 *
 * @dependencies
 * - @/lib/types/tour: TourItem 타입, convertKATECToWGS84 함수
 * - @/components/ui/loading: Loading 컴포넌트
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapIcon, Satellite, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourItem, ContentTypeId } from "@/lib/types/tour";
import { convertKATECToWGS84, CONTENT_TYPE_ID } from "@/lib/types/tour";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 관광지 ID (리스트에서 클릭한 관광지) */
  selectedContentId?: string | null;
  /** 호버된 관광지 ID (리스트에서 호버한 관광지) */
  hoveredContentId?: string | null;
  /** 선택된 관광지 변경 핸들러 */
  onTourSelect?: (contentId: string | null) => void;
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
function getMarkerColor(contentTypeId: string): string {
  return MARKER_COLORS[contentTypeId as ContentTypeId] || "#6B7280"; // 기본 회색
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
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours,
  selectedContentId,
  hoveredContentId,
  onTourSelect,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal");

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
    if (!isScriptLoaded || !mapRef.current || !window.naver?.maps) {
      return;
    }

    const naver = window.naver;
    const { maps } = naver;

    // 관광지가 없으면 지도 초기화하지 않음
    if (tours.length === 0) {
      return;
    }

    // 좌표 변환 및 중심 좌표 계산
    const positions = tours
      .map((tour) => {
        try {
          return convertKATECToWGS84(tour.mapx, tour.mapy);
        } catch {
          return null;
        }
      })
      .filter((pos): pos is { lng: number; lat: number } => pos !== null);

    if (positions.length === 0) {
      return;
    }

    // 중심 좌표 계산 (모든 마커의 평균)
    const centerLat = positions.reduce((sum, pos) => sum + pos.lat, 0) / positions.length;
    const centerLng = positions.reduce((sum, pos) => sum + pos.lng, 0) / positions.length;

    // 지도 초기화
    if (!mapInstanceRef.current) {
      const map = new maps.Map(mapRef.current, {
        center: new maps.LatLng(centerLat, centerLng),
        zoom: 13,
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
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // 마커 및 인포윈도우 생성
    tours.forEach((tour, index) => {
      try {
        const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
        const position = new maps.LatLng(lat, lng);

        // 관광 타입별 마커 색상 가져오기
        const markerColor = getMarkerColor(tour.contenttypeid);
        const markerHTML = createHTMLMarker(markerColor, tour.title);

        // HTML 마커 아이콘 생성
        const htmlIcon = new maps.HtmlIcon({
          html: markerHTML,
          anchor: new maps.Point(16, 16), // 마커 중심점
        });

        // 마커 생성
        const marker = new maps.Marker({
          position: position,
          map: map,
          title: tour.title,
          icon: htmlIcon,
        });

        // 인포윈도우 생성
        const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;
        const infoContent = `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${tour.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${address}</p>
            <a href="/places/${tour.contentid}" style="display: inline-block; padding: 6px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">상세보기</a>
          </div>
        `;

        const infoWindow = new maps.InfoWindow({
          content: infoContent,
        });

        // 마커 클릭 이벤트
        maps.Event.addListener(marker, "click", () => {
          // 다른 인포윈도우 닫기
          infoWindowsRef.current.forEach((iw) => iw.close());

          // 현재 인포윈도우 열기
          infoWindow.open(map, marker);

          // 리스트 연동: 선택된 관광지로 스크롤
          if (onTourSelect) {
            onTourSelect(tour.contentid);
          }
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      } catch (error) {
        console.error(`마커 생성 실패 (${tour.title}):`, error);
      }
    });

    // 모든 마커가 보이도록 bounds 조정
    if (positions.length > 0) {
      const bounds = new maps.LatLngBounds();
      positions.forEach((pos) => {
        bounds.extend(new maps.LatLng(pos.lat, pos.lng));
      });
      map.fitBounds(bounds);
    }
  }, [isScriptLoaded, tours, onTourSelect]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (!selectedContentId || !mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const tour = tours.find((t) => t.contentid === selectedContentId);
    if (!tour) {
      return;
    }

    try {
      const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
      const position = new window.naver.maps.LatLng(lat, lng);

      // 지도 이동
      mapInstanceRef.current.panTo(position);

      // 해당 마커의 인포윈도우 열기
      const markerIndex = tours.findIndex((t) => t.contentid === selectedContentId);
      if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
        // 다른 인포윈도우 닫기
        infoWindowsRef.current.forEach((iw) => iw.close());

        // 현재 인포윈도우 열기
        if (markersRef.current[markerIndex]) {
          infoWindowsRef.current[markerIndex].open(
            mapInstanceRef.current,
            markersRef.current[markerIndex]
          );
        }
      }
    } catch (error) {
      console.error("지도 이동 실패:", error);
    }
  }, [selectedContentId, tours]);

  // 호버된 관광지로 마커 강조
  useEffect(() => {
    if (!hoveredContentId || !mapInstanceRef.current || !window.naver?.maps) {
      // 호버 해제 시 모든 인포윈도우 닫기 (선택된 것이 있으면 제외)
      if (!selectedContentId) {
        infoWindowsRef.current.forEach((iw) => iw.close());
      }
      return;
    }

    const tour = tours.find((t) => t.contentid === hoveredContentId);
    if (!tour) {
      return;
    }

    try {
      const markerIndex = tours.findIndex((t) => t.contentid === hoveredContentId);
      if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
        // 다른 인포윈도우 닫기 (선택된 것은 제외)
        infoWindowsRef.current.forEach((iw, index) => {
          if (index !== markerIndex && tours[index]?.contentid !== selectedContentId) {
            iw.close();
          }
        });

        // 호버된 마커의 인포윈도우 미리보기로 표시
        if (markersRef.current[markerIndex]) {
          infoWindowsRef.current[markerIndex].open(
            mapInstanceRef.current,
            markersRef.current[markerIndex]
          );
        }
      }
    } catch (error) {
      console.error("마커 강조 실패:", error);
    }
  }, [hoveredContentId, tours, selectedContentId]);

  // 현재 위치로 이동
  const handleCurrentLocation = () => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const { maps } = window.naver;
        const location = new maps.LatLng(latitude, longitude);

        // 지도 이동
        mapInstanceRef.current.panTo(location);
        mapInstanceRef.current.setZoom(15);
      },
      (error) => {
        console.error("위치 정보 가져오기 실패:", error);
        alert("위치 정보를 가져올 수 없습니다.");
      }
    );
  };

  // 지도 유형 변경
  const handleMapTypeChange = (type: "normal" | "satellite") => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const { maps } = window.naver;
    const mapTypeId = type === "satellite" ? maps.MapTypeId.SATELLITE : maps.MapTypeId.NORMAL;
    mapInstanceRef.current.setMapTypeId(mapTypeId);
    setMapType(type);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          "h-[400px] md:h-[600px]",
          className
        )}
      >
        <Loading text="지도를 불러오는 중..." />
      </div>
    );
  }

  // 에러 상태 (스크립트 로드 실패 또는 API 키 없음)
  if (!isScriptLoaded || !process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg text-muted-foreground",
          "h-[400px] md:h-[600px]",
          className
        )}
      >
        <p>지도를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full rounded-lg overflow-hidden", className)}>
      {/* 지도 컨트롤 버튼들 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* 현재 위치 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCurrentLocation}
          className="bg-white/90 hover:bg-white"
          title="현재 위치로 이동"
        >
          <Navigation className="h-4 w-4" />
        </Button>

        {/* 지도 유형 선택 버튼 */}
        <div className="flex gap-2">
          <Button
            variant={mapType === "normal" ? "default" : "outline"}
            size="sm"
            onClick={() => handleMapTypeChange("normal")}
            className="bg-white/90 hover:bg-white"
            title="일반 지도"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={mapType === "satellite" ? "default" : "outline"}
            size="sm"
            onClick={() => handleMapTypeChange("satellite")}
            className="bg-white/90 hover:bg-white"
            title="위성 지도"
          >
            <Satellite className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 지도 컨테이너 */}
      <div
        ref={mapRef}
        className={cn("w-full rounded-lg", "h-[400px] md:h-[600px]")}
        id="naver-map"
      />
    </div>
  );
}

// Naver Maps API 타입 선언
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

