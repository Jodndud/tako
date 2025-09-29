interface Rank {
  rank: string;
  size?: number;
}

export default function RankElement({ rank, size = 50 }: Rank) {
  const getRankStyle = (rank: string) => {
    switch (rank) {
      case 'S+':
        return 'text-[#30E6F7] shadow-lg shadow-[#30E6F7]';
      case 'S':
        return 'text-[#837BFF] text-[40px] shadow-lg shadow-[#837BFF]';
      case 'A1':
        return 'text-[#FF5DA3] shadow-lg shadow-[#FF5DA3]';
      case 'A':
        return 'text-[#FF5DA3] shadow-lg shadow-[#FF5DA3]';
      case 'B':
        return 'shadow-lg shadow-[#BCBCBC]';
      case 'C':
        return 'text-[#8B4513] shadow-lg shadow-[#8B4513]';
      case 'D':
        return 'text-[#696969] shadow-lg shadow-[#696969]';
      default:
        return 'text-[#BCBCBC]';
    }
  };

  return (
    <div
      className={`relative flex justify-center items-center 
        border-4 rounded-lg overflow-hidden
        bg-[#191924] ${getRankStyle(rank)}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* 반짝임 효과 */}
      <div className="shine-effect"></div>

      {/* 숫자 */}
      <p 
        className="relative z-10 font-bold -translate-y-0.5"
        style={{ fontSize: `${size * 0.64}px` }}
      >
        {rank}
      </p>
    </div>
  );
}