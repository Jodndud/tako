"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CardGradingAIProps {
  onGradeChange: (grade: string, gradeHash: string) => void;
}

export default function CardGradingAI({ onGradeChange }: CardGradingAIProps) {
  const [uploadedImages, setUploadedImages] = React.useState<{
    [key: string]: File | null;
  }>({
    front: null,
    back: null,
    edge1: null,
    edge2: null,
    edge3: null,
    edge4: null,
  });

  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [isGraded, setIsGraded] = useState<boolean>(false);

  // AI 감정하기 핸들러
  const handleAIGrading = async () => {
    if (isGrading) return;

    try {
      // 업로드된 이미지가 있는지 확인
      const hasImages = Object.values(uploadedImages).some(
        (image) => image !== null
      );

      if (!hasImages) {
        alert("카드 이미지를 먼저 업로드해주세요.");
        return;
      }

      // FormData 생성
      const formData = new FormData();

      // 무작위 5자리 숫자 job_id 생성
      const jobId = Math.floor(10000 + Math.random() * 90000).toString();
      formData.append("job_id", jobId);

      // 각 이미지를 적절한 키로 추가
      if (uploadedImages.front) {
        formData.append("image_front", uploadedImages.front);
      }
      if (uploadedImages.back) {
        formData.append("image_back", uploadedImages.back);
      }
      if (uploadedImages.edge1) {
        formData.append("image_side_1", uploadedImages.edge1);
      }
      if (uploadedImages.edge2) {
        formData.append("image_side_2", uploadedImages.edge2);
      }
      if (uploadedImages.edge3) {
        formData.append("image_side_3", uploadedImages.edge3);
      }
      if (uploadedImages.edge4) {
        formData.append("image_side_4", uploadedImages.edge4);
      }

      setIsGrading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AI_API_BASE_URL}/condition-check`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.log(response);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("AI 감정이 완료되었습니다!");

      const responseData = await response.json();

      // 응답에서 grade 값을 추출
      const grade = responseData.grade;
      const hash = responseData.hash;

      // 부모 컴포넌트에 결과 전달
      onGradeChange(grade, hash);

      setIsGraded(true);
    } catch (error) {
      setIsGrading(false);
      console.error("AI 감정 중 오류 발생:", error);
      alert("AI 감정 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (type: string, file: File | null) => {
    setUploadedImages((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  // 이미지 미리보기 URL 생성
  const getImagePreview = (file: File | null) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  // 컴포넌트 언마운트 시 URL 객체 정리
  React.useEffect(() => {
    return () => {
      Object.values(uploadedImages).forEach((file) => {
        if (file) {
          const url = URL.createObjectURL(file);
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [uploadedImages]);

  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2 mt-2">
          <h3>카드 감정하기 (AI)</h3>
          <span className="text-[#FF0000]">*</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-[15px] h-[15px] rounded-full border border-[#c3c3c3] flex items-center justify-center text-[10px]">
            i
          </div>
          <span className="text-sm text-[#a3a3a3]">촬영가이드</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 mt-3">
          <p className="text-sm text-[#a5a5a5] flex-1">
            카드 이미지를 등록해 주세요
            <br />
            (촬영 가이드 참고)
          </p>
          <Button
            type="button"
            onClick={handleAIGrading}
            disabled={isGrading || isGraded}
            className="rounded-lg px-6 h-[50px] bg-[#7DB7CD] border-1 border-[#7DB7CD] text-[#111] shadow-lg"
          >
            {isGrading && !isGraded ? (
              "평가 진행 중"
            ) : isGraded ? (
              "평가 완료"
            ) : (
              <>
                평가 시작
                <svg
                  fill="black"
                  height={24}
                  viewBox="0 0 24 24"
                  width={24}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M17.44 6.236c.04.07.11.12.2.12 2.4 0 4.36 1.958 4.36 4.355v5.934A4.368 4.368 0 0117.64 21H6.36A4.361 4.361 0 012 16.645V10.71a4.361 4.361 0 014.36-4.355c.08 0 .16-.04.19-.12l.06-.12.106-.222a97.79 97.79 0 01.714-1.486C7.89 3.51 8.67 3.01 9.64 3h4.71c.97.01 1.76.51 2.22 1.408.157.315.397.822.629 1.31l.141.299.1.22zm-.73 3.836c0 .5.4.9.9.9s.91-.4.91-.9-.41-.909-.91-.909-.9.41-.9.91zm-6.44 1.548c.47-.47 1.08-.719 1.73-.719.65 0 1.26.25 1.72.71.46.459.71 1.068.71 1.717A2.438 2.438 0 0112 15.756c-.65 0-1.26-.25-1.72-.71a2.408 2.408 0 01-.71-1.717v-.01c-.01-.63.24-1.24.7-1.699zm4.5 4.485a3.91 3.91 0 01-2.77 1.15 3.921 3.921 0 01-3.93-3.926 3.865 3.865 0 011.14-2.767A3.921 3.921 0 0112 9.402c1.05 0 2.04.41 2.78 1.15.74.749 1.15 1.738 1.15 2.777a3.958 3.958 0 01-1.16 2.776z"
                    fill="black"
                    fillRule="evenodd"
                  />
                </svg>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "front", label: "(앞면)" },
            { key: "back", label: "(뒷면)" },
            { key: "edge1", label: "(모서리 1)" },
            { key: "edge2", label: "(모서리 2)" },
            { key: "edge3", label: "(모서리 3)" },
            { key: "edge4", label: "(모서리 4)" },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className="relative w-full aspect-[4/5] border border-[#353535] bg-[#191924] rounded overflow-hidden">
                {uploadedImages[key] ? (
                  <>
                    <Image
                      src={getImagePreview(uploadedImages[key])!}
                      alt={label}
                      width={200}
                      height={250}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleImageUpload(key, null)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleImageUpload(key, file);
                      }}
                    />
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 text-[#a5a5a5] mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="text-xs text-[#a5a5a5]">
                        이미지 업로드
                      </span>
                    </div>
                  </label>
                )}
              </div>
              <span className="text-sm text-[#a5a5a5]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
