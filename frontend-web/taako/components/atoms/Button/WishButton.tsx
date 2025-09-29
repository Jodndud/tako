import Image from "next/image";

export default function WishButton() {
    return (
        <div>
            <button><Image src="/icon/heart-off.svg" alt="heart-off" width={20} height={17} /></button>
        </div>
    );
}