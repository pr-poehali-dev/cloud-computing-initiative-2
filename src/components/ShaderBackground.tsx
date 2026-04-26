import type React from "react"
import { useEffect, useRef } from "react"
import { Swirl, LiquidMetal } from "@paper-design/shaders-react"
import FaceSilhouette from "@/components/FaceSilhouette"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseEnter = () => {}
    const handleMouseLeave = () => {}
    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }
    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: "#cc0066" }}>

      {/* SVG defs — маска женского лица */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <clipPath id="face-clip" clipPathUnits="objectBoundingBox">
            {/* Силуэт головы + шеи */}
            <path d="
              M 0.5 0.04
              C 0.34 0.04 0.24 0.10 0.20 0.20
              C 0.16 0.30 0.16 0.42 0.18 0.52
              C 0.19 0.60 0.20 0.66 0.22 0.70
              C 0.25 0.76 0.26 0.80 0.36 0.84
              C 0.42 0.87 0.44 0.88 0.44 0.92
              L 0.56 0.92
              C 0.56 0.88 0.58 0.87 0.64 0.84
              C 0.74 0.80 0.75 0.76 0.78 0.70
              C 0.80 0.66 0.81 0.60 0.82 0.52
              C 0.84 0.42 0.84 0.30 0.80 0.20
              C 0.76 0.10 0.66 0.04 0.5 0.04 Z
            " />
            {/* Волосы сверху */}
            <path d="
              M 0.5 0.01
              C 0.30 0.01 0.14 0.08 0.12 0.22
              C 0.10 0.14 0.16 0.05 0.28 0.02
              C 0.35 0.00 0.42 -0.01 0.5 0.01 Z
            " />
            <path d="
              M 0.5 0.01
              C 0.70 0.01 0.86 0.08 0.88 0.22
              C 0.90 0.14 0.84 0.05 0.72 0.02
              C 0.65 0.00 0.58 -0.01 0.5 0.01 Z
            " />
          </clipPath>

          <filter id="face-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={6} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="soft-edge" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={8} />
          </filter>
        </defs>
      </svg>

      {/* 1. Базовый Swirl фон — барби розовый вихрь */}
      <Swirl
        className="absolute inset-0 w-full h-full"
        colorBack="#cc0066"
        colors={["#ff69b4", "#e8007a", "#da70d6", "#ff1493", "#c71585"]}
        bandCount={5}
        twist={2.8}
        softness={0.65}
        noiseFrequency={0.4}
        noisePower={1.1}
        speed={0.16}
      />

      {/* 2. Силуэт лица — LiquidMetal внутри маски (переливающаяся кожа) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ clipPath: "url(#face-clip)" }}
      >
        <LiquidMetal
          className="w-full h-full"
          colorBack="#ff69b4"
          colorTint="#ffe0f0"
          softness={0.5}
          repetition={1.5}
          distortion={0.4}
          contour={0.6}
          shiftRed={0.03}
          shiftBlue={-0.02}
          speed={0.22}
        />
      </div>

      {/* 3. Мягкое свечение по контуру лица */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 28% 42% at 50% 46%, rgba(255,182,220,0.22) 0%, transparent 70%)",
          filter: "url(#soft-edge)",
        }}
      />

      {/* 4. SVG-лицо с чертами */}
      <FaceSilhouette />

      {/* 5. Финальный виньет для глубины */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(100,0,50,0.55) 100%)",
        }}
      />

      {children}
    </div>
  )
}