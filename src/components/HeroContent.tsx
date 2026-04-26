export default function HeroContent() {
  return (
    <main className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
      {/* Logo / Club Name */}
      <div className="mb-6">
        <h1
          className="text-[clamp(5rem,18vw,14rem)] leading-none tracking-[0.15em] text-white uppercase"
          style={{ fontFamily: "'Tenor Sans', sans-serif", letterSpacing: "0.2em" }}
        >
          МОЖНО
        </h1>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px w-16 bg-white/30" />
        <span className="text-white/50 text-[10px] uppercase tracking-[0.3em]">женский клуб</span>
        <div className="h-px w-16 bg-white/30" />
      </div>

      {/* Slogan */}
      <p
        className="text-white/85 text-xl md:text-2xl font-light italic max-w-md leading-relaxed"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Каждой женщине нужна&nbsp;женщина рядом
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-4 flex-wrap justify-center mt-10">
        <button className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer tracking-widest uppercase">
          Мероприятия
        </button>
        <button className="px-8 py-3 rounded-full bg-white/90 backdrop-blur-sm text-black font-normal text-xs transition-all duration-200 hover:bg-white cursor-pointer tracking-widest uppercase">
          Вступить в клуб
        </button>
      </div>
    </main>
  )
}
