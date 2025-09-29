// lib/logger.ts
export const isSseDebug = () => {
	const v = process.env.NEXT_PUBLIC_DEBUG_SSE;
	return v === "1" || v === "true";
};

export function sseLog(channel: string, ...args: any[]) {
	if (isSseDebug()) {
		// eslint-disable-next-line no-console
		console.debug(`[SSE][${channel}]`, ...args);
	}
}

export function sseLogForce(channel: string, ...args: any[]) {
	// eslint-disable-next-line no-console
	console.debug(`[SSE][${channel}]`, ...args);
}
