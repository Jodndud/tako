export type CompressOptions = {
	maxSizeKB?: number; // target size per image
	maxWidth?: number;
	maxHeight?: number;
	// auto: jpeg 입력은 jpeg 유지, 그 외(png/webp 등)는 webp로 (투명 보존)
	preferType?: "auto" | "image/webp" | "image/jpeg";
	preserveTransparency?: boolean;
};

/**
 * Compress an image File to be under target size by resizing and adjusting quality.
 * Runs only in browser. If environment lacks Canvas APIs or it's not an image, returns original file.
 */
export async function compressImageFile(file: File, opts: CompressOptions = {}): Promise<File> {
	if (typeof window === "undefined") return file;
	if (!file || !file.type || !file.type.startsWith("image/")) return file;

	const { maxSizeKB = 500, maxWidth = 1920, maxHeight = 1920, preferType = "auto", preserveTransparency = true } = opts;

	// Already small enough
	if (file.size <= maxSizeKB * 1024) return file;

	try {
		const ext = (file.name.split(".").pop() || "").toLowerCase();
		const srcMime = (file.type || "image/jpeg").toLowerCase();
		const isSrcJpeg = /jpeg/.test(srcMime) || /jpe|jpg|jpeg/.test(ext);
		const isSrcPngOrWebp = /png|webp/.test(srcMime) || /png|webp/.test(ext);

		const rgbaNeeded = preserveTransparency || /png|webp/i.test(srcMime);
		let outType: "image/webp" | "image/jpeg";
		if (preferType === "image/webp") {
			outType = "image/webp";
		} else if (preferType === "image/jpeg") {
			outType = rgbaNeeded ? "image/webp" : "image/jpeg"; // 투명 필요하면 webp로 안전 전환
		} else {
			// auto
			outType = isSrcJpeg && !rgbaNeeded ? "image/jpeg" : "image/webp";
		}

		const bitmap = await createImageBitmap(file).catch(async () => {
			const url = URL.createObjectURL(file);
			try {
				const img = await new Promise<HTMLImageElement>((resolve, reject) => {
					const i = new Image();
					i.onload = () => resolve(i);
					i.onerror = reject;
					i.src = url;
				});
				// @ts-ignore
				return (await (self as any).createImageBitmap?.(img)) ?? img;
			} finally {
				URL.revokeObjectURL(url);
			}
		});

		// Get dimensions
		const srcW = (bitmap as any).width ?? (bitmap as HTMLImageElement).naturalWidth;
		const srcH = (bitmap as any).height ?? (bitmap as HTMLImageElement).naturalHeight;

		let w = srcW;
		let h = srcH;
		const fit = Math.min(1, maxWidth / w, maxHeight / h);
		w = Math.max(1, Math.round(w * fit));
		h = Math.max(1, Math.round(h * fit));

		const makeCanvas = (cw: number, ch: number) => {
			const hasOffscreen = typeof (window as any).OffscreenCanvas !== "undefined";
			const canvas: any = hasOffscreen ? new (window as any).OffscreenCanvas(cw, ch) : document.createElement("canvas");
			if (!hasOffscreen) {
				canvas.width = cw;
				canvas.height = ch;
			}
			const ctx = canvas.getContext("2d", { alpha: rgbaNeeded, colorSpace: "srgb" } as any);
			if (!ctx) throw new Error("2D context not available");
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "high" as any;
			if (!rgbaNeeded && outType === "image/jpeg") {
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0, 0, cw, ch);
			}
			ctx.drawImage(bitmap as any, 0, 0, cw, ch);
			return canvas as HTMLCanvasElement;
		};

		const toBlob = (canvas: any, q: number) =>
			new Promise<Blob>((resolve, reject) => {
				if (canvas.convertToBlob) {
					canvas.convertToBlob({ type: outType, quality: q }).then(resolve, reject);
				} else {
					(canvas as HTMLCanvasElement).toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), outType, q);
				}
			});

		let scale = 1.0;
		let best: Blob | null = null;
		const targetBytes = maxSizeKB * 1024;

		for (let attempt = 0; attempt < 6; attempt++) {
			const cw = Math.max(1, Math.floor(w * scale));
			const ch = Math.max(1, Math.floor(h * scale));
			const canvas = makeCanvas(cw, ch);

			// Binary search quality
			let lo = 0.3,
				hi = 0.92;
			for (let i = 0; i < 6; i++) {
				const mid = (lo + hi) / 2;
				const blob = await toBlob(canvas, mid);
				if (blob.size > targetBytes) {
					hi = mid;
				} else {
					best = blob;
					lo = mid;
				}
			}

			if (best && best.size <= targetBytes) break;
			scale *= 0.85; // reduce resolution and try again
			if (scale < 0.3) {
				if (!best) best = await toBlob(canvas, 0.3);
				break;
			}
		}

		if (!best) return file; // fallback

		const newExt = outType === "image/webp" ? "webp" : /(jpe|jpg|jpeg)$/i.test(ext) ? ext : "jpg";
		const base = file.name.replace(/\.[^.]+$/, "");
		const outName = `${base}.${newExt}`;
		return new File([best], outName, { type: outType, lastModified: Date.now() });
	} catch (_e) {
		return file; // On any failure, just return original file.
	}
}

/** Convenience wrapper for common policy: <= 500KB, 1920px max side, webp preferred */
export function compressToUnder500KB(file: File) {
	return compressImageFile(file, { maxSizeKB: 500, maxWidth: 1920, maxHeight: 1920, preferType: "auto", preserveTransparency: true });
}
