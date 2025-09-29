"use client";

import Image from "next/image";
import { useRef, useState, ChangeEvent } from "react";

interface RegisterImageProps {
  onChange: (files: File[]) => void;
}

export default function RegisterImage({ onChange }: RegisterImageProps) {
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    
    if (fileList) {
      const newFiles = Array.from(fileList);
      console.log("Registe: ", newFiles);
      if (files.length + newFiles.length > 5) {
        alert("최대 5개의 이미지만 등록할 수 있습니다.");
        return;
      }

      const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImageUrls]);

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);

      // 부모에 File[] 전달
      onChange(updatedFiles);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-4">
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      {/* 이미지 등록 버튼 */}
      <div
        className="w-25 h-25 flex flex-col justify-center items-center border border-[#a5a5a5] rounded-lg shrink-0 cursor-pointer"
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center">
          <div className="">+</div>
          <p className="text-xs text-[#a5a5a5]">{images.length}/5</p>
        </div>
      </div>

      {/* 이미지 미리보기 */}
      <div className="flex-1 overflow-x-auto custom-scroll">
        <ul className="flex gap-3">
          {images.map((src, idx) => (
            <li key={idx} className="relative w-25 h-25 rounded-lg overflow-hidden border border-[#353535] shrink-0">
              <Image src={src} alt={`image-item-${idx}`} fill className="object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
