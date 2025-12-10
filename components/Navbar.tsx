"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "홈" },
    { href: "/stats", label: "통계" },
    { href: "/bookmarks", label: "북마크" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            My Trip
          </Link>

          {/* 네비게이션 링크 (데스크톱) */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground/80",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            {/* 검색 아이콘 (모바일) */}
            <button
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* 북마크 링크 (모바일, 로그인한 사용자만) */}
            <SignedIn>
              <Link
                href="/bookmarks"
                className="md:hidden text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                북마크
              </Link>
            </SignedIn>

            {/* 인증 버튼 */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm">로그인</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
