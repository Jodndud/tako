# AuctionCard 컴포넌트 에러 해결 과정

## 발생한 에러들

### 1. React 렌더링 에러
```
Warning: Cannot update a component (`HotReload`) while rendering a different component (`ForwardRef`). To locate the bad setState() call inside `ForwardRef`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render
```

### 2. 무한 루프 에러
```
react-dom.development.js:26793 Uncaught Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

## 해결 과정
### 1. React 렌더링 에러 해결

**문제**: 렌더링 중 상태 업데이트로 인한 에러

**해결책**: 조건부 렌더링 개선

**MainItemListSection.tsx 수정**:
```tsx
// Before: 복잡한 중첩 구조
{auctions.map((item, index) => (
  <SwiperSlide key={index}>
    {loading && (
      <li className="flex justify-center items-center h-50 text-sm text-[#a5a5a5]">경매를 불러오는 중입니다</li>
    )}
    <li>
      <AuctionCard item={item} loading={loading} />
    </li>
  </SwiperSlide>
))}

// After: 명확한 조건부 렌더링
{loading ? (
  <div className="flex justify-center items-center h-50 text-sm text-[#a5a5a5]">
    경매를 불러오는 중입니다
  </div>
) : error ? (
  <div className="flex justify-center items-center h-50 text-sm text-red-500">
    경매 데이터를 불러오는데 실패했습니다
  </div>
) : auctions.length === 0 ? (
  <div className="flex justify-center items-center h-50 text-sm text-[#a5a5a5]">
    등록된 경매가 없습니다
  </div>
) : (
  <ul>
    <Swiper>
      {auctions.map((item, index) => (
        <SwiperSlide key={index}>
          <AuctionCard item={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  </ul>
)}
```

**AuctionCard.tsx 수정**:
```tsx
// Before: 복잡한 props 구조
export default function AuctionCard({ item, loading }: { item: GetAuction, loading?: boolean })

// After: 단순한 props 구조
export default function AuctionCard({ item }: { item: GetAuction })

// 이미지 에러 처리 추가
<Image 
  src={item.primaryImageUrl || '/no-image.jpg'} 
  alt={item.title}
  width={300} 
  height={300}
  className="w-full h-full object-cover rounded"
  onError={(e) => {
    e.currentTarget.src = '/no-image.jpg';
  }}
/>
```

### 2. 무한 루프 에러 해결

**문제**: `useEffect` 의존성 배열에 함수 참조가 포함되어 무한 루프 발생

**해결책**: `useCallback`으로 함수 참조 안정화

**useAuction.ts 수정**:
```tsx
// Before: 일반 함수
const handlerGetAuctions = async(params: Partial<GetHotCards>) => {
  // ... 함수 내용
}

// After: useCallback으로 감싸기
const handlerGetAuctions = useCallback(async(params: Partial<GetHotCards>) => {
  try{
    setLoading(true);
    setError(null);
    const res = await getAuctions(params as GetHotCards);
    return res;
  }catch(err: any) {
    const errorMessage = err.response?.data?.message || err.message || "경매 조회 중 오류가 발생했습니다.";
    setError(errorMessage);
    console.error("경매 조회 오류:", errorMessage);
    throw err;
  }finally{
    setLoading(false);
  }
}, []); // 빈 의존성 배열로 함수 재생성 방지
```

**MainItemListSection.tsx 수정**:
```tsx
// useCallback으로 안정화된 함수이므로 의존성 배열에 안전하게 포함 가능
useEffect(() => {
  const fetch = async () => {
    try {
      const res = await handlerGetAuctions({ sort: "ENDTIME_ASC" });
      if (res && res.result && res.result.content) {
        setAuctions(res.result.content);
      }
    } catch (err) {
      console.error("경매 데이터 로딩 실패:", err);
    }
  };
  fetch();
}, [handlerGetAuctions]); // 안정화된 함수 참조
```

## 최종 결과

### 해결된 문제들
1. ✅ React 렌더링 중 상태 업데이트 에러
2. ✅ 무한 루프로 인한 Maximum update depth exceeded 에러

### 개선된 점들
1. **명확한 로딩 상태 관리**: 조건부 렌더링으로 각 상태별 UI 제공
2. **성능 최적화**: `useCallback`으로 불필요한 함수 재생성 방지
3. **에러 처리 강화**: try-catch로 API 호출 에러 처리
4. **사용자 경험 개선**: 로딩, 에러, 데이터 없음 상태에 대한 적절한 피드백

### 사용법
```tsx
// AuctionCard 컴포넌트 사용
<AuctionCard item={auctionItem} />

// MainItemListSection에서 자동으로 로딩 상태 관리
// - 로딩 중: 스켈레톤 UI 표시
// - 에러: 에러 메시지 표시  
// - 데이터 없음: "등록된 경매가 없습니다" 메시지
// - 정상: Swiper로 경매 카드 목록 표시
```

## 주의사항

1. **에러 처리**: 이미지 로딩 실패 시 대체 이미지 표시
2. **성능**: `useCallback`으로 함수 참조 안정화
3. **접근성**: 적절한 alt 텍스트 제공
