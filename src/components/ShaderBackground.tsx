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
    <div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: "#e8007a" }}>
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

      {/* Swirl shader — барби розовый + нежно-фиолетовый вихрь */}
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