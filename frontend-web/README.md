### 프로젝트 개요
- 프로젝트 명: TAKO(TCG AUCTION KOREA)
- 기간: 2025.08.07 ~ 2025.09.26 (54일)
- 인원: 5명(FE:2, BE:1, INFRA:1)

### 기술 구현
1. API 호출 관리
- lib → hooks 계층 구조를 통한 데이터 Fetching & Response Handling
```
// lib/card.ts
// 카드 검색페이지에서 검색
export const searchCard = async (categoryMajorId: number, categoryMediumId: number, name: string, description: string, page: number, size: number) => {
  const res = await api.get("/v1/cards", {
    params: {
      categoryMajorId: categoryMajorId,
      categoryMediumId: categoryMediumId,
      name: name,
      description: description,
      page: page,
      size: size
    }
  })
  return res.data
}

// 최근 1시간 인기 카드 목록
export const getHotCard = async (categoryId: number) => {
  const res = await api.get(`/v1/popularity/categories/${categoryId}/cards`)
  return res.data
}

export async function getCard(cardId: number | string, signal?: AbortSignal) {
  const res = await api.get(`/v1/cards/${cardId}`, { signal });
  return res.data;
}
```

```
// hooks/useReview.ts
// : useReview에 적용해 놓은 handleGetReview, handleAddReview 함수와 reviews 변수 사용
export function useReview() {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);

    // 리뷰 조회
    const handleGetReview = async(memberId:number) => {
        try{
            const res = await getMyReview(memberId);
            setReviews(res.result)
            // console.log(res)
        }catch(err){
            console.error(err);
        }
    }

    // 리뷰 등록
    const handleAddReview = async (params: ReviewRequest) => {
        try {
          const res = await addMyReview(
            params.auctionId,
            params.cardCondition,
            params.priceSatisfaction,
            params.descriptionMatch,
            params.star,
            params.reviewText
          );
          console.log(res);
        } catch (err) {
          console.error(err);
        }
      };

    return {
        handleGetReview, handleAddReview,
        reviews,
    }
}
```
2. 컴포넌트 구조화
- 도메인 기반 통합 관리로 유지보수성과 재사용성 확보
```
app/
ㄴ-mypage/
ㄴ-search/
ㄴ-auction/
ㄴ-shop/
...
compoents/
ㄴ-common/
  ㄴ-atoms/ 
ㄴ-mypage/
  ㄴ-SellOngoingAuctions.tsx
  ㄴ-SellEndedAuctions.tsx
  ㄴ-BidOngoingAuctions.tsx
  ㄴ-BidOngoingAuctions.tsx
ㄴ-search/
  ㄴ-SearchInput.tsx
ㄴ-auction/
ㄴ-shop/
```
- `atoms`등 서비스 전역 공통 컴포넌트는 common폴더에 넣음
- 라우터 폴더와 컴포넌트를 동일한 폴더명으로 구분하여 해당 페이지에서 사용하는 컴포넌트는 동일한 폴더에 두고 사용하면 일관성이 가장 잘 유지됨을 경험
- 컴포넌트 구분 기준은 같은 로직이 `3번 반복될 때` 사용. 2번 중복 시 사용하게 됐을 때 하나의 컴포넌트가 사용하지 않게 되면 컴포넌트로 나눈 이유가 사라짐.

3. 데이터 캐싱 전략
- `React Query`를 활용한 서버 상태 관리 및 성능 최적화
```
// hooks/useMysellInfo.ts
import { useQuery } from "@tanstack/react-query";
import { getInfo, getMyBidAuction, getMySellAutcion } from "@/lib/mypage";
import { MyInfo, MyBidAuctions, MySellAuctions } from "@/types/auth";

export function useMyInfo() {
  // 내 프로필 조회
  const {
    data: myInfo, isLoading: myInfoLoading, error: myInfoError,
  } = useQuery<{ result: MyInfo }>({
    queryKey: ["myInfo"],
    queryFn: getInfo,
  });

  // 내 판매 경매 조회
  const {
    data: mySellAuctionsData, isLoading: mySellLoading, error: mySellError,
  } = useQuery<{ result: { content: MySellAuctions[] } }>({
    queryKey: ["mySellAuctions"],
    queryFn: getMySellAutcion,
  });
  const mySellAuctions = mySellAuctionsData?.result?.content ?? [];

  const ongoingSellAuctions = mySellAuctions.filter(auction => !auction.isEnd);
  const endedSellAuctions = mySellAuctions.filter(auction => auction.isEnd);

  return {
    myInfo: myInfo?.result ?? null, myInfoLoading, myInfoError,
    mySellAuctionsData, ongoingSellAuctions, endedSellAuctions
  };
}

```
- 동일한 queryKey를 가진 요청은 자동으로 캐싱되어 캐시에 있는 데이터를 먼저 즉시 반환 → UX 개선.
- 새로고침(F5)이나 다른 페이지 이동 후에도 캐시 TTL이 유지되면 네트워크 호출 생략 → API 호출 횟수 감소 → 성능 개선.
- isLoading, isError, data를 자동으로 제공 → 코드량 감소 & 유지보수성 향상.

4. UI/UX 일관성
- `shadcn/ui` 라이브러리 적극 활용을 통한 디자인 시스템 구축
- 사용 Components
    - Accordian: 토글형식의 리스트 컴포넌트
    - Checkbox: 체크박스
    - Input: 인풋박스
    - Label: 라벨
    - Textarea: 텍스트박스
    - Button: 버튼
    - Navigation Menu : 네비게이션 메뉴
    - Scroll-area : 스크롤 가능 박스
    - Sheet : 사이드 메뉴 오픈 버튼
    - Calendar : 달력 UI
    - Pagination : 페이지네이션 버튼

5. Form 관리
- `react-hook-form` 기반의 간편하고 안정적인 데이터 전송 및 검증
```
"use client";

import { useForm, SubmitHandler } from "react-hook-form";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    console.log("폼 데이터:", data);
    // 예: fetch("/api/login", { method: "POST", body: JSON.stringify(data) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
      {/* 이메일 */}
      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "이메일을 입력해주세요.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "올바른 이메일 형식이 아닙니다.",
            },
          })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* 비밀번호 */}
      <div>
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          {...register("password", {
            required: "비밀번호를 입력해주세요.",
            minLength: { value: 6, message: "6자리 이상 입력해주세요." },
          })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
        로그인
      </button>
    </form>
  );
}

```
```
// 입력 값 초기화
const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
```
-간단한 유효성 검사(Validation)
  - register에 규칙만 추가하면 (required, min, pattern) 자동으로 유효성 검사 적용.
  - errors 객체로 에러 메시지를 손쉽게 표시 가능.
- 기본값 관리 용이
  - defaultValues로 초기값을 손쉽게 설정 가능.
  - API 응답을 받아서 reset() 호출 시 전체 폼 초기화도 쉬움.
- 컨트롤이 어려운 컴포넌트 지원
  - Controller를 사용하면 Select, DatePicker, Custom Input 같은 controlled 컴포넌트도 쉽게 연동 가능.
- watch / setValue로 동적 폼 제어
  - 특정 값(buyNowFlag)을 watch해서 다른 필드의 렌더링을 조건부로 처리 가능.
  - setValue로 외부 로직에 따라 값 업데이트 가능.
- TypeScript와의 강력한 통합
  - useForm<AuctionFormProps>() 제네릭으로 타입을 지정하면, register와 errors에서 타입 안전성 확보.

6. 사용자 UX고려 예외처리
<img src="./readme-img/signup.png" alt="회원가입 화면" width="400"/>
- 예) 회원가입 시 모든 예외 처리: 이메일 형식/중복, 인증번호 유효성, 비밀번호 형식/일치, 닉네임 형식/중복 확인