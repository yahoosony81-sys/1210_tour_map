# 네이버 지도 API 도메인 등록 가이드

## 문제 상황

배포된 사이트에서 네이버 지도가 표시되지 않고 다음과 같은 에러가 발생합니다:

```
NAVER Maps JavaScript API v3
잠시 후에 다시 요청해 주세요.
Error Code / Error Message: 500 / Internal Server Error (내부 서버 오류)
```

## 원인

네이버 클라우드 플랫폼에서 **Web 서비스 URL**에 배포된 도메인이 등록되지 않았기 때문입니다.  
보안을 위해 네이버 지도 API는 등록된 도메인에서만 작동합니다.

## 해결 방법

### 1단계: 네이버 클라우드 플랫폼 콘솔 접속

1. [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com/)에 로그인합니다.
2. 좌측 메뉴에서 **Services** → **AI·NAVER API** → **Application**을 선택합니다.

### 2단계: 애플리케이션 선택

1. 사용 중인 애플리케이션을 클릭합니다.
2. **인증 정보** 탭에서 Client ID가 환경변수에 설정된 값과 일치하는지 확인합니다.

### 3단계: Web 서비스 URL 등록

1. **Web 서비스 URL** 섹션을 찾습니다.
2. **수정** 버튼을 클릭합니다.
3. 다음 도메인들을 추가합니다:

#### 필수 등록 도메인

| 도메인 | 설명 |
|--------|------|
| `http://localhost:3000` | 로컬 개발 환경 |
| `https://1210-tour-map.vercel.app` | Vercel 프로덕션 배포 |

#### 권장 추가 도메인 (미리보기 배포용)

Vercel의 미리보기 배포(Preview Deployment)를 사용한다면:

```
https://*.vercel.app
```

> ⚠️ **주의**: 와일드카드(`*`)를 지원하는 경우에만 위 형태로 등록 가능합니다.  
> 지원하지 않는 경우 미리보기 배포마다 개별 도메인을 등록해야 합니다.

### 4단계: 저장 및 확인

1. **저장** 버튼을 클릭합니다.
2. 변경 사항이 적용되는 데 **최대 5분**이 소요될 수 있습니다.
3. 배포된 사이트를 새로고침하여 지도가 정상적으로 표시되는지 확인합니다.

## 확인 방법

### 브라우저 개발자 도구에서 확인

1. 배포된 사이트에서 `F12`를 눌러 개발자 도구를 엽니다.
2. **Console** 탭을 확인합니다.
3. 다음 에러가 없어야 합니다:
   - `500 / Internal Server Error`
   - `Cannot read properties of null (reading 'KVO')`

### 네트워크 탭에서 확인

1. **Network** 탭을 엽니다.
2. `maps.js` 파일 요청을 찾습니다.
3. Status가 `200`이어야 합니다.

## 문제가 지속되는 경우

### 1. 캐시 삭제

브라우저 캐시를 삭제하고 다시 시도합니다:
- Chrome: `Ctrl + Shift + Delete` → 캐시된 이미지 및 파일 삭제

### 2. 환경변수 확인

Vercel 대시보드에서 환경변수가 올바르게 설정되었는지 확인합니다:

```
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
```

### 3. 재배포

환경변수를 변경한 후에는 **재배포**가 필요합니다:

```bash
# Vercel CLI 사용 시
vercel --prod

# 또는 GitHub에 push하면 자동 배포
git push origin main
```

### 4. API 사용량 확인

네이버 클라우드 플랫폼에서 API 사용량 한도를 초과하지 않았는지 확인합니다.

## 관련 문서

- [네이버 클라우드 플랫폼 Maps API 가이드](https://api.ncloud-docs.com/docs/ai-naver-mapsdirections)
- [환경변수 설정 가이드](./ENV_SETUP.md)
- [배포 체크리스트](./DEPLOY_CHECKLIST.md)

