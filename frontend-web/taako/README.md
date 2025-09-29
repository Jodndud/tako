This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Firebase Cloud Messaging (웹푸시)

이 프로젝트는 웹 푸시 알림을 위해 Firebase Cloud Messaging(FCM)을 사용합니다. 사용자는 마이페이지 > 내 정보 수정 화면 상단의 "푸시 알림" 스위치를 통해 알림을 활성/비활성화할 수 있습니다.

### 1. 환경 변수 설정

루트 `.env` 파일에 아래 값을 추가/수정하세요. (배포 환경에선 각 환경 전용 Secret 관리 권장)

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

### 2. 의존성 설치

```bash
npm i firebase
```

### 3. Service Worker

`public/firebase-messaging-sw.js` 가 포함되어 있으며, 빌드 시 자동 서빙됩니다.
Vercel 또는 프록시 환경에서 경로가 루트(`/`) 에 위치해야 하므로 위치를 변경하지 마세요.

### 4. 주요 파일 및 로직

- `lib/firebase.ts` : Firebase App & Messaging 초기화
- `lib/fcm.ts` : 토큰 생성/삭제, 권한 요청, 상태조회 API 연동
- `stores/usePushStore.ts` : 알림 상태/토큰/활성화 여부 zustand 스토어
- `app/mypage/edit/page.tsx` : UI 스위치 + 활성화/비활성 로직 연동

### 5. 백엔드 연동 엔드포인트 (예시)

| 목적            | 메서드 | 경로                                            |
| --------------- | ------ | ----------------------------------------------- |
| 토큰 등록       | POST   | `/v1/fcm/token?memberId={id}`                   |
| 단일기기 재설정 | POST   | `/v1/fcm/token/reset?memberId={id}`             |
| 상태 조회       | GET    | `/v1/fcm/status?memberId={id}&currentToken=...` |
| 테스트 푸시     | POST   | `/v1/fcm/test/{memberId}`                       |

### 6. 권한 흐름

1. 스위치 ON → Notification 권한 요청 (`granted` 아닐 시 중단)
2. FCM token 발급 (VAPID 사용)
3. 백엔드 `/token` 등록
4. 상태 재조회 → UI 반영

### 7. 디버깅 팁

- 크롬 DevTools Application > Service Workers 에서 `firebase-messaging-sw.js` 등록 여부 확인
- 브라우저 콘솔 `[FCM]` 로그 확인
- 토큰이 등록되지 않는 경우: VAPID Key 불일치 / 권한 거부 / service worker 경로 문제

### 8. 보안 주의사항

Firebase Web 구성(apiKey 등)은 공개되지만, 이는 서버 비밀 키가 아니며 접근 제어는 Firestore/Storage 보안 규칙 및 백엔드 토큰 검증으로 보호되어야 합니다.
