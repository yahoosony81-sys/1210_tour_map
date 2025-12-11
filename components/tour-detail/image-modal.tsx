/**
 * @file image-modal.tsx
 * @description 전체화면 이미지 뷰어 모달 컴포넌트
 *
 * 이미지를 전체화면으로 보여주는 모달 컴포넌트입니다.
 * 이미지 슬라이드 기능과 키보드 네비게이션을 제공합니다.
 *
 * 주요 기능:
 * 1. 전체화면 이미지 뷰어 모달
 * 2. 이미지 슬라이드 기능 (이전/다음 버튼)
 * 3. 키보드 네비게이션 (좌우 화살표 키, ESC 키)
 * 4. 이미지 인덱스 표시 (예: "1 / 5")
 * 5. 닫기 버튼
 *
 * @dependencies
 * - @/components/ui/dialog: Dialog 컴포넌트
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 * - @/lib/types/tour: TourImage 타입
 */

"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TourImage } from "@/lib/types/tour";

interface ImageModalProps {
  /** 이미지 목록 (url 필드가 추가된 TourImage 배열) */
  images: (TourImage & { url: string })[];
  /** 시작 이미지 인덱스 */
  initialIndex: number;
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 열림 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
}

/**
 * 전체화면 이미지 뷰어 모달 컴포넌트
 */
export function ImageModal({
  images,
  initialIndex,
  open,
  onOpenChange,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // initialIndex가 변경되면 currentIndex 업데이트
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, open]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, currentIndex, images.length]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentImage = images[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === images.length - 1;

  if (!currentImage) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/90" />
      <DialogContent className="max-w-full h-screen w-screen p-0 border-0 bg-transparent translate-x-0 translate-y-0 top-0 left-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/50 text-white hover:bg-black/70 rounded-full"
          onClick={() => onOpenChange(false)}
          aria-label="닫기"
        >
          <X className="size-6" />
        </Button>

        {/* 이미지 컨테이너 */}
        <div className="relative flex items-center justify-center w-full h-full">
          {/* 이전 버튼 */}
          {!isFirst && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 bg-black/50 text-white hover:bg-black/70 rounded-full h-12 w-12"
              onClick={handlePrevious}
              aria-label="이전 이미지"
            >
              <ChevronLeft className="size-6" />
            </Button>
          )}

          {/* 이미지 */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
              <SafeImage
                src={currentImage.url}
                alt={`관광지 이미지 ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
                fallbackSrc="/og-image.png"
              />
            </div>
          </div>

          {/* 다음 버튼 */}
          {!isLast && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 bg-black/50 text-white hover:bg-black/70 rounded-full h-12 w-12"
              onClick={handleNext}
              aria-label="다음 이미지"
            >
              <ChevronRight className="size-6" />
            </Button>
          )}

          {/* 이미지 인덱스 표시 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

