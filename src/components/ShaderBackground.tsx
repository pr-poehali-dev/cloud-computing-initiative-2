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
    <div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: "#1a0020" }}>
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="rain-drops" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.012 0.008" numOctaves={2} seed={8} result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale={18} xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation={0.4} result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Background Shader — deep, rich swirl */}
      <Swirl
        className="absolute inset-0 w-full h-full"
        colorBack="#1a0020"
        colors={["#8b1a6b", "#c026a0", "#4c0080", "#e0449a", "#2d0040"]}
        bandCount={4}
        twist={2.2}
        softness={0.75}
        noiseFrequency={0.35}
        noisePower={1.0}
        speed={0.14}
      />

      {/* Rain drops — прозрачные капли поверх анимации */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "url(#rain-drops)", opacity: 0.7 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
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
            { cx: "55%", cy: "48%", rx: 1.5, ry: 4 },
            { cx: "40%", cy: "28%", rx: 2, ry: 6 },
            { cx: "92%", cy: "72%", rx: 3, ry: 7 },
          ].map((d, i) => (
            <ellipse
              key={i}
              cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry}
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={0.6}
            />
          ))}
          {[
            { x1: "15%", y1: "25%", x2: "15.5%", y2: "38%" },
            { x1: "47%", y1: "20%", x2: "47.3%", y2: "30%" },
            { x1: "72%", y1: "28%", x2: "72.4%", y2: "40%" },
            { x1: "30%", y1: "48%", x2: "30.2%", y2: "57%" },
            { x1: "85%", y1: "60%", x2: "85.3%", y2: "70%" },
            { x1: "60%", y1: "15%", x2: "60.3%", y2: "24%" },
          ].map((s, i) => (
            <line
              key={i}
              x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {children}
    </div>
  )
}