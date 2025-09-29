'use client';

import Link from 'next/link'
import Image from 'next/image';
import SearchInput from "../atoms/Input/SearchInput"
import HeaderNavigationMenu from './HeaderNavigationMenu';

export default function Header() {
  return (
    <>
      {/* 헤더 */}
      <div className={`fixed top-0 right-0 w-full z-40 ease-in-out border border-[#353535] bg-background`} >
        <div className={`py-4 header relative rounded-xl default-container flex justify-between items-center`} >
          <div className="flex gap-5 items-center">
            <Link href="/" style={{ fontFamily: 'Pinkfong-B' }}>
              <h1> <Image src="/logo.png" alt="tako-logo" width={100} height={60} /> </h1>
            </Link>
            <SearchInput />
          </div>
          <div className="flex items-center gap-4">
            <HeaderNavigationMenu />
          </div>
        </div>
      </div>
    </>
  );
}