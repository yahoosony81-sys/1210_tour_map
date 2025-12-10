/**
 * @file Footer.tsx
 * @description My Trip 프로젝트 푸터 컴포넌트
 *
 * 페이지 하단에 표시되는 푸터 컴포넌트입니다.
 * 저작권 정보, 링크, API 제공 표시를 포함합니다.
 */

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          {/* 저작권 정보 */}
          <div className="text-center md:text-left">
            <p>My Trip © 2025</p>
          </div>

          {/* 링크들 */}
          <div className="flex gap-6 items-center">
            {/* 향후 구현 예정 */}
            {/* <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link> */}
          </div>

          {/* API 제공 표시 */}
          <div className="text-center md:text-right">
            <p className="text-xs">한국관광공사 API 제공</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

