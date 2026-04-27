import { PulsingBorder } from "@paper-design/shaders-react"

export default function HeroContent() {
  return (
    <main className="absolute inset-0 z-20 flex flex-col items-center text-center px-6 pt-[6vh] pb-[6vh]">
      {/* Tagline plate */}
      <div className="mb-5 px-7 py-2.5 rounded-full border border-white/30 bg-black/45 backdrop-blur-md fade-in-up">
        <span
          className="text-white uppercase block"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 200,
            fontSize: "clamp(0.7rem, 1.1vw, 0.95rem)",
            letterSpacing: "0.4em",
          }}
        >
          Каждой женщине всё
        </span>
      </div>

      {/* Logo / Club Name */}
      <div className="mb-4 fade-in-up-delay w-full flex justify-center overflow-hidden">
        <h1
          className="leading-none uppercase shine-text inline-block"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "clamp(3rem, 16vw, 99vw)",
            letterSpacing: "0.25em",
            paddingLeft: "0.25em",
            filter: "drop-shadow(0 2px 40px rgba(0,0,0,0.18))",
            whiteSpace: "nowrap",
          }}
        >
          МОЖНО
        </h1>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-5 flex-wrap justify-center mt-auto">
        <button className="px-12 py-5 rounded-full bg-transparent border border-white/40 text-white font-normal text-sm transition-all duration-200 hover:bg-white/10 hover:border-white/60 cursor-pointer tracking-[0.25em] uppercase">
          Мероприятия
        </button>

        {/* Join button with shimmering pulsing border */}
        <div className="relative inline-flex items-center justify-center">
          <PulsingBorder
            colors={["#FFB6C1", "#E77EDC", "#C4547D", "#FF85A1", "#F8BBD9"]}
            colorBack="#00000000"
            speed={1.8}
            roundness={1}
            thickness={0.18}
            softness={0.35}
            intensity={6}
            spotsPerColor={6}
            spotSize={0.12}
            pulse={0.15}
            smoke={0.6}
            smokeSize={4}
            style={{
              position: "absolute",
              inset: "-10px",
              width: "calc(100% + 20px)",
              height: "calc(100% + 20px)",
              borderRadius: "9999px",
              pointerEvents: "none",
            }}
          />

          <button className="relative z-10 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase">
            Вступить в клуб
          </button>
        </div>
      </div>
    </main>
  )
}
