"use client"

type WithdrawModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm?: () => void
}

export default function WithdrawModal({ isOpen, onClose, onConfirm }: WithdrawModalProps){
    if (!isOpen) return null

    return(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Dialog */}
            <div className="relative w-[420px] bg-[#191924] border border-[#353535] rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-2">회원탈퇴</h3>
                <p className="text-sm text-[#c9c9c9] mb-6">탈퇴 시 계정과 모든 데이터가 삭제됩니다. 계속하시겠습니까?</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-[#353535] text-sm text-[#d5d5d5]"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg text-sm text-white"
                        style={{ background: 'linear-gradient(137deg, #4557BF 20%, #3A468C 100%)' }}
                    >
                        탈퇴하기
                    </button>
                </div>
            </div>
        </div>
    )
}