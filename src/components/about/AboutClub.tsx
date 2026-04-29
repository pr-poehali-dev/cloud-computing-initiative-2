import Icon from "@/components/ui/icon"

const STATS = [
  { value: "847", label: "участниц" },
  { value: "120+", label: "мероприятий в год" },
  { value: "32", label: "приглашённых спикера" },
  { value: "4 года", label: "клубу" },
]

export default function AboutClub() {
  return (
    <section id="about" className="max-w-6xl mx-auto px-6 pt-8 pb-16 scroll-mt-24">
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)] mb-5">
        <Icon name="Sparkles" size={14} />
        <span className="text-[11px] uppercase tracking-[0.3em] font-medium">О клубе</span>
      </div>
      <h1
        className="relative mb-6 text-center md:text-left"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontSize: "clamp(2.6rem, 7.5vw, 5.4rem)",
          lineHeight: 0.98,
          letterSpacing: "-0.01em",
        }}
      >
        <span className="block text-black/85">
          Пространство,{" "}
          <span
            className="italic font-light bg-gradient-to-r from-rose-500 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            где&nbsp;женщине
          </span>
        </span>
        <span className="block mt-1 text-black/90">
          разрешено{" "}
          <span
            className="relative inline-block"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <span
              aria-hidden
              className="absolute left-0 right-0 bottom-1 h-2 md:h-3 bg-gradient-to-r from-pink-200/80 via-rose-200/80 to-fuchsia-200/80 rounded-full -z-0"
            />
            <span className="relative italic text-pink-700">быть собой</span>
          </span>
          <span className="text-pink-600">.</span>
        </span>
        <span
          className="mt-5 inline-flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-[0.4em] text-pink-600/80 font-sans"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}
        >
          <span className="w-10 h-px bg-gradient-to-r from-transparent to-pink-400" />
          женский клуб «можно»
          <span className="w-10 h-px bg-gradient-to-l from-transparent to-pink-400" />
        </span>
      </h1>
      <div className="mt-10 flex justify-center">
        <div className="relative max-w-3xl w-full">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-pink-200/60 via-rose-100/40 to-fuchsia-200/60 blur-2xl"
          />
          <div className="relative rounded-[2rem] bg-white/80 backdrop-blur-md border border-pink-200/60 shadow-[0_20px_60px_-20px_rgba(255,79,163,0.35)] px-8 md:px-14 py-10 md:py-12 text-center overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-[2rem]"
              style={{
                background:
                  "radial-gradient(ellipse at top, rgba(255,182,193,0.25), transparent 60%), radial-gradient(ellipse at bottom right, rgba(231,126,220,0.18), transparent 70%)",
              }}
            />

            <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)] mb-5">
              <Icon name="Heart" size={20} />
            </div>

            <p
              className="relative text-black/85 leading-[1.5]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.15rem, 1.9vw, 1.5rem)",
                fontWeight: 400,
              }}
            >
              <span className="font-medium text-pink-700">«МОЖНО»</span> — это закрытый
              женский клуб, который объединяет тех, кому важно живое общение, тёплое
              окружение и развитие в своём ритме. Мы собираемся на психологических кругах,
              бизнес-завтраках, спа-ретритах и танцевальных вечерах.
            </p>

            <div className="relative mx-auto mt-7 w-16 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white border border-black/5 px-5 py-6 text-center shadow-sm"
          >
            <div
              className="text-3xl md:text-4xl text-pink-600"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
            >
              {s.value}
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-black/55 mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
