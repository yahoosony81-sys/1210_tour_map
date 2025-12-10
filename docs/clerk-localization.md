# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 안내합니다.

## 현재 설정

프로젝트에는 이미 한국어 로컬라이제이션이 적용되어 있습니다:

- **패키지**: `@clerk/localizations` (v3.26.3)
- **로케일**: `koKR` (한국어)
- **설정 위치**: `app/layout.tsx`

## 설정 방법

### 1. 기본 한국어 로컬라이제이션

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 2. 커스텀 에러 메시지 추가

기본 한국어 번역에 커스텀 에러 메시지를 추가할 수 있습니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

const koreanLocalization = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근 권한이 없습니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의해주세요.",
    form_identifier_not_found: "이메일 주소를 찾을 수 없습니다.",
    form_password_incorrect: "비밀번호가 올바르지 않습니다.",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koreanLocalization}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:

| 언어 | 키 | BCP 47 태그 |
|------|-----|-------------|
| 한국어 | `koKR` | ko-KR |
| 영어 (미국) | `enUS` | en-US |
| 영어 (영국) | `enGB` | en-GB |
| 일본어 | `jaJP` | ja-JP |
| 중국어 (간체) | `zhCN` | zh-CN |
| 중국어 (번체) | `zhTW` | zh-TW |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 커스터마이징 옵션

### 1. 특정 텍스트만 변경

```tsx
const localization = {
  ...koKR,
  formButtonPrimary: "시작하기",
  signUp: {
    start: {
      subtitle: "{{applicationName}}에 가입하세요",
    },
  },
};
```

### 2. 에러 메시지 커스터마이징

모든 에러 키는 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)의 `unstable__errors` 객체에서 확인할 수 있습니다.

```tsx
const localization = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    // 원하는 에러 메시지 추가
    not_allowed_access: "커스텀 에러 메시지",
  },
};
```

## 주의사항

### 실험적 기능

> ⚠️ **경고**: Clerk 로컬라이제이션은 현재 실험적(experimental) 기능입니다. 예상과 다르게 동작할 수 있으므로 주의가 필요합니다.

### 적용 범위

- ✅ **적용됨**: Clerk 컴포넌트의 모든 텍스트 (SignIn, SignUp, UserButton 등)
- ❌ **적용 안 됨**: Clerk Account Portal (호스팅된 사용자 관리 페이지는 영어로 유지)

## 문제 해결

### 로컬라이제이션이 적용되지 않음

1. **패키지 설치 확인**
   ```bash
   pnpm list @clerk/localizations
   ```

2. **import 확인**
   ```tsx
   import { koKR } from "@clerk/localizations";
   ```

3. **ClerkProvider 확인**
   ```tsx
   <ClerkProvider localization={koKR}>
   ```

### 특정 텍스트가 변경되지 않음

- 해당 텍스트가 커스터마이징 가능한 키인지 확인
- [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)에서 키 이름 확인

## 참고 자료

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [영어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)
- [한국어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/ko-KR.ts)

## 현재 프로젝트 설정

현재 프로젝트(`app/layout.tsx`)에는 다음이 설정되어 있습니다:

- ✅ 기본 한국어 로컬라이제이션 (`koKR`)
- ✅ 커스텀 에러 메시지 한국어화
- ✅ HTML lang 속성 (`lang="ko"`)

이 설정으로 모든 Clerk 컴포넌트가 한국어로 표시됩니다.

