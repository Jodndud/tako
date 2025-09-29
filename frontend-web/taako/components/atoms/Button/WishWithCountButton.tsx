// WishButton과 카운트를 함께 표시하는 버튼 - WishButton의 크기 달라서
import WishButton from "./WishButton";
export default function WishWithCountButton() {
    return (
        <div>
            <WishButton />
            <span>1</span>
        </div>
    );
}