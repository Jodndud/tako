# ---- Build stage --------------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# 빌드 인자: dev | prod
ARG NEXT_PUBLIC_TAKO_NFT
ARG NEXT_PUBLIC_SPENDER_ADDRESS
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY
ARG NEXT_PUBLIC_DEBUG_FCM
ARG APP_STAGE

ENV APP_STAGE=${APP_STAGE} \
    NEXT_PUBLIC_TAKO_NFT=${NEXT_PUBLIC_TAKO_NFT} \
    NEXT_PUBLIC_SPENDER_ADDRESS=${NEXT_PUBLIC_SPENDER_ADDRESS} \
    NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY} \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN} \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID} \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET} \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID} \
    NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID} \
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID} \
    NEXT_PUBLIC_FIREBASE_VAPID_KEY=${NEXT_PUBLIC_FIREBASE_VAPID_KEY} \
    NEXT_PUBLIC_DEBUG_FCM=${NEXT_PUBLIC_DEBUG_FCM}

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates git build-essential python3 rustc cargo \
    && rm -rf /var/lib/apt/lists/*

# 의존성 설치 (캐시 최대화)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --include=dev --build-from-source=lightningcss

# 소스 복사 & 빌드
COPY . .
RUN npm run build

# ---- Runtime stage ------------------------------------------------------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 실행에 필요한 산출물만
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# prod 의존성만 설치
RUN npm ci --omit=dev --no-audit --no-fund

EXPOSE 3000
CMD ["npm", "start"]
