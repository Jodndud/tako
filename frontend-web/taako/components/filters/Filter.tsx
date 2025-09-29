'use client'

import { useState, useRef, useEffect } from 'react'
import { FilterOption, FilterItem, FilterProps } from '@/types/filter'

export default function Filter({ 
  filterOptions, 
  items,
  itemsMap,
  onSelectionsChange
}: FilterProps) {
  // 각 옵션(label)별로 선택된 항목을 저장
  const [selections, setSelections] = useState<Record<string, FilterItem | null>>({})
  // 어떤 옵션의 드롭다운이 열려있는지 저장 (label 기준)
  const [openDropdownLabel, setOpenDropdownLabel] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownLabel(null)
      }
    };

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    };
  }, []);

  // 단일 items 모드 지원(호환): 모든 옵션에서 같은 items 사용
  const getItemsForOption = (optionLabel: string): FilterItem[] => {
    if (itemsMap) return itemsMap[optionLabel] || []
    return items || []
  }

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      {filterOptions.map((option) => {
        const optionLabel = option.label
        const optionItems = getItemsForOption(optionLabel)
        const selected = selections[optionLabel] || null
        const isOpen = openDropdownLabel === optionLabel

        return (
          <div key={option.id} className="relative z-[50]">
            <button
              onClick={() => setOpenDropdownLabel(isOpen ? null : optionLabel)}
              className={`h-[30px] px-[10px] rounded-[3px] border text-[16px] font-normal transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${
                selected ? 'border-white text-white bg-transparent' : 'border-[#969696] text-[#969696] bg-transparent hover:border-white hover:text-white'
              }`}
            >
              <span>{selected ? `${option.label}: ${selected.label}` : option.label}</span>
              <svg 
                width="8" 
                height="8" 
                viewBox="0 0 8 8" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              >
                <path d="M4 1L7 7H1L4 1Z" fill="currentColor" />
              </svg>
            </button>

            {isOpen && optionItems.length > 0 && (
              <div className={`absolute top-full left-0 mt-1 bg-white border border-[#969696] rounded-[3px] shadow-lg z-[9999] min-w-[160px] ${optionItems.length > 10 ? 'max-h-[320px] overflow-y-auto' : ''}`}>
                {optionItems.map((item) => {
                  const isSelectedItem = selected?.id === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const next = { ...selections, [optionLabel]: item }
                        setSelections(next)
                        setOpenDropdownLabel(null)
                        onSelectionsChange?.(next)
                      }}
                      className={`w-full px-[10px] py-[8px] text-left text-[16px] font-normal transition-colors duration-200 first:rounded-t-[3px] last:rounded-b-[3px] ${
                        isSelectedItem ? 'bg-[#f0f0f0] text-black' : 'text-[#333] hover:bg-[#f8f8f8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
                {selected && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...selections, [optionLabel]: null }
                      setSelections(next)
                      setOpenDropdownLabel(null)
                      onSelectionsChange?.(next)
                    }}
                    className="w-full px-[10px] py-[8px] text-left text-[16px] font-normal text-[#333] hover:bg-[#f8f8f8] last:rounded-b-[3px]"
                  >
                    선택 해제
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}