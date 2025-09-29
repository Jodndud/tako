'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface CategorySearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function CategorySearch({ onSearch, placeholder = "카드명을 입력해주세요." }: CategorySearchProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        onSearch(searchTerm.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="relative">
            <input
                className="w-[350px] placeholder:text-sm rounded-full border border-[#353535] bg-[#191924] px-6 py-3 focus:outline-none text-white"
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button 
                onClick={handleSearch}
                className="absolute right-6 top-3.5 cursor-pointer"
            >
                <Search className="w-5 h-5 text-white" />
            </button>
        </div>
    );
}
