"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMyInfo } from "@/hooks/useMyInfo";
import { fetchMyProfile, patchMyProfile, checkNicknameAvailable, type MyProfileResult } from "@/lib/mypage";

const NICKNAME_REGEX = /^[0-9A-Za-z가-힣]{2,10}$/;

export default function EditPage() {
	const router = useRouter();
	// 기존 훅 호출 (다른 영역에서도 사용하는 캐시 유지)
	useMyInfo();
	const qc = useQueryClient();

	const [loadingProfile, setLoadingProfile] = React.useState(true);
	const [profile, setProfile] = React.useState<MyProfileResult | null>(null);

	// 수정 상태
	const [nickname, setNickname] = React.useState("");
	const [introduction, setIntroduction] = React.useState("");
	const [profileFile, setProfileFile] = React.useState<File | null>(null);
	const [backgroundFile, setBackgroundFile] = React.useState<File | null>(null);

	// 미리보기 URL
	const [profilePreview, setProfilePreview] = React.useState<string | null>(null);
	const [bgPreview, setBgPreview] = React.useState<string | null>(null);

	// 닉네임 체크 상태
	const [nicknameAvailable, setNicknameAvailable] = React.useState<null | boolean>(null);
	const [checkingNickname, setCheckingNickname] = React.useState(false);
	const [nicknameMsg, setNicknameMsg] = React.useState("");

	React.useEffect(() => {
		(async () => {
			try {
				const prof = await fetchMyProfile();
				setProfile(prof);
				setNickname(prof.nickname || "");
				setIntroduction(prof.introduction || "");
				setProfilePreview(prof.profileImageUrl || null);
				setBgPreview(prof.backgroundImageUrl || null);
			} catch (e) {
				console.error(e);
			} finally {
				setLoadingProfile(false);
			}
		})();
	}, []);

	// 파일 선택 핸들러
	const onSelectProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (!f) return;
		if (f.size > 2 * 1024 * 1024) {
			alert("프로필 이미지는 2MB 이하만 가능합니다.");
			return;
		}
		setProfileFile(f);
		setProfilePreview(URL.createObjectURL(f));
	};

	const onSelectBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (!f) return;
		if (f.size > 5 * 1024 * 1024) {
			alert("배경 이미지는 5MB 이하만 가능합니다.");
			return;
		}
		setBackgroundFile(f);
		setBgPreview(URL.createObjectURL(f));
	};

	// 닉네임 입력 시 상태 초기화
	const onChangeNickname = (v: string) => {
		setNickname(v);
		setNicknameAvailable(null);
		setNicknameMsg("");
	};

	const handleCheckNickname = async (e: React.MouseEvent) => {
		e.preventDefault();
		if (!nickname) return;
		if (!NICKNAME_REGEX.test(nickname)) {
			setNicknameAvailable(false);
			setNicknameMsg("닉네임 형식이 올바르지 않습니다. (2~10자 영문/숫자/한글)");
			return;
		}
		try {
			setCheckingNickname(true);
			const res = await checkNicknameAvailable(nickname);
			setNicknameAvailable(res.available);
			setNicknameMsg(res.available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.");
		} catch (err: any) {
			setNicknameAvailable(false);
			setNicknameMsg(err.message || "닉네임 확인 실패");
		} finally {
			setCheckingNickname(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (nickname && !NICKNAME_REGEX.test(nickname)) {
			alert("닉네임 형식이 올바르지 않습니다.");
			return;
		}
		// 닉네임 변경 시 중복체크를 했는데 사용불가라면 중단
		if (nickname !== profile?.nickname && nicknameAvailable === false) {
			alert("사용할 수 없는 닉네임입니다.");
			return;
		}
		try {
			await patchMyProfile({
				nickname: nickname || undefined,
				introduction: introduction || undefined,
				profileImageFile: profileFile,
				backgroundImageFile: backgroundFile,
			});
			alert("프로필이 수정되었습니다.");
			await qc.invalidateQueries({ queryKey: ["myInfo"] });
			// 성공 시 마이페이지로 이동
			router.push("/mypage");
		} catch (err: any) {
			console.error(err);
			alert(err.message || "수정 실패");
		}
	};

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">내 정보 수정</h2>
			{loadingProfile ? (
				<div className="text-sm text-[#a5a5a5]">불러오는 중...</div>
			) : (
				<div>
					<form className="flex flex-col gap-10 my-10" onSubmit={handleSubmit}>
						{/* 프로필 이미지 */}
						<div>
							<p className="mb-4">프로필 이미지</p>
							<div className="w-[120px] h-[120px] rounded-full overflow-hidden relative group">
								{profilePreview ? (
									<Image src={profilePreview} width={120} height={120} className="w-full h-full object-cover" alt="profile-image" />
								) : (
									<Image src="/no-image.jpg" width={120} height={120} className="w-full h-full object-cover" alt="profile-image" />
								)}
								<label className="absolute cursor-pointer inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
									<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onSelectProfile} />
									<div className="bg-black/30 rounded-full p-2 text-white text-xs">변경</div>
								</label>
							</div>
							<p className="mt-2 text-xs text-[#888]">JPEG/PNG/WebP, 2MB 이하</p>
						</div>

						{/* 배경 이미지 */}
						<div>
							<p className="mb-4">배경 이미지</p>
							<div className="w-full max-w-[480px] h-[160px] rounded-lg overflow-hidden relative group border border-[#353535] bg-[#222]">
								{bgPreview ? (
									<Image src={bgPreview} fill className="object-cover" alt="background" />
								) : (
									<div className="w-full h-full flex items-center justify-center text-xs text-[#666]">배경 이미지 없음</div>
								)}
								<label className="absolute cursor-pointer inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
									<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onSelectBackground} />
									<div className="bg-black/40 rounded-md px-3 py-1 text-white text-xs">배경 변경</div>
								</label>
							</div>
							<p className="mt-2 text-xs text-[#888]">JPEG/PNG/WebP, 5MB 이하</p>
						</div>

						{/* 이메일 (readonly) */}
						<div>
							<p className="mb-4">이메일</p>
							<div className="flex flex-col gap-3">
								<div className="w-[350px] px-5 py-3 text-[#a5a5a5] bg-[#383838] rounded-lg border-1 border-[#353535] text-sm">{profile?.email}</div>
							</div>
						</div>

						{/* 닉네임 */}
						<div>
							<p className="mb-4">닉네임</p>
							<div className="flex flex-col gap-3">
								<div className="flex gap-4">
									<input
										className="w-[350px] px-5 py-3 bg-[#191924] rounded-lg border-1 border-[#353535] text-sm"
										type="text"
										value={nickname}
										onChange={(e) => onChangeNickname(e.target.value)}
										placeholder="닉네임을 입력해주세요"
									/>
									<button
										onClick={handleCheckNickname}
										disabled={checkingNickname || !nickname || nickname === profile?.nickname}
										className="min-w-[140px] px-8 bg-[#3E4C63] rounded-lg text-md disabled:opacity-50"
									>
										{checkingNickname ? "확인중..." : "중복체크"}
									</button>
								</div>
								{nicknameMsg && <div className={nicknameAvailable ? "text-[#40C057] text-md mt-1 flex gap-2 items-center" : "text-red-400 text-md mt-1"}>{nicknameMsg}</div>}
							</div>
						</div>

						{/* 소개글 */}
						<div>
							<p className="mb-4">소개글</p>
							<div className="flex flex-col gap-3">
								<textarea
									className="w-[350px] px-5 py-3 bg-[#191924] rounded-lg border-1 border-[#353535] text-sm"
									placeholder="소개글을 작성해 주세요"
									value={introduction}
									maxLength={255}
									onChange={(e) => setIntroduction(e.target.value)}
								/>
								<div className="text-xs text-[#666] text-right w-[350px]">{introduction.length}/255</div>
							</div>
						</div>

						<button type="submit" className="w-[150px] px-8 py-3 bg-[#364153] text-[#7DB7CD] border-1 border-[#7DB7CD] cursor-pointer rounded-lg hover:bg-[#3E4C63] transition-all duration-300">
							정보수정
						</button>
					</form>
				</div>
			)}
		</div>
	);
}
