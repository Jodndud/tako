#!/usr/bin/env node
/**
 * firebase-messaging-sw.js 생성 스크립트
 * 사용법:
 *  node scripts/generate-firebase-sw.cjs            # .env 로드 후 생성
 *  FIREBASE_API_KEY=xxx node scripts/generate-firebase-sw.cjs  # 직접 env 주입
 */

const fs = require("fs");
const path = require("path");
const dotenvPath = path.resolve(process.cwd(), ".env");

// .env 존재 시 로드 (dotenv 패키지 없이 간단 파서)
if (fs.existsSync(dotenvPath)) {
	const lines = fs.readFileSync(dotenvPath, "utf8").split(/\r?\n/);
	const isEmpty = (v) => v === undefined || v === null || v === "";
	for (const line of lines) {
		if (!line || line.trim().startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		const rawVal = line.slice(eq + 1).trim();
		// strip surrounding quotes if present
		const value = rawVal.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
		if (!(key in process.env) || isEmpty(process.env[key])) {
			process.env[key] = value;
		}
	}
}

const requiredKeys = [
	"NEXT_PUBLIC_FIREBASE_API_KEY",
	"NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
	"NEXT_PUBLIC_FIREBASE_PROJECT_ID",
	"NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
	"NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
	"NEXT_PUBLIC_FIREBASE_APP_ID",
	"NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
];

const missing = requiredKeys.filter((k) => !process.env[k]);
if (missing.length) {
	console.warn("[generate-firebase-sw] 경고: 누락된 환경변수 ->", missing.join(", "));
}

const templatePath = path.resolve(__dirname, "firebase-messaging-sw.template.js");
const outPath = path.resolve(process.cwd(), "public", "firebase-messaging-sw.js");

if (!fs.existsSync(templatePath)) {
	console.error("[generate-firebase-sw] 템플릿 파일을 찾을 수 없습니다:", templatePath);
	process.exit(1);
}

let content = fs.readFileSync(templatePath, "utf8");

const replacements = {
	FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
	FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
	FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
	FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
	FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
	FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
	FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

for (const [token, value] of Object.entries(replacements)) {
	const pattern = new RegExp("@@" + token + "@@", "g");
	content = content.replace(pattern, value);
}

// 출력 디렉토리 보장
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, "utf8");
console.log("[generate-firebase-sw] 생성 완료 ->", path.relative(process.cwd(), outPath));
