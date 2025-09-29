import { create } from "zustand";

export type OverlayPhase = "idle" | "expand" | "full" | "shrink";

interface OverlaySpinState {
	active: boolean;
	phase: OverlayPhase;
	targetPath?: string;
	trigger: (path: string) => void;
	setPhase: (p: OverlayPhase) => void;
	clear: () => void;
}

export const useOverlaySpinStore = create<OverlaySpinState>((set) => ({
	active: false,
	phase: "idle",
	targetPath: undefined,
	trigger: (path: string) => set({ active: true, phase: "expand", targetPath: path }),
	setPhase: (p: OverlayPhase) => set({ phase: p }),
	clear: () => set({ active: false, phase: "idle", targetPath: undefined }),
}));
