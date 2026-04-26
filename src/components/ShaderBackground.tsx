import type React from "react"
import { useRef } from "react"
import { LiquidMetal } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

const FACE_IMG = "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/bucket/a72fa25a-e0ec-46de-b8af-ce2bf002929a.jpg"

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: "#f2a7c3" }}>

      {/* SVG фильтры */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Маска по форме лица на картинке — примерно центр-право */}
          <clipPath id="face-mask" clipPathUnits="objectBoundingBox">
            <ellipse cx="0.52" cy="0.42" rx="0.28" ry="0.38" />
          </clipPath>

          <filter id="chromatic" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="1.4" result="sat" />
            <feComponentTransfer in="sat" result="bright">
              <feFuncR type="linear" slope="1.1" />
              <feFuncG type="linear" slope="1.05" />
              <feFuncB type="linear" slope="1.2" />
            </feComponentTransfer>
          </filter>

          <filter id="shimmer-blend" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={1.5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* 1. Фоновое фото — хромовое лицо */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${FACE_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 2. LiquidMetal — перелив ПОВЕРХ лица, в форме эллипса лица */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ clipPath: "ellipse(28% 38% at 52% 42%)" }}
      >
        <LiquidMetal
          className="w-full h-full"
          colorBack="#00000000"
          colorTint="#e8c8d8"
          softness={0.3}
          repetition={2.5}
          distortion={0.6}
          contour={0.4}
          shiftRed={0.04}
          shiftBlue={-0.03}
          speed={0.28}
        />
      </div>

      {/* 3. Второй слой LiquidMetal — более широкий, другой тон для глубины */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          clipPath: "ellipse(28% 38% at 52% 42%)",
          mixBlendMode: "screen",
          opacity: 0.45,
        }}
      >
        <LiquidMetal
          className="w-full h-full"
          colorBack="#00000000"
          colorTint="#ffffff"
          softness={0.5}
          repetition={1.8}
          distortion={0.35}
          contour={0.7}
          shiftRed={-0.02}
          shiftBlue={0.05}
          speed={0.18}
        />
      </div>

      {/* 4. Лёгкий розовый оверлей по краям для атмосферы */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 52% 42%, transparent 35%, rgba(204,0,102,0.18) 80%, rgba(150,0,70,0.35) 100%)",
        }}
      />

      {children}
    </div>
  )
}
