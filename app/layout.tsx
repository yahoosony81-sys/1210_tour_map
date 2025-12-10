import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

/**
 * Clerk 한국어 로컬라이제이션 설정
 * 
 * 기본 koKR 로컬라이제이션에 커스텀 에러 메시지를 추가하여
 * 더 나은 사용자 경험을 제공합니다.
 * 
 * 참고: Clerk 로컬라이제이션은 실험적 기능입니다.
 * 자세한 내용: https://clerk.com/docs/guides/customizing-clerk/localization
 */
const koreanLocalization = {
  ...koKR,
  // 커스텀 에러 메시지 한국어화
  unstable__errors: {
    ...koKR.unstable__errors,
    // 허용되지 않은 이메일 도메인 접근 시
    not_allowed_access:
      "접근 권한이 없습니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의해주세요.",
    // 잘못된 인증 정보
    form_identifier_not_found: "이메일 주소를 찾을 수 없습니다.",
    form_password_incorrect: "비밀번호가 올바르지 않습니다.",
    // 세션 만료
    session_exists: "이미 로그인되어 있습니다.",
    // 기타 일반적인 에러
    form_param_format_invalid: "입력 형식이 올바르지 않습니다.",
    form_param_nil: "필수 입력 항목이 누락되었습니다.",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koreanLocalization}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
