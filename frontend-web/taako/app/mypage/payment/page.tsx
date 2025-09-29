import { Button } from "@/components/ui/button"

export default function AddPayment(){
    return(
        <div>
            <div className="flex justify-between items-end">
                <div>
                    <h2>결제 정보</h2>
                    <p className="text-sm text-[#a5a5a5]">수수료(페널티, 착불배송비 등)가 정산되지 않을 경우, 별도 고지 없이 해당 금액을 결제 시도할 수 있습니다.</p>
                </div>
                <Button
                    variant="outline"
                >+ 새 카드 추가하기</Button>
            </div>
            <div className="py-40 text-sm text-[#a5a5a5] text-center">
            추가하신 결제 정보가 없습니다.
            </div>
        </div>
    )
}