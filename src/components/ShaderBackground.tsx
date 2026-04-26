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

      <svg className="absolute w-0 h-0">
        <defs>
          {/* Радиальная маска — центр виден, края плавно исчезают */}
          <mask id="fade-mask" maskContentUnits="objectBoundingBox">
            <radialGradient id="fade-grad" cx="50%" cy="48%" r="50%">
              <stop offset="30%" stopColor="white" stopOpacity="1" />
              <stop offset="65%" stopColor="white" stopOpacity="0.8" />
              <stop offset="85%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <rect x="0" y="0" width="1" height="1" fill="url(#fade-grad)" />
          </mask>
        </defs>
      </svg>

      {/* 1. Розовый фон */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ background: "linear-gradient(160deg, #f9b8d4 0%, #f2a7c3 50%, #e8007a 100%)" }}
      />

      {/* 2. Картинка — без mixBlendMode, только маска по краям */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse 36% 40% at 50% 48%, black 5%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.1) 50%, transparent 60%)",
          maskImage: "radial-gradient(ellipse 36% 40% at 50% 48%, black 5%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.1) 50%, transparent 60%)",
        }}
      >
        <img
          src={FACE_IMG}
          alt="chrome face"
          style={{
            height: "90%",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      {/* 3. LiquidMetal перелив поверх хрома */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          clipPath: "ellipse(32% 44% at 50% 48%)",
          mixBlendMode: "screen",
          opacity: 0.45,
        }}
      >
        <LiquidMetal
          className="w-full h-full"
          colorBack="#00000000"
          colorTint="#ffd6ec"
          softness={0.4}
          repetition={2.2}
          distortion={0.55}
          contour={0.5}
          shiftRed={0.04}
          shiftBlue={-0.03}
          speed={0.26}
        />
      </div>

      {children}
    </div>
  )
}