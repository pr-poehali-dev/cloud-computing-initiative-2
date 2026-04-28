export default function HeroContent() {
  return (
    <main className="absolute inset-0 z-20 flex flex-col items-center text-center px-6 pb-[6vh]">
      {/* Logo / Club Name — centered vertically near the face */}
      <div className="fade-in-up-delay w-full flex justify-center overflow-hidden absolute left-0 right-0" style={{ top: "42%", transform: "translateY(-50%)" }}>
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
        {/* Events button with pink-magenta shimmering border */}
        <div className="relative inline-flex items-center justify-center">
          <div aria-hidden className="absolute -inset-3 rounded-full pointer-events-none join-soft-glow" />
          <div aria-hidden className="absolute -inset-[3px] rounded-full pointer-events-none pink-shimmer-border" />
          <button className="relative z-10 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase">
            Мероприятия
          </button>
        </div>

        {/* Join button with pink-magenta shimmering border */}
        <div className="relative inline-flex items-center justify-center">
          <div aria-hidden className="absolute -inset-3 rounded-full pointer-events-none join-soft-glow" />
          <div aria-hidden className="absolute -inset-[3px] rounded-full pointer-events-none pink-shimmer-border" />
          <button className="relative z-10 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase">
            Вступить в клуб
          </button>
        </div>
      </div>
    </main>
  )
}
