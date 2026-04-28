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

      {/* 2. Картинка — мягко растворяется в фон по краям */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse 38% 48% at 50% 48%, black 0%, rgba(0,0,0,0.95) 35%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.2) 78%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 38% 48% at 50% 48%, black 0%, rgba(0,0,0,0.95) 35%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.2) 78%, transparent 100%)",
          filter: "blur(0.5px)",
        }}
      >
        <img
          src={FACE_IMG}
          alt="chrome face"
          style={{
            height: "130%",
            width: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 0 60px rgba(242, 167, 195, 0.6))",
          }}
        />
      </div>

      {/* 3. LiquidMetal — та же мягкая маска */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse 38% 48% at 50% 48%, black 0%, rgba(0,0,0,0.95) 35%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.2) 78%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 38% 48% at 50% 48%, black 0%, rgba(0,0,0,0.95) 35%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.2) 78%, transparent 100%)",
          mixBlendMode: "screen",
          opacity: 0.5,
        }}
      >
        <div style={{ height: "130%", aspectRatio: "0.57", position: "relative" }}>
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
      </div>

      {/* 4. Premium animated pattern — rises from bottom to top */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none premium-pattern"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360' viewBox='0 0 360 360'><g fill='none' stroke='%23ffffff' stroke-width='1.1' opacity='0.7'><circle cx='180' cy='180' r='70'/><circle cx='180' cy='180' r='40'/><path d='M180 110 C 212 142, 212 218, 180 250 C 148 218, 148 142, 180 110 Z'/><path d='M110 180 C 142 148, 218 148, 250 180 C 218 212, 142 212, 110 180 Z'/><circle cx='180' cy='180' r='6' fill='%23ffffff' opacity='0.55'/><circle cx='0' cy='0' r='5' fill='%23ffffff' opacity='0.45'/><circle cx='360' cy='0' r='5' fill='%23ffffff' opacity='0.45'/><circle cx='0' cy='360' r='5' fill='%23ffffff' opacity='0.45'/><circle cx='360' cy='360' r='5' fill='%23ffffff' opacity='0.45'/><path d='M0 180 L 56 180 M 304 180 L 360 180 M 180 0 L 180 56 M 180 304 L 180 360'/><circle cx='90' cy='90' r='14'/><circle cx='270' cy='90' r='14'/><circle cx='90' cy='270' r='14'/><circle cx='270' cy='270' r='14'/></g></svg>\")",
          backgroundSize: "360px 360px",
          backgroundRepeat: "repeat",
          opacity: 0.32,
          mixBlendMode: "soft-light",
        }}
      />

      {children}
    </div>
  )
}