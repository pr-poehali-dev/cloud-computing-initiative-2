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

      {/* 4. Sepia warm tint — pronounced, no darkening */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(196,140,70,0.55) 0%, rgba(176,118,55,0.5) 50%, rgba(160,100,45,0.55) 100%)",
          mixBlendMode: "color",
        }}
      />

      {/* 5. Sepia grain texture */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.22  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          backgroundSize: "220px 220px",
          mixBlendMode: "soft-light",
          opacity: 0.7,
        }}
      />

      {children}
    </div>
  )
}