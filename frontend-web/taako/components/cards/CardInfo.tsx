import Image from 'next/image';

// 카드 타입별 아이콘 매핑 함수
const getCardTypeIcon = (cardType: string, typeName?: string) => {
  const basePath = '/card-type';
  
  switch (cardType) {
    case 'Pokémon':
      if (typeName) {
        return `${basePath}/pokemon/${typeName}.png`;
      }
      return `${basePath}/pokemon/Colorless.png`; // 기본값
      
    case 'YuGiOh':
      if (typeName) {
        // 속성명을 아이콘 파일명으로 변환
        const attributeMap: { [key: string]: string } = {
          '빛': 'attribute_icon_light',
          '어둠': 'attribute_icon_dark',
          '땅': 'attribute_icon_earth',
          '불': 'attribute_icon_fire',
          '물': 'attribute_icon_water',
          '바람': 'attribute_icon_wind',
          '신': 'attribute_icon_divine'
        };
        const iconName = attributeMap[typeName] || 'attribute_icon_light';
        return `${basePath}/YuGiOh/${iconName}.png`;
      }
      return `${basePath}/YuGiOh/attribute_icon_light.png`; // 기본값
      
    case 'Cookierun':
      if (typeName) {
        // 에너지 타입을 아이콘 파일명으로 변환
        const energyMap: { [key: string]: string } = {
          'red': 'new-red',
          'blue': 'new-blue',
          'green': 'new-green',
          'yellow': 'new-yellow',
          'purple': 'new-purple',
          'mix': 'new-mix'
        };
        const iconName = energyMap[typeName.toLowerCase()] || 'new-mix';
        return `${basePath}/cookierun/${iconName}.png`;
      }
      return `${basePath}/cookierun/new-mix.png`; // 기본값
      
    case 'SSAFY':
      if (typeName) {
        // SSAFY 속성을 아이콘 파일명으로 변환
        const attributeMap: { [key: string]: string } = {
          'SCISSORS': 'scissors',
          'ROCK': 'rock',
          'PAPER': 'paper'
        };
        const iconName = attributeMap[typeName] || 'scissors';
        return `${basePath}/ssafy/${iconName}.png`;
      }
      return `${basePath}/ssafy/scissors.png`; // 기본값
      
    default:
      return `${basePath}/pokemon/Colorless.png`;
  }
};

// 카드 타입별 다크 모드 스타일
const getCardTypeStyle = (cardType: string) => {
  switch (cardType) {
    case 'Pokémon':
      return 'border-[#353535]';
    case 'YuGiOh':
      return 'border-[#353535]';
    case 'Cookierun':
      return 'border-[#353535]';
    case 'SSAFY':
      return 'border-[#353535]';
    default:
      return 'border-[#353535]';
  }
};

// 포켓몬 공격 비용을 파싱하여 아이콘으로 표시
const parsePokemonCost = (costString: string) => {
  if (!costString) return [];
  
  const costs = costString.split(',');
  return costs.map((cost, index) => {
    const trimmedCost = cost.trim();
    return (
      <div key={index} className="bg-[#353535] p-1 rounded-full" title={trimmedCost}>
        <Image 
          src={getCardTypeIcon('Pokémon', trimmedCost)} 
          alt={trimmedCost}
          width={16}
          height={16}
          className="w-4 h-4"
        />
      </div>
    );
  });
};

// 유희왕 텍스트에서 숫자만 추출
const extractNumber = (text: string) => {
  if (!text) return '';
  const match = text.match(/\d+/);
  return match ? match[0] : '';
};

// 쿠키런 카드 설명에서 에너지 타입과 데미지를 아이콘으로 변환
const parseCookieRunDescription = (description: string) => {
  if (!description) return '';
  
  let parsedDescription = description;
  
  // {da} 패턴을 damage2.png 아이콘으로 변환
  parsedDescription = parsedDescription.replace(/\{da\}/g, 
    `<img src="/card-type/cookierun/damage2.png" alt="데미지" class="inline-block w-4 h-4 mx-0.5" title="데미지" />`
  );
  
  // {G}, {R}, {B} 등의 패턴을 찾아서 아이콘으로 변환
  const energyPattern = /\{([RGBYPM])\}/g;
  
  parsedDescription = parsedDescription.replace(energyPattern, (match, energyType) => {
    const energyMap: { [key: string]: string } = {
      'R': 'red',
      'G': 'green', 
      'B': 'blue',
      'Y': 'yellow',
      'P': 'purple',
      'M': 'mix'
    };
    
    const energyName = energyMap[energyType] || 'mix';
    const iconSrc = getCardTypeIcon('Cookierun', energyName);
    
    return `<img src="${iconSrc}" alt="${energyType}" class="inline-block w-4 h-4 mx-0.5" title="${energyType} 에너지" />`;
  });
  
  return parsedDescription;
};

interface CardInfoProps {
  cardData: any;
  description: any;
  cardType: string;
}

// {
//   "httpStatus": "OK",
//   "isSuccess": true,
//   "message": "요청에 성공하였습니다.",
//   "code": 200,
//   "result": {
//     "content": [
//       {
//         "id": 1422,
//         "name": "무료 교환권",
//         "code": "",
//         "attribute": "SCISSORS",
//         "rarity": "AMAZING_RARE",
//         "score": 0,
//         "wished": false,
//         "imageUrls": [
//           "https://bukadong-bucket.s3.ap-northeast-2.amazonaws.com/media/card/9bb3fa60-1bfd-4498-832c-e1ff319c2678.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250926T075044Z&X-Amz-SignedHeaders=host&X-Amz-Credential=AKIA5FCD6IRKIHWOTRVH%2F20250926%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Expires=300&X-Amz-Signature=0ccf4992d33e682266c33e8f1eeec79bee853f79fe76ba18e6fcc5a36359d9a5"
//         ]
//       }

export default function CardInfo({ cardData, description, cardType }: CardInfoProps) {
  const renderPokemonInfo = () => (
    <div className={`${getCardTypeStyle('Pokémon')} border rounded-xl p-6`}>
      {/* 포켓몬 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{cardData.name}</h2>
          <p className="text-[#a5a5a5] font-medium">포켓몬 카드</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* 기본 정보 */}
        <div className="space-y-6">
          <div className="border border-[#353535] rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">ℹ</span>
              </span>
              기본 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">카드 코드:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{cardData.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">희귀도:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{cardData.rarity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">타입:</span>
                <div className="flex gap-2">
                  {description.types?.map((type: string, index: number) => (
                    <div key={index} className="bg-[#353535] p-2 rounded-full" title={type}>
                      <Image 
                        src={getCardTypeIcon('Pokémon', type)} 
                        alt={type}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 공격 정보 */}
        <div className="space-y-6">
          <div className="border border-[#353535] rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚔</span>
              </span>
              공격 정보
            </h3>
            <div className="space-y-4">
              {description.attacks?.map((attack: any, index: number) => (
                <div key={index} className="border border-[#353535] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-white text-lg">{attack.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#a5a5a5] font-medium">비용:</span>
                      <div className="flex gap-1">
                        {parsePokemonCost(attack.cost)}
                      </div>
                    </div>
                  </div>
                  {attack.text && (
                    <p className="text-sm text-[#ddd] mb-2 bg-[#353535] p-2 rounded">{attack.text}</p>
                  )}
                  {attack.damage && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white bg-[#353535] px-3 py-1 rounded-full">
                        데미지: {attack.damage}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderYuGiOhInfo = () => (
    <div className={`${getCardTypeStyle('YuGiOh')} border rounded-xl p-6`}>
      {/* 유희왕 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{cardData.name}</h2>
          <p className="text-[#a5a5a5] font-medium">유희왕 카드</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기본 정보 */}
        <div className="space-y-6">
          <div className="border border-[#353535] rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">ℹ</span>
              </span>
              기본 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">카드 코드:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{cardData.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">희귀도:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{cardData.rarity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">속성:</span>
                <div className="flex items-center gap-1 bg-[#353535] px-3 py-1 rounded-full">
                  <Image 
                    src={getCardTypeIcon('YuGiOh', description.attribute)} 
                    alt={description.attribute}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-white font-medium text-sm">{description.attribute}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">타입:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{description.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">레벨:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded" title={description.level}>
                  {extractNumber(description.level)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 스탯 정보 */}
        <div className="space-y-6">
          <div className="border border-[#353535] rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚔</span>
              </span>
              스탯 정보
            </h3>
            <div className="space-y-4">
              <div className="border border-[#353535] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#a5a5a5] font-medium">공격력:</span>
                  <span className="font-bold text-white text-xl bg-[#353535] px-4 py-2 rounded-full" title={description.attack}>
                    {extractNumber(description.attack)}
                  </span>
                </div>
              </div>
              <div className="border border-[#353535] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#a5a5a5] font-medium">수비력:</span>
                  <span className="font-bold text-white text-xl bg-[#353535] px-4 py-2 rounded-full" title={description.deffence}>
                    {extractNumber(description.deffence)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 텍스트 */}
      <div className="mt-8">
        <div className="border border-[#353535] rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📜</span>
            </span>
            카드 효과
          </h3>
          <div className="border border-[#353535] rounded-lg p-4">
            <p className="text-sm text-[#ddd] leading-relaxed whitespace-pre-line">
              {description.card_text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCookieRunInfo = () => (
    <div className={`${getCardTypeStyle('Cookierun')} border rounded-xl p-6`}>
      {/* 쿠키런 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{cardData.name}</h2>
          <p className="text-[#a5a5a5] font-medium">쿠키런 카드</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기본 정보 */}
        <div className="space-y-6">
          <div className="border border-[#353535] rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">ℹ</span>
              </span>
              기본 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">카드 코드:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{cardData.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">희귀도:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{cardData.rarity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">카드 타입:</span>
                <span className="px-3 py-1 bg-[#353535] text-white rounded-full font-medium text-sm">
                  {description.cardTypeTitle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">레벨:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{description.cardLevelTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">에너지 타입:</span>
                <div className="flex items-center gap-1 bg-[#353535] px-3 py-1 rounded-full">
                  <Image 
                    src={getCardTypeIcon('Cookierun', description.energyType)} 
                    alt={description.energyType}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 스탯 정보 */}
        <div className="space-y-6">
          <div className="border border-[#353535] rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">❤</span>
              </span>
              스탯 정보
            </h3>
            <div className="space-y-4">
              <div className="border border-[#353535] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#a5a5a5] font-medium">HP:</span>
                  <span className="font-bold text-white text-xl bg-[#353535] px-4 py-2 rounded-full">
                    {description.field_hp_zbxcocvx}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 설명 */}
      <div className="mt-8">
        <div className="border border-[#353535] rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📜</span>
            </span>
            카드 설명
          </h3>
          <div className="border border-[#353535] rounded-lg p-4">
            <div 
              className="text-sm text-[#ddd] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseCookieRunDescription(description.field_cardDesc) }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSsafyInfo = () => (
    <div className={`${getCardTypeStyle('SSAFY')} border rounded-xl p-6`}>
      {/* SSAFY 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{cardData.name}</h2>
          <p className="text-[#a5a5a5] font-medium">SSAFY 오리지널 카드</p>
        </div>
      </div>
      
      <div className="">
        {/* 기본 정보 */}
        <div className="space-y-6">
          <div className="border border-[#353535] rounded-lg p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">ℹ</span>
              </span>
              기본 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">희귀도:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{cardData.rarity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">속성:</span>
                <div className="flex items-center gap-1 bg-[#353535] px-3 py-1 rounded-full">
                  <Image 
                    src={getCardTypeIcon('SSAFY', description.attribute)} 
                    alt={description.attribute}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-white font-medium text-sm">{description.attribute}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a5a5a5] font-medium">캐릭터:</span>
                <span className="text-white font-bold bg-[#353535] px-3 py-1 rounded">{description.character}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 텍스트 */}
      <div className="mt-8">
        <div className="border border-[#353535] rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#353535] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📜</span>
            </span>
            카드 텍스트
          </h3>
          <div className="border border-[#353535] rounded-lg p-4">
            <p className="text-sm text-[#ddd] leading-relaxed whitespace-pre-line">
              {description.card_text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  

  return (
    <div className="w-full">
      {cardType === "Pokémon" && renderPokemonInfo()}
      {cardType === "YuGiOh" && renderYuGiOhInfo()}
      {cardType === "Cookierun" && renderCookieRunInfo()}
      {cardType === "SSAFY" && renderSsafyInfo()}
    </div>
  );
}
