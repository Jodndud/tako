
export default function Footer() {
    return (
      <div className="bg-[#191924] py-15">
        <div className="default-container flex gap-8 justify-between">
          <div className="flex flex-col">
             <h1 style={{ fontFamily: 'Pinkfong-B' }}>TAKO</h1>
            <p>팀원 : 이혜원, 김민규, 이재익, 조우영, 유정석, (허정현)</p>
            <p className="text-sm text-[#b5b5b5] mt-2">Copyright © TAKO All Rights Reserved.<br/>
            SSAFY 13기 특화프로젝트 E104</p>
          </div>
          {/* <div className="pt-3">
            <div className="flex justify-end gap-6">
              <Link href="#" className="relative after:content-[''] after:absolute after:right-[-12px] after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-4 after:bg-[#fff]">이용약관</Link>
              <Link href="#">개인정보처리방침</Link>
            </div>
          </div> */}
        </div>
      </div>
    );
  }