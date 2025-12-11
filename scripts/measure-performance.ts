/**
 * @file measure-performance.ts
 * @description Lighthouse 성능 측정 스크립트
 *
 * 로컬 개발 서버에서 Lighthouse를 실행하여 성능 점수를 측정합니다.
 * 결과는 JSON과 HTML 형식으로 저장됩니다.
 *
 * 사용법:
 * 1. 개발 서버 실행: pnpm dev
 * 2. 다른 터미널에서: pnpm tsx scripts/measure-performance.ts
 */

import { execSync } from "child_process";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const OUTPUT_DIR = join(process.cwd(), "lighthouse-reports");

// 측정할 페이지 목록
const PAGES = [
  { path: "/", name: "homepage" },
  { path: "/stats", name: "stats" },
  { path: "/bookmarks", name: "bookmarks" },
  // 상세페이지는 동적이므로 샘플 contentId 필요
  // { path: "/places/125266", name: "place-detail" },
];

interface LighthouseResult {
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp?: number;
  fid?: number;
  cls?: number;
}

async function measurePage(path: string, name: string): Promise<LighthouseResult> {
  const url = `${BASE_URL}${path}`;
  const outputPath = join(OUTPUT_DIR, `${name}-report.json`);
  const htmlPath = join(OUTPUT_DIR, `${name}-report.html`);

  console.log(`\n📊 측정 중: ${url}`);

  try {
    // Lighthouse 실행
    const command = `lighthouse "${url}" --output json --output html --output-path "${outputPath}" --chrome-flags="--headless" --quiet`;
    execSync(command, { stdio: "inherit" });

    // JSON 결과 읽기
    const report = JSON.parse(readFileSync(outputPath, "utf-8"));

    const result: LighthouseResult = {
      url,
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      bestPractices: Math.round(report.categories["best-practices"].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
    };

    // Core Web Vitals
    const metrics = report.audits;
    if (metrics["largest-contentful-paint"]) {
      result.lcp = Math.round(metrics["largest-contentful-paint"].numericValue);
    }
    if (metrics["first-input-delay"]) {
      result.fid = Math.round(metrics["first-input-delay"].numericValue);
    }
    if (metrics["cumulative-layout-shift"]) {
      result.cls = Math.round(metrics["cumulative-layout-shift"].numericValue * 100) / 100;
    }

    console.log(`✅ 완료: ${name}`);
    console.log(`   Performance: ${result.performance}/100`);
    console.log(`   LCP: ${result.lcp}ms`);
    console.log(`   FID: ${result.fid}ms`);
    console.log(`   CLS: ${result.cls}`);

    return result;
  } catch (error) {
    console.error(`❌ 오류 발생: ${name}`, error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Lighthouse 성능 측정 시작");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📁 출력 디렉토리: ${OUTPUT_DIR}`);

  // 출력 디렉토리 생성
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const results: LighthouseResult[] = [];

  // 각 페이지 측정
  for (const page of PAGES) {
    try {
      const result = await measurePage(page.path, page.name);
      results.push(result);
    } catch (error) {
      console.error(`페이지 측정 실패: ${page.name}`, error);
    }
  }

  // 요약 리포트 생성
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
    summary: {
      averagePerformance: Math.round(
        results.reduce((sum, r) => sum + r.performance, 0) / results.length
      ),
      averageLCP: Math.round(
        results.reduce((sum, r) => sum + (r.lcp || 0), 0) / results.length
      ),
      averageFID: Math.round(
        results.reduce((sum, r) => sum + (r.fid || 0), 0) / results.length
      ),
      averageCLS: Math.round(
        (results.reduce((sum, r) => sum + (r.cls || 0), 0) / results.length) * 100
      ) / 100,
    },
  };

  // 요약 리포트 저장
  const summaryPath = join(OUTPUT_DIR, "summary.json");
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log("\n📈 측정 완료!");
  console.log(`\n📊 요약:`);
  console.log(`   평균 Performance: ${summary.summary.averagePerformance}/100`);
  console.log(`   평균 LCP: ${summary.summary.averageLCP}ms`);
  console.log(`   평균 FID: ${summary.summary.averageFID}ms`);
  console.log(`   평균 CLS: ${summary.summary.averageCLS}`);
  console.log(`\n📁 리포트 저장 위치: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("❌ 스크립트 실행 실패:", error);
  process.exit(1);
});

