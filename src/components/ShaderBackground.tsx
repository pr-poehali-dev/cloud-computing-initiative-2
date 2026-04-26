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
    <div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: "#f5e8f0" }}>
      {/* SVG Filters — rain drops on glass */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          {/* Glass distortion */}
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves={1} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={0.3} />
          </filter>

          {/* Rain drops effect */}
          <filter id="rain-drops" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.012 0.008"
              numOctaves={2}
              seed={8}
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={18}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation={0.4} result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="over" />
          </filter>

          {/* Frosted glass overlay */}
          <filter id="frosted" x="0%" y="0%" width="100%" height="100%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={0.6} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.04
                      0 1 0 0 0.01
                      0 0 1 0 0.03
                      0 0 0 0.82 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Background Shader — light, airy swirl */}
      <Swirl
        className="absolute inset-0 w-full h-full"
        colorBack="#fce8f3"
        colors={["#f9a8d4", "#e879a8", "#c084fc", "#f0abfc", "#fdf2f8"]}
        bandCount={4}
        twist={1.8}
        softness={0.85}
        noiseFrequency={0.3}
        noisePower={0.7}
        speed={0.12}
      />

      {/* Glass / rain overlay */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backdropFilter: "blur(2px) saturate(1.4)",
          WebkitBackdropFilter: "blur(2px) saturate(1.4)",
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.38) 0%, transparent 60%), radial-gradient(ellipse at 75% 70%, rgba(255,255,255,0.22) 0%, transparent 55%)",
        }}
      />

      {/* Rain drops canvas layer via SVG filter */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: "url(#rain-drops)", opacity: 0.55 }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          {/* Small drops scattered across */}
          {[
            { cx: "12%", cy: "18%", rx: 3, ry: 7 },
            { cx: "28%", cy: "42%", rx: 2, ry: 5 },
            { cx: "45%", cy: "12%", rx: 3.5, ry: 9 },
            { cx: "63%", cy: "35%", rx: 2, ry: 6 },
            { cx: "78%", cy: "22%", rx: 3, ry: 8 },
            { cx: "88%", cy: "55%", rx: 2.5, ry: 6 },
            { cx: "20%", cy: "70%", rx: 2, ry: 5 },
            { cx: "52%", cy: "65%", rx: 3, ry: 7 },
            { cx: "70%", cy: "80%", rx: 2, ry: 5 },
            { cx: "35%", cy: "85%", rx: 3.5, ry: 8 },
            { cx: "90%", cy: "30%", rx: 2, ry: 5 },
            { cx: "8%", cy: "50%", rx: 2.5, ry: 6 },
          ].map((d, i) => (
            <ellipse
              key={i}
              cx={d.cx}
              cy={d.cy}
              rx={d.rx}
              ry={d.ry}
              fill="rgba(255,255,255,0.55)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={0.5}
            />
          ))}
          {/* Streaks — drops sliding down */}
          {[
            { x1: "15%", y1: "25%", x2: "15.5%", y2: "38%" },
            { x1: "47%", y1: "20%", x2: "47.3%", y2: "30%" },
            { x1: "72%", y1: "28%", x2: "72.4%", y2: "40%" },
            { x1: "30%", y1: "48%", x2: "30.2%", y2: "57%" },
            { x1: "85%", y1: "60%", x2: "85.3%", y2: "70%" },
          ].map((s, i) => (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* Shiny glare top-left */}
      <div
        className="absolute top-0 left-0 w-2/3 h-1/2 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        }}
      />

      {children}
    </div>
  )
}
