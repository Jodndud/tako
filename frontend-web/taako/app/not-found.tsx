"use client"
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])
    return (
      <div className="flex items-center gap-10 justify-center h-screen bg-gradient-to-r from-[#004DFF] to-[#002E99] pt-[80px]">
        <div>
            <p className="text-[120px] font-bold">404</p>
            <p className="-mt-10 text-[60px] font-light">NOT FOUND</p>
        </div>
        <div>
            <div className={`flex flex-col items-center shadow-[-15px_15px_4px_0_#00000015] transition-transform duration-500 ease-out will-change-transform ${entered ? 'translate-x-20 -translate-y-6' : 'translate-x-0 translate-y-1'}`}>
                <div className="flex items-center -mb-[3px]">
                    {/* 404 텍스트 배경 */}
                    <div className="bg-[#fbcd35] relative border-3 border-black w-[314px] flex items-center rounded-tl-[20px] rounded-tr-[20px] overflow-hidden">
                        <span className="bg-[#5893ff] border-r-3 border-black text-[#141420] pl-3 w-50 font-black text-[53px]">404</span>
                        {/* NOT FOUND 텍스트 배경 */}
                        <span className="
                        absolute right-0 bottom-0 bg-black
                        font-extrabold text-[24px] px-3 py-1 rounded-tl-[8px]">NOT FOUND</span>
                    </div>
                </div>
                <div className="">
                    <img 
                    src="/error-404.png" 
                    alt="404 Error" 
                    width={314} 
                    height={314}
                    className="border border-black"
                    />
                </div>
          </div>

          <div className="relative z-1 bg-[#fbcd35] border-3 border-black w-[314px] flex flex-col py-5 px-4 justify-center rounded-bl-[20px] rounded-br-[20px] shadow-[-15px_15px_4px_0_#00000015]">
            <p className="text-[#191924] font-semibold text-[20px] leading-[20px] mb-3 ml-10">잘못된 경로</p>
            <p className="text-[#191924] font-normal text-[16px] leading-[17px]">이 카드는 뒤로가기를 1회 눌러야한다.</p>
          </div>
        </div>
      </div>
    );
  }
  