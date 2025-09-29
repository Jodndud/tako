'use client'

import { clamp, round, adjust } from "./lib/math"
import { useSpring, animated, to } from "@react-spring/web"
import { useEffect, useState, useRef, useMemo } from "react"
import './all-cards.css'

type EffectCardTestProps = {
  type : 'pokemon' | 'yugioh' | 'cookierun' | 'ssafy',
  attribute : 'fire' | 'water' | 'grass' | 'lightning' | 'psychic' | 'fighting' | 'darkness' | 'metal' | 'dragon' | 'fairy', 
  rarity : 'amazing rare' | 'rare holo cosmos' | 'radiant rare' | 'rare rainbow alt' | 'rare rainbow' | 'rare holo' | 'reverse holo' | 'rare secret' | 'rare holo vstar' | 'rare shiny v' | 'rare shiny vmax' | 'trainer full art' | 'trainer gallery holo' | 'rare secret pikachu' | 'rare secret trainer' | 'rare holo vmax' | 'rare holo vstar' | 'rare shiny'| 'common' | 'uncommon' | 'rare holo v',
  subRarity? : 'stage' | 'item' | 'supporter' | 'trainer' | 'pokémon' ,
  img : string,
  foil? : string,
  mask? : string,
}

function getCardBackImage(type : 'pokemon' | 'yugioh' | 'cookierun' | 'ssafy') {
  const backMapping: { [key: string]: string } = {
    'pokemon': '/card-back/pokemon-back.jpg',
    'yugioh': '/card-back/yugioh-back.jpg',
    'cookierun': '/card-back/cookierun-back.png',
    'ssafy': '/card-back/ssafy-back.jpg'
  }
  return backMapping[type] || '/card-back/pokemon-back.jpg'
}

export default function EffectCard(props : EffectCardTestProps) {
  const { type, attribute: _attribute, rarity , img, foil = "", mask="" } = props
  const { subRarity = 'pokémon' } = props  
  const cardBackImage = getCardBackImage(type)

  const [loading, setLoading] = useState(true)
  const [frontSrc, setFrontSrc] = useState<string>("")
  const [interacting, setInteracting] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const thisCard = useRef<HTMLDivElement>(null);

  const [styles, api] = useSpring(() => ({
    translateX: 0,
    translateY: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    pointerX: 50,
    pointerY: 50,
    backgroundX: 50,
    backgroundY: 50,
    opacity: 0,
    config: { tension: 50, friction: 20 }, // Svelte의 부드러운 설정과 유사하게 조정
  }))

  useEffect(() => {
    setFrontSrc(img);
  }, [img])


  const handleClick = () => setIsActive(v => !v)

  useEffect(() => {
    if (isActive) {
      // 클릭 시 360도 회전 후 커진 상태 유지
      api.start({ 
        translateX: 0,
        translateY: -50,
        rotateX: 360,
        rotateY: 0,
        scale: 1.2,
        opacity: 1,
        config: { tension: 200, friction: 20 }
      })
    } else {
      // 다시 클릭 시 원래 상태로 복원
      api.start({
        translateX: 0,
        translateY: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        pointerX: 50,
        pointerY: 50,
        backgroundX: 50,
        backgroundY: 50,
        opacity: 0,
        config: { tension: 200, friction: 40 },
      });
    }
  }, [isActive, api])

  const interact = (e: React.PointerEvent<HTMLButtonElement>) => {
    setInteracting(true)

    const rect = e.currentTarget.getBoundingClientRect();
    const absolute = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    }
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    }
    
    
    api.start({
      rotateX: clamp(round(-(center.x / 0.8)), -20, 20),
      rotateY: clamp(round((center.y / 1.5)), -20, 20),
      pointerX: round(percent.x),
      pointerY: round(percent.y),
      backgroundX: adjust(percent.x, 0, 100, 37, 63),
      backgroundY: adjust(percent.y, 0, 100, 33, 67),
      opacity: 1,
      config: { tension: 150, friction: 10 }, // 더 빠른 반응 (tension 50→120, friction 20→15)
    })
  }
  
  const interactEnd = () => {
    setInteracting(false);
    // Svelte처럼 지연 후 부드러운 스냅백 애니메이션
    // setTimeout(() => {
    //   api.start({
    //     rotateX: 0,
    //     rotateY: 0,
    //     pointerX: 50,
    //     pointerY: 50,
    //     backgroundX: 50,
    //     backgroundY: 50,
    //     opacity: 0,
    //     config: { tension: 10, friction: 6 }, // 스냅백용 매우 부드러운 설정
    //   })
    // }, 100); // 짧은 지연으로 자연스러운 전환
  }

  const animatedStyles = {
    transform: to(
      [styles.translateX, styles.translateY, styles.scale],
      (x, y, s) => `translate(${x}px, ${y}px) scale(${s})`
    ),
  }

  const rotatorStyles = {
    transform: to(
      [styles.rotateX, styles.rotateY],
      (x, y) => `rotateX(${y}deg) rotateY(${x}deg)`
    ),
  }

  const dynamicStyles = {
    "--pointer-x": styles.pointerX.to((x) => `${x}%`),
    "--pointer-y": styles.pointerY.to((y) => `${y}%`),
    "--background-x": styles.backgroundX.to((x) => `${x}%`),
    "--background-y": styles.backgroundY.to((y) => `${y}%`),
    "--card-opacity": styles.opacity,
    "--pointer-from-center": to([styles.pointerX, styles.pointerY], (x, y) =>
      clamp(Math.sqrt((y - 50) ** 2 + (x - 50) ** 2) / 50, 0, 1)
    ),
    "--pointer-from-top": styles.pointerY.to((y) => y / 100),
    "--pointer-from-left": styles.pointerX.to((x) => x / 100),
  } as React.CSSProperties

  const foilStyles = useMemo(() => {
    const foilUrl = foil
    const maskUrl = mask
    
    return {
      "--foil": foilUrl ? `url("${foilUrl}")` : "none",
      "--mask": maskUrl ? `url("${maskUrl}")` : "none",
    } as React.CSSProperties;
  }, [foil, mask]);

  const cardClassName = useMemo(() => {
    const className = 'card'
    return className
  }, [rarity]);



  return (
    <animated.div
      ref={thisCard}
      className={`card-container w-full max-w-[400px]`}
      style={{...animatedStyles}}
    >
      <animated.div
        className={`${cardClassName} ${loading ? "loading" : ""} ${
          isActive ? "active" : ""
        } ${interacting ? "interacting" : ""} ${mask ? "masked" : ""}`}
        data-rarity={rarity}
        data-subtypes={subRarity}
        data-trainer-gallery={rarity === "rare holo v" ? "true" : undefined}
        onClick={handleClick}
        style={dynamicStyles}
      >
        <animated.button
          className="card__rotator"
          onPointerMove={interact}
          onPointerLeave={interactEnd}
          style={{ ...rotatorStyles, ...dynamicStyles }}
        >
          <img
            className="card__back"
            src={cardBackImage}
            alt="Card Back"
            loading="lazy"
            width="660"
            height="921"
          />
          <div className="card__front" style={foilStyles}>
            <img
              src={frontSrc}
              alt=""
              onLoad={() => setLoading(false)}
              loading="lazy"
              width="660"
              height="921"
            />
            <div className="card__shine"></div>
            <div className="card__glare"></div>
          </div>
        </animated.button>
      </animated.div>
    </animated.div>
  );
}