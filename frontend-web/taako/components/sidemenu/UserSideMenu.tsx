import Link from "next/link";
import { Menu, ChevronRight } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

import SideMenuBidHistory from "./SideMenuBidHistory";
import { useLogin } from "@/hooks/useLogin";
import { useMyInfo } from "@/hooks/useMyInfo";
import { MyBidAuctions } from "@/types/auth"

export default function UserSideMenu(){
    const { handleLogout } = useLogin();
    const { myInfo, myInfoLoading, myInfoError, myBidAuctions } = useMyInfo();

    // console.log(myBidAuctions)

    return(
        <Sheet>
          <SheetTrigger asChild>
            <Menu className="cursor-pointer" />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{myInfo?.nickname}</SheetTitle>
              <SheetDescription>
                {myInfoError ? (
                  <p>정보를 불러오지 못했습니다.</p>
                ) : (
                  <p>최근 입찰내역을 확인하세요.</p>
                )}
              </SheetDescription>
              <div className="grid grid-cols-2 gap-3 my-3">
                <SheetClose asChild>
                  <Link href="/mypage" className="text-center text-sm bg-[#353535] rounded-md flex justify-center items-center">마이페이지</Link>
                </SheetClose>
                <Button type="button" variant="destructive" className="cursor-pointer text-center py-2 border-1 border-[#353535] rounded-md" onClick={handleLogout}>로그아웃</Button>
              </div>
              <SheetClose asChild>
                <Link
                  href="/auction/new"
                  className="block px-8 py-2 bg-[#364153] text-sm text-center text-[#7DB7CD] border-1 border-[#7DB7CD] cursor-pointer rounded-lg
                  hover:bg-[#3E4C63] transition-all duration-300">경매등록
                </Link>
              </SheetClose>
            </SheetHeader>
            {/* 내용 */}
            <div className="py-10">
              <div>
                <div className="flex items-end justify-between mb-6 border-b border-[#aaa] pb-2">
                  <h3>내 입찰 내역</h3>
                  <Link href="/mypage/buyAuction" className="flex items-center text-sm text-[#a5a5a5]">
                    자세히보기
                    <ChevronRight className="w-4" />
                  </Link>
                </div>
                <div className="bid-auctions-scroll flex flex-col gap-8 max-h-150 overflow-y-scroll pr-2">
                  {myBidAuctions && myBidAuctions.length > 0 ? (
                    myBidAuctions.map((item: MyBidAuctions, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between pb-2 border-b border-[#353535]">
                          <p className="text-sm">{item.title}</p>
                        </div>
                        <SideMenuBidHistory item={item} />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center text-[#a5a5a5]">입찰 내역이 없습니다.</p>
                  )}
                </div>
              </div>

            </div>
            <SheetFooter className="flex !flex-col gap-2">
              {/* <div>
                <Button type="submit">로그아웃</Button>
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </div> */}
            </SheetFooter>
          </SheetContent>
        </Sheet>
    )
}