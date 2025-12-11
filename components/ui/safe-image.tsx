/**
 * @file safe-image.tsx
 * @description 안전한 이미지 컴포넌트
 *
 * 이미지 로드 실패 시 자동으로 기본 이미지로 대체하는 Next.js Image 래퍼 컴포넌트
 *
 * @dependencies
 * - next/image: Next.js Image 컴포넌트
 * - react: useState, useEffect
 */

"use client";

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  /** 이미지 URL */
  src: string;
  /** 기본 이미지 URL (로드 실패 시 사용) */
  fallbackSrc?: string;
}

/**
 * 안전한 이미지 컴포넌트
 * 이미지 로드 실패 시 자동으로 기본 이미지로 대체합니다.
 * 
 * Next.js Image 컴포넌트는 onError를 직접 지원하지 않으므로,
 * 내부 img 요소에 이벤트 리스너를 추가하는 방식으로 처리합니다.
 */
export function SafeImage({
  src,
  fallbackSrc = "/og-image.png",
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // src가 변경되면 에러 상태 초기화
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  // 이미지 로드 실패 처리
  useEffect(() => {
    if (hasError || imgSrc === fallbackSrc) return;

    const img = new window.Image();
    img.onerror = () => {
      if (!hasError && imgSrc !== fallbackSrc) {
        setHasError(true);
        setImgSrc(fallbackSrc);
      }
    };
    img.src = imgSrc;

    return () => {
      img.onerror = null;
    };
  }, [imgSrc, fallbackSrc, hasError]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "이미지"}
    />
  );
}

