import type React from "react"
import { useEffect, useRef } from "react"
import { Swirl } from "@paper-design/shaders-react"

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
    <div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: "#7a1a3a" }}>
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          {/* Sepia texture via turbulence */}
          <filter id="sepia-texture" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={4} stitchTiles="stitch" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0.35 0 0 0 0
                      0.20 0 0 0 0
                      0.10 0 0 0 0
                      0    0 0 0.18 0"
              result="sepia"
            />
            <feComposite in="sepia" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Swirl shader — насыщенные розовые, не уходящие в фиолетовый */}
      <Swirl
        className="absolute inset-0 w-full h-full"
        colorBack="#5c1028"
        colors={["#e8185a", "#f0437a", "#d4124e", "#f76d95", "#b50d3f"]}
        bandCount={5}
        twist={3.0}
        softness={0.6}
        noiseFrequency={0.45}
        noisePower={1.3}
        speed={0.16}
      />

      {/* Sepia grain texture overlay */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: "url(#sepia-texture)", mixBlendMode: "multiply", opacity: 0.55 }}
      />

      {/* Тёмный оверлей снизу для читаемости текста */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.32) 100%)",
        }}
      />

      {children}
    </div>
  )
}
