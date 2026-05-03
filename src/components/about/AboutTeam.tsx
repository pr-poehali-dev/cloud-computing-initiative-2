import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"
import { useDirectory } from "@/contexts/DirectoryContext"

export default function AboutTeam() {
  const { team: TEAM } = useDirectory()
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const scrollTo = (idx: number) => {
    const el = trackRef.current
    if (!el) return
    const card = el.children[idx] as HTMLElement | undefined
    if (!card) return
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" })
  }

  const prev = () => scrollTo(Math.max(0, active - 1))
  const next = () => scrollTo(Math.min(TEAM.length - 1, active + 1))

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const cards = Array.from(el.children) as HTMLElement[]
      const center = el.scrollLeft + el.clientWidth / 2
      let bestIdx = 0
      let bestDist = Infinity
      cards.forEach((c, i) => {
        const cardCenter = c.offsetLeft - el.offsetLeft + c.clientWidth / 2
        const dist = Math.abs(center - cardCenter)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      })
      setActive(bestIdx)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-[10px] uppercase tracking-[0.28em] mb-4">
          <Icon name="Users" size={12} />
          Команда клуба «МОЖНО»
        </div>
        <h2
          className="leading-tight text-black/85"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          }}
        >
          Те, кто создаёт «МОЖНО» каждый день
        </h2>
        <p className="text-sm md:text-base text-black/60 mt-3 max-w-2xl mx-auto leading-relaxed">
          Маленькая, но очень тёплая команда — каждая отвечает за свою часть клубной магии.
        </p>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {TEAM.map((m) => (
            <article
              key={m.id}
              className="snap-center flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] rounded-3xl overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={m.photo}
                  alt={`${m.firstName} ${m.lastName}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${m.accent} mix-blend-multiply opacity-15`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="text-[10px] uppercase tracking-[0.28em] opacity-90 mb-1">
                    {m.role}
                  </div>
                  <div
                    className="text-2xl leading-tight"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    {m.firstName} {m.lastName}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {TEAM.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`К карточке ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-8 bg-pink-600" : "w-3 bg-pink-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Назад"
              disabled={active === 0}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-pink-100 text-pink-600 hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Вперёд"
              disabled={active === TEAM.length - 1}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}