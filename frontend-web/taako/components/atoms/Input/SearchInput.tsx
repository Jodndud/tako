'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchInput() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        router.push(`/search?title=${encodeURIComponent(searchTerm.trim())}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="relative">
            <input
                className="w-[350px] placeholder:text-sm rounded-full border border-[#353535] bg-[#191924] px-6 py-3 focus:outline-none"
                type="text"
                placeholder="검색어를 입력해주세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown} // <- 여기 변경
            />
            <button 
                onClick={handleSearch}
                className="absolute right-6 top-3.5 cursor-pointer"
            >
                <Search className="w-5 h-5" />
            </button>
        </div>
    );
}
