'use client'

import Image from "next/image"
import { useMemo, useState } from "react";
import { CARD_SIZE } from "@/types/card";

type SimpleCardProps = {
    imageUrl : string,
    cardType : keyof typeof CARD_SIZE
}

export default function SimpleCard(props: SimpleCardProps) {
  const cardSize = CARD_SIZE[props.cardType] || CARD_SIZE.Pokémon;
  const height = cardSize.height;
  const width = cardSize.width;

  const { basePng, hiresPng } = useMemo(() => {
    const baseUrl = props.imageUrl

    if (baseUrl.endsWith("_hires.png")) {
      return { basePng: baseUrl.replace("_hires.png", ".png"), hiresPng: baseUrl }
    }
    if (baseUrl.endsWith(".png")) {
      return {
        basePng: baseUrl,
        hiresPng: baseUrl.replace(/\.png$/, "_hires.png"),
      }
    }
    // 확장자 없는 예외 케이스는 원본만 사용
    return { basePng: baseUrl, hiresPng: baseUrl }
  }, [props.imageUrl])

  const [src, setSrc] = useState<string>(hiresPng)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        src={src}
        alt="card-image"
        fill
        sizes="100vw"
        unoptimized
        style={{ objectFit: 'contain' }}
        onError={() => {
          if (src !== basePng) setSrc(basePng)
        }}
      />
    </div>
  )
}