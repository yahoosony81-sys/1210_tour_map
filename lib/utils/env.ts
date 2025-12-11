/**
 * @file env.ts
 * @description 환경변수 검증 및 타입 안전한 접근 유틸리티
 *
 * 이 모듈은 프로젝트에서 사용하는 모든 환경변수를 체계적으로 관리하고,
 * 빌드 타임/런타임에 검증하여 누락된 환경변수로 인한 에러를 방지합니다.
 *
 * 주요 기능:
 * 1. 필수/선택 환경변수 목록 정의
 * 2. 타입 안전한 환경변수 접근
 * 3. 빌드 타임/런타임 검증
 * 4. 명확한 에러 메시지 제공
 *
 * @dependencies
 * - Next.js 15 (환경변수 처리)
 *
 * @see {@link /docs/PRD.md} - 환경변수 목록 참고
 * @see {@link /docs/ENV_SETUP.md} - 프로덕션 환경변수 설정 가이드
 */

// =====================================================
// 타입 정의
// =====================================================

/**
 * 환경변수 설정 인터페이스
 * 모든 환경변수를 타입 안전하게 접근할 수 있도록 정의
 */
export interface EnvConfig {
  // 한국관광공사 API
  tourApiKey: string; // NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY
  tourApiKeyPublic?: string; // NEXT_PUBLIC_TOUR_API_KEY (선택)
  tourApiKeyServer?: string; // TOUR_API_KEY (서버 전용, 선택)

  // 네이버 지도
  naverMapClientId?: string; // NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

  // Clerk 인증
  clerkPublishableKey?: string; // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  clerkSecretKey?: string; // CLERK_SECRET_KEY (서버 전용)

  // Supabase
  supabaseUrl?: string; // NEXT_PUBLIC_SUPABASE_URL
  supabaseAnonKey?: string; // NEXT_PUBLIC_SUPABASE_ANON_KEY
  supabaseServiceRoleKey?: string; // SUPABASE_SERVICE_ROLE_KEY (서버 전용)
  supabaseStorageBucket?: string; // NEXT_PUBLIC_STORAGE_BUCKET

  // 앱 설정
  appUrl?: string; // NEXT_PUBLIC_APP_URL (선택, 프로덕션 권장)
}

/**
 * 필수 환경변수 목록
 * 이 환경변수들은 프로젝트가 정상 작동하기 위해 반드시 필요합니다.
 */
export const REQUIRED_ENV_VARS = [
  {
    name: "NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY",
    description: "한국관광공사 API 키 (둘 중 하나 필수)",
    usage: "lib/api/tour-api.ts, lib/api/stats-api.ts, actions/tour-actions.ts",
    validate: () => {
      return !!(
        process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY
      );
    },
  },
  {
    name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    description: "Clerk 공개 키 (인증 기능)",
    usage: "app/layout.tsx (ClerkProvider)",
    validate: () => !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  {
    name: "CLERK_SECRET_KEY",
    description: "Clerk 비밀 키 (서버 전용)",
    usage: "middleware.ts, app/api/sync-user/route.ts",
    validate: () => !!process.env.CLERK_SECRET_KEY,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Supabase 프로젝트 URL",
    usage: "lib/supabase/*.ts",
    validate: () => !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Supabase Anon Key",
    usage: "lib/supabase/*.ts",
    validate: () => !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    description: "Supabase Service Role Key (서버 전용)",
    usage: "lib/supabase/service-role.ts",
    validate: () => !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
] as const;

/**
 * 선택 환경변수 목록
 * 이 환경변수들은 없어도 작동하지만, 일부 기능이 제한될 수 있습니다.
 */
export const OPTIONAL_ENV_VARS = [
  {
    name: "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID",
    description: "네이버 지도 클라이언트 ID",
    usage: "components/naver-map.tsx, components/tour-detail/detail-map.tsx",
    impact: "지도 기능이 작동하지 않습니다",
  },
  {
    name: "NEXT_PUBLIC_STORAGE_BUCKET",
    description: "Supabase Storage 버킷 이름",
    usage: "lib/supabase/*.ts (Storage 기능 사용 시)",
    impact: "Storage 기능이 작동하지 않습니다",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    description: "앱 기본 URL (프로덕션 권장)",
    usage: "app/layout.tsx, lib/utils/url.ts (절대 URL 생성)",
    impact: "상대 경로를 사용하며, Open Graph 메타태그가 제대로 작동하지 않을 수 있습니다",
  },
] as const;

// =====================================================
// 유틸리티 함수
// =====================================================

/**
 * 환경변수 설정 가져오기 (타입 안전)
 * 모든 환경변수를 한 번에 가져와서 타입 안전하게 접근할 수 있도록 합니다.
 *
 * @returns EnvConfig 객체
 */
export function getEnvConfig(): EnvConfig {
  return {
    tourApiKey:
      process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY || "",
    tourApiKeyPublic: process.env.NEXT_PUBLIC_TOUR_API_KEY,
    tourApiKeyServer: process.env.TOUR_API_KEY,
    naverMapClientId: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseStorageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };
}

/**
 * 환경변수 검증 (런타임)
 * 필수 환경변수가 모두 설정되어 있는지 확인합니다.
 *
 * @param throwOnError - 에러 발생 시 예외를 던질지 여부 (기본값: false)
 * @returns 검증 결과 (성공: true, 실패: false)
 * @throws 필수 환경변수가 누락된 경우 (throwOnError가 true일 때)
 */
export function validateEnv(throwOnError: boolean = false): boolean {
  const missingVars: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!envVar.validate()) {
      missingVars.push(envVar.name);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = buildErrorMessage(missingVars, "런타임");
    if (throwOnError) {
      throw new Error(errorMessage);
    }
    console.error(errorMessage);
    return false;
  }

  // 선택 환경변수 경고 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    for (const envVar of OPTIONAL_ENV_VARS) {
      const envValue = process.env[envVar.name];
      if (!envValue) {
        console.warn(
          `⚠️  선택 환경변수 누락: ${envVar.name}\n` +
            `   설명: ${envVar.description}\n` +
            `   영향: ${envVar.impact}\n` +
            `   사용 위치: ${envVar.usage}`
        );
      }
    }
  }

  return true;
}

/**
 * 필수 환경변수 검증 (빌드 타임)
 * Next.js 빌드 시 필수 환경변수가 모두 설정되어 있는지 확인합니다.
 * Server Component에서만 호출해야 합니다 (클라이언트 번들에 포함되지 않도록).
 *
 * @param isProduction - 프로덕션 빌드 여부
 * @throws 필수 환경변수가 누락된 경우
 */
export function checkRequiredEnv(isProduction: boolean = false): void {
  const missingVars: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!envVar.validate()) {
      missingVars.push(envVar.name);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = buildErrorMessage(
      missingVars,
      isProduction ? "프로덕션 빌드" : "개발 빌드"
    );

    if (isProduction) {
      // 프로덕션 빌드에서는 에러로 처리
      throw new Error(errorMessage);
    } else {
      // 개발 환경에서는 경고만 표시
      console.warn(errorMessage);
    }
  }
}

/**
 * 에러 메시지 생성
 * 누락된 환경변수 목록과 사용 위치를 포함한 명확한 에러 메시지를 생성합니다.
 *
 * @param missingVars - 누락된 환경변수 이름 배열
 * @param context - 에러 발생 컨텍스트 (런타임, 빌드 등)
 * @returns 에러 메시지
 */
function buildErrorMessage(missingVars: string[], context: string): string {
  const missingDetails = missingVars
    .map((varName) => {
      const envVar = REQUIRED_ENV_VARS.find((v) => v.name === varName);
      if (!envVar) return `  - ${varName}`;
      return `  - ${varName}\n    설명: ${envVar.description}\n    사용 위치: ${envVar.usage}`;
    })
    .join("\n\n");

  return (
    `\n❌ 필수 환경변수가 누락되었습니다 (${context})\n\n` +
    `누락된 환경변수:\n${missingDetails}\n\n` +
    `해결 방법:\n` +
    `1. .env 파일을 생성하고 필수 환경변수를 설정하세요\n` +
    `2. .env.example 파일을 참고하여 환경변수를 설정하세요\n` +
    `3. 프로덕션 배포 시 Vercel 대시보드에서 환경변수를 설정하세요\n` +
    `4. 자세한 내용은 docs/ENV_SETUP.md를 참고하세요\n`
  );
}

/**
 * 한국관광공사 API 키 가져오기
 * NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 중 하나를 반환합니다.
 *
 * @returns API 키
 * @throws API 키가 설정되지 않은 경우
 */
export function getTourApiKey(): string {
  const config = getEnvConfig();
  if (!config.tourApiKey) {
    throw new Error(
      "한국관광공사 API 키가 설정되지 않았습니다.\n" +
        "NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 설정하세요.\n" +
        "자세한 내용은 docs/ENV_SETUP.md를 참고하세요."
    );
  }
  return config.tourApiKey;
}

/**
 * 네이버 지도 클라이언트 ID 가져오기
 *
 * @returns 클라이언트 ID (없으면 undefined)
 */
export function getNaverMapClientId(): string | undefined {
  return getEnvConfig().naverMapClientId;
}

/**
 * Supabase 설정 가져오기
 *
 * @returns Supabase URL과 Anon Key
 * @throws 필수 환경변수가 누락된 경우
 */
export function getSupabaseConfig(): {
  url: string;
  anonKey: string;
} {
  const config = getEnvConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다.\n" +
        "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.\n" +
        "자세한 내용은 docs/ENV_SETUP.md를 참고하세요."
    );
  }
  return {
    url: config.supabaseUrl,
    anonKey: config.supabaseAnonKey,
  };
}

/**
 * Supabase Service Role Key 가져오기 (서버 전용)
 *
 * @returns Service Role Key
 * @throws Service Role Key가 설정되지 않은 경우
 */
export function getSupabaseServiceRoleKey(): string {
  const config = getEnvConfig();
  if (!config.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase Service Role Key가 설정되지 않았습니다.\n" +
        "SUPABASE_SERVICE_ROLE_KEY 환경변수를 설정하세요.\n" +
        "주의: 이 키는 서버 전용이며 클라이언트에 노출되면 안됩니다.\n" +
        "자세한 내용은 docs/ENV_SETUP.md를 참고하세요."
    );
  }
  return config.supabaseServiceRoleKey;
}

