/** @type {import('next').NextConfig} */
const APP_STAGE = process.env.APP_STAGE || 'dev'; // dev | prod
const NEXT_PUBLIC_TAKO_NFT = process.env.NEXT_PUBLIC_TAKO_NFT;
const NEXT_PUBLIC_SPENDER_ADDRESS = process.env.NEXT_PUBLIC_SPENDER_ADDRESS || '';
const NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
const NEXT_PUBLIC_DEBUG_FCM = process.env.NEXT_PUBLIC_DEBUG_FCM;
const NEXT_PUBLIC_FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

const DOMAINS = {
  dev: {
    SITE: 'https://dev.tako.today',
    API: 'https://dev-api.tako.today',
    AI_API: 'https://dev.tako.today/ai'

  },
  prod: {
    SITE: 'https://tako.today',
    API: 'https://api.tako.today',
    AI_API: 'https://tako.today/ai'
  },
};

const { SITE, API, AI_API } = DOMAINS[APP_STAGE] || DOMAINS.dev;

// AI API가 로컬인 경우 프록시 URL 사용
const getAI_API_URL = () => {
  if (AI_API.includes('127.0.0.1') || AI_API.includes('localhost')) {
    return '/api/ai'; // 프록시 경로 사용
  }
  return AI_API; // 원본 URL 사용
};

module.exports = {
  reactStrictMode: true,
  swcMinify: true,

  // 이미지 도메인 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bukadong-bucket.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },

  // 클라이언트에 주입할 값
  env: {
    NEXT_PUBLIC_SITE_URL: SITE,
    NEXT_PUBLIC_API_BASE_URL: API,
    NEXT_PUBLIC_AI_API_BASE_URL: getAI_API_URL(),
    APP_STAGE,
    NEXT_PUBLIC_TAKO_NFT,
    NEXT_PUBLIC_SPENDER_ADDRESS,
    NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    NEXT_PUBLIC_DEBUG_FCM
  },

  async rewrites() {
    const rewrites = [];

    // AI API 프록시 설정 (CORS 해결)
    if (AI_API.includes('127.0.0.1') || AI_API.includes('localhost')) {
      rewrites.push({
        source: '/api/ai/:path*',
        destination: `${AI_API}/:path*`,
      });
    }

    return rewrites;
  },

  async redirects() {
    return [];
  },
};
