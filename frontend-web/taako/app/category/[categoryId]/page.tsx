'use client'

import CategorySearch from "@/components/atoms/Input/CategorySearch"
import Filter from "@/components/filters/Filter"
import SimpleCard from '@/components/cards/SimpleCard'
import CategoryPagination from '@/components/categories/categoryPagination'
import '@/components/cards/all-cards.css'
import { CategoryPageProps } from '@/types/category'
import api from '@/lib/api'
import { AxiosResponse } from "axios"
import { useEffect, useState } from 'react'
import { CARD_SIZE, singleCard } from '@/types/card'
import { FilterOption, FilterItem } from '@/types/filter'
import Link from "next/link"

export default function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId, categoryName } = params
  const column = 5
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${column}, 1fr)`,
    gap: '2rem',
    padding: '1rem'
  }

  type APIResponse = {
    httpStatus: string
    isSuccess: boolean
    message: string
    code: number
    result: {
      content: singleCard[]
      totalPages: number
      totalElements: number
      size: number
      number: number
    }
  }
  
  type CardAPIResponse = AxiosResponse<APIResponse, any, {}>

  const [displayCards, setDisplayCards] = useState<singleCard[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([])
  const [itemsMap, setItemsMap] = useState<Record<string, FilterItem[]>>({})
  const [selectedFilters, setSelectedFilters] = useState<Record<string, FilterItem | null>>({})
 
  // 카드팩 데이터 로드
  const loadCardPacks = async () => {
    try {
      const response = await api.get(`v1/categories/mediums/${categoryId}`)
      const cardPacks = response.data?.result || []
      
      // 카드팩 필터 아이템 생성
      const cardPackItems: FilterItem[] = cardPacks.map((pack: any) => ({
        id: String(pack.id),
        label: pack.name,
        value: String(pack.id)
      }))
      
      return cardPackItems
    } catch (error) {
      console.error('카드팩 데이터 로딩 실패:', error)
      return []
    }
  }

  // 카테고리별 필터 옵션 로드
  const loadFilterOptions = async () => {
    try {
      const response = await api.get('v1/categories/majors')
      const categories = response.data?.result || []
      
      // 현재 카테고리 찾기
      const currentCategory = categories.find((cat: any) => cat.id === parseInt(categoryId.toString()))
      
      const newFilterOptions: FilterOption[] = []
      const newItemsMap: Record<string, FilterItem[]> = {}
      
      // 카드팩 필터 옵션 추가 (모든 카테고리에 공통)
      newFilterOptions.push({
        id: 'card_pack',
        label: '카드팩'
      })
      
      // 카드팩 데이터 로드
      const cardPackItems = await loadCardPacks()
      newItemsMap['카드팩'] = cardPackItems
      
      if (currentCategory && currentCategory.description) {
        try {
          const descriptionData = JSON.parse(currentCategory.description)
          
          // description 데이터를 기반으로 필터 옵션 생성
          Object.entries(descriptionData).forEach(([key, values]) => {
            if (Array.isArray(values)) {
              const optionId = key
              const optionLabel = getFilterLabel(key)
              
              newFilterOptions.push({
                id: optionId,
                label: optionLabel
              })
              
              // 필터 아이템 생성
              newItemsMap[optionLabel] = values.map((value: any) => ({
                id: String(value),
                label: String(value),
                value: String(value)
              }))
            }
          })
        } catch (error) {
          console.error('필터 옵션 파싱 실패:', error)
        }
      }
      
      setFilterOptions(newFilterOptions)
      setItemsMap(newItemsMap)
    } catch (error) {
      console.error('카테고리 데이터 로딩 실패:', error)
      setFilterOptions([])
      setItemsMap({})
    }
  }

  // 필터 키를 한국어 라벨로 변환
  const getFilterLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      'cost': '비용',
      'level': '레벨',
      'type': '타입',
      'types': '타입',
      'subtypes': '서브타입',
      'attribute': '속성',
      'species': '종족',
      'type2': '타입2',
      'pendulum_scale': '펜듈럼 스케일'
    }
    return labelMap[key] || key
  }
  
  const fetchCards = async (page: number) => {
    setLoading(true)
    try {
      // 선택된 필터들을 분류
      const filterDescriptions: string[] = []
      let selectedCardPackId: string | null = null
      
      Object.entries(selectedFilters).forEach(([label, filterItem]) => {
        if (filterItem) {
          if (label === '카드팩') {
            // 카드팩 필터는 categoryMediumId로 처리
            selectedCardPackId = filterItem.value
          } else {
            // 다른 필터들은 description으로 처리
            filterDescriptions.push(filterItem.value)
          }
        }
      })
      
      // URL 파라미터 구성
      const params = new URLSearchParams({
        categoryMajorId: categoryId.toString(),
        page: String(page - 1),
        size: '20',
        name: keyword
      })
      
      // 카드팩 필터가 선택된 경우 categoryMediumId 파라미터 추가
      if (selectedCardPackId) {
        params.append('categoryMediumId', selectedCardPackId)
      }
      
      // 다른 필터가 선택된 경우 description 파라미터 추가
      if (filterDescriptions.length > 0) {
        params.append('description', filterDescriptions.join(' '))
      }
      
      const response: CardAPIResponse = await api.get(`v1/cards?${params.toString()}`)
      const cards = response.data?.result?.content || []
      const totalPages = response.data?.result?.totalPages || 1
      
      setDisplayCards(cards)
      setTotalPages(totalPages)
    } catch (error) {
      console.error('카드 데이터 로딩 실패:', error)
      setDisplayCards([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // 필터 옵션 로드
  useEffect(() => {
    loadFilterOptions()
  }, [categoryId])

  // 카드 데이터 로드
  useEffect(() => {
    fetchCards(currentPage)
  }, [categoryId, currentPage, keyword, selectedFilters])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }

  // 필터 선택 변경 핸들러
  const handleFilterChange = (selections: Record<string, FilterItem | null>) => {
    setSelectedFilters(selections)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 리셋
  }

  // 검색 핸들러
  const handleSearch = (query: string) => {
    setKeyword(query)
    setCurrentPage(1) // 검색 시 첫 페이지로 리셋
  }

  return (
    <div>
      <div className="default-container">
        <div className="flex items-center justify-between gap-4">
          <Filter 
            filterOptions={filterOptions} 
            itemsMap={itemsMap} 
            onSelectionsChange={handleFilterChange}
          />
          <CategorySearch onSearch={handleSearch} />
        </div>
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-lg">로딩 중...</div>
            </div>
          ) : (
            <>
              <div style={gridStyle}>
                {displayCards.map((card) => {
                  const cardType = categoryName === 'Pokemon' ? 'Pokémon' : 
                                  categoryName === 'CookieRun' ? 'CookeRun' : 
                                  categoryName as keyof typeof CARD_SIZE;
                  
                  return (
                    <Link href={`/category/${categoryId}/${card.id}`}>
                    <SimpleCard 
                      key={card.id} 
                      imageUrl={(card.imageUrls && card.imageUrls.length > 0) ? card.imageUrls[0] : '/no-image.jpg'} 
                      cardType={cardType}
                    />
                    </Link>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="mt-8">
                  <CategoryPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => handlePageChange(page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}