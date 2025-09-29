export interface FilterOption {
  id: string
  label: string
}

export interface FilterItem {
  id: string
  label: string
  value: string
}

export interface FilterProps {
  filterOptions: FilterOption[]
  items?: FilterItem[]
  itemsMap?: Record<string, FilterItem[]>
  // 병렬 선택 결과를 전달: key는 옵션 label (예: '희귀도')
  onSelectionsChange?: (selections: Record<string, FilterItem | null>) => void
}
