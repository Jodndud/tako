import { FilterOption, FilterItem } from '@/types/filter'

export const filterOptions: FilterOption[] = [
  { id: 'rarity', label: '희귀도' },
  { id: 'card_type', label: '카드 종류' },
  { id: 'card_sub_type', label: '카드 세부 속성' },
  { id: 'regulation', label: '레귤레이션' },
  { id: 'card_pack', label: '카드팩' }
]

export const items: FilterItem[] = [
  { id: 'normal', label: '노말', value: 'normal' },
  { id: 'cosmic_rare', label: '코스믹 레이', value: 'cosmic_rare' },
  { id: 'promo', label: '프로모', value: 'promo' },
  { id: 'double_rare', label: '더블 레어', value: 'double_rare' },
  { id: 'prism_rare', label: '프리즘 레어', value: 'prism_rare' },
  { id: 'hyper_rare', label: '하이퍼 레어', value: 'hyper_rare' },
  { id: 'holo_rare', label: '홀로그래픽 레어', value: 'holo_rare' }
]

export const cardType: FilterItem[] = [
  { id: 'pokemon', label: '포켓몬', value: 'pokemon' },
  { id: 'support', label: '서포트', value: 'support' },
  { id: 'trainers', label: '트레이너스', value: 'trainers' },
  { id: 'stadium', label: '스타디움', value: 'stadium' },
  { id: 'energy', label: '에너지', value: 'energy' }
]

export const cardSubType: FilterItem[] = [
  { id: '1_evolution', label: '1진화', value: '1_evolution' },
  { id: '2_evolution', label: '2진화', value: '2_evolution' },
  { id: '3_evolution', label: '3진화', value: '3_evolution' },
  { id: 'v', label: 'V', value: 'v' },
  { id: 'vmax', label: 'Vmax', value: 'vmax' },
  { id: 'v_union', label: 'V-union', value: 'v_union' },
  { id: 'vstar', label: 'Vstar', value: 'vstar' },
  { id: 'ex', label: 'Ex', value: 'ex' },
  { id: 'shining', label: '찬란한', value: 'shining' }
]

export const regulation: FilterItem[] = [
  { id: 'a', label: 'A', value: 'a' },
  { id: 'b', label: 'B', value: 'b' },
  { id: 'c', label: 'C', value: 'c' },
  { id: 'd', label: 'D', value: 'd' },
  { id: 'e', label: 'E', value: 'e' },
  { id: 'f', label: 'F', value: 'f' },
  { id: 'g', label: 'G', value: 'g' },
  { id: 'h', label: 'H', value: 'h' },
  { id: 'i', label: 'I', value: 'i' }
]

export const cardPack: FilterItem[] = [
  { id: 'classic', label: '클래식', value: 'classic' },
  { id: 'excl', label: '(EXCL)', value: 'excl' },
  { id: 'sun_collection', label: '썬 컬렉션', value: 'sun_collection' },
  { id: 'moon_collection', label: '문 컬렉션', value: 'moon_collection' },
  { id: 'sun_moon', label: '썬&문', value: 'sun_moon' },
  { id: 'sun_moon_plus', label: '알로라의 햇빛', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '알로라의 달빛', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '새로운 시련', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '어둠을 밝힌 무지개', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '빛을 삼킨 어둠', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '각성의 용사', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '초차원의 침략자', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '빛나는 전설', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: 'GX 배틀부스트', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '울트라썬', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '울트라문', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '울트라포스', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '금단의 빛', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '드래곤스톰', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '챔피언로드', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '창공의 카리스마', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '페어리라이즈', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '버스트임팩트', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '플라스마 플라스마 스파크', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '다크오더', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: 'GX 울트라샤이니', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '태그볼트', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '나이트유니슨', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '풀메탈월', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '명탐정 피카츄', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '더블블레이즈', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: 'GG엔드', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '스카이레전드', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '미라클트윈', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '리믹스바우트', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '드림리그', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: '얼터제네시스', value: 'sun_moon_plus' },
  { id: 'sun_moon_plus', label: 'TAG TEAM GX 태그올스타즈', value: 'sun_moon_plus' }
]

// Filter 컴포넌트의 itemsMap 형태로 매핑
export const itemsMap: Record<string, FilterItem[]> = {
  '희귀도': items,
  '카드 종류': cardType,
  '카드 세부 속성': cardSubType,
  '레귤레이션': regulation,
  '카드팩': cardPack
}

export default {
  filterOptions,
  items,
  cardType,
  cardSubType,
  regulation,
  cardPack,
  itemsMap
}


