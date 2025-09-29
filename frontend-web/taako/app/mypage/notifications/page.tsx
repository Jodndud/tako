"use client";

import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { NOTIFICATION_CATEGORY_LABEL } from "@/types/notification";
import { usePushStore } from "@/stores/usePushStore";
import { useEffect } from "react";

interface MasterSwitchProps {
	readonly checked: boolean;
	readonly disabled?: boolean;
	readonly onEnable: () => void;
	readonly onDisable: () => void;
}
function MasterSwitch({ checked, disabled, onEnable, onDisable }: MasterSwitchProps) {
	return (
		<button
			type="button"
			onClick={() => {
				if (disabled) return;
				if (checked) onDisable();
				else onEnable();
			}}
			className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-[#F2B90C]" : "bg-gray-600"} ${
				disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
			}`}
			aria-pressed={checked}
			aria-label={`전체 푸시 ${checked ? "켜짐" : "꺼짐"}`}
		>
			<span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
		</button>
	);
}

export default function NotificationSettingsPage() {
	const { isLoading, isError, grouped, orderedCategories, toggle, mutationLoading } = useNotificationSettings();
	const pushStore = usePushStore();

	useEffect(() => {
		if (!pushStore.initialized) {
			pushStore.checkStatus();
		}
	}, [pushStore.initialized]);

	if (isLoading) return <div className="p-6 text-sm">불러오는 중...</div>;
	if (isError) return <div className="p-6 text-sm text-red-500">알림 설정을 불러오지 못했습니다.</div>;

	return (
		<div className="p-6 space-y-8">
			<header className="space-y-3">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold mb-1">Push 알림 설정</h1>
						<p className="text-xs text-gray-400">원하지 않는 카테고리는 끌 수 있습니다.</p>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-xs text-gray-300">푸쉬 ON / OFF</span>
						<MasterSwitch
							checked={pushStore.enabled}
							disabled={pushStore.loading}
							onEnable={async () => {
								await pushStore.enable();
							}}
							onDisable={async () => {
								await pushStore.disable();
							}}
						/>
					</div>
				</div>
				{pushStore.error && <div className="text-red-500 text-xs">알림 활성화 오류: {pushStore.error}</div>}
			</header>

			<div className="grid gap-10 md:grid-cols-2">
				{orderedCategories.map((cat) => {
					const items = grouped[cat] || [];
					return (
						<section key={cat} className="space-y-4">
							<h2 className="text-lg font-medium border-b border-gray-700 pb-1">{NOTIFICATION_CATEGORY_LABEL[cat]}</h2>
							{items.length === 0 ? (
								<p className="text-xs text-gray-500 px-1">표시할 항목이 없습니다.</p>
							) : (
								<ul className="space-y-2">
									{items.map((item) => (
										<li key={item.key} className="flex items-center justify-between bg-gray-800/40 px-4 py-2 rounded-md">
											<div className="flex flex-col" title={item.label}>
												<span className="text-sm font-medium">{item.label}</span>
											</div>
											<button
												onClick={() => toggle(item.key)}
												disabled={mutationLoading || !pushStore.enabled}
												className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F2B90C] text-xs
												${item.value === 1 ? "bg-[#F2B90C]" : "bg-gray-500"}
												${mutationLoading || !pushStore.enabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
												aria-pressed={item.value === 1}
												aria-label={`${item.label} 알림 ${item.value === 1 ? "켜짐" : "꺼짐"}`}
											>
												<span
													className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
													${item.value === 1 ? "translate-x-5" : "translate-x-1"}`}
												/>
											</button>
										</li>
									))}
								</ul>
							)}
						</section>
					);
				})}
			</div>
		</div>
	);
}
