import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import SectionHeading from "@/components/about/SectionHeading"

const FOUNDER_PHOTO = "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/bucket/349d889f-422a-4043-8672-fc7de079d848.jpeg"

const INTERVIEW = [
  {
    q: "Как появилась идея клуба «МОЖНО»?",
    a: "Я долго замечала, что вокруг много сильных, ярких женщин — но каждая в одиночку справляется со своим миром. Мне захотелось пространства, где женщине разрешено всё: расти, отдыхать, ошибаться, мечтать вслух. Так и родилось «МОЖНО» — клуб без масок и социальных ролей.",
  },
  {
    q: "Кто твои участницы?",
    a: "Это женщины 25–55 лет, очень разные по профессии и возрасту, но похожие в главном — они ищут глубину. Психологи, предприниматели, художницы, мамы. И каждой важно быть среди своих.",
  },
  {
    q: "Чем «МОЖНО» отличается от других клубов?",
    a: "Мы не про нетворкинг ради контактов и не про статус. Мы про честный разговор и тёплое окружение. Здесь не нужно ничего из себя строить — ты приходишь такая, какая есть.",
  },
]

const FOUNDER_QUOTE = "Можно по-своему, можно медленно, можно ярко. Можно — всё."

const STATS = [
  { value: "847", label: "участниц" },
  { value: "120+", label: "мероприятий в год" },
  { value: "32", label: "приглашённых спикера" },
  { value: "4 года", label: "клубу" },
]

export default function AboutHero() {
  return (
    <>
      {/* Top bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 hover:text-black transition-colors">
          <Icon name="ChevronLeft" size={16} />
          На главную
        </Link>
        <div className="text-sm uppercase tracking-[0.3em] font-light">МОЖНО</div>
      </header>

      {/* Hero */}
      <section id="about" className="max-w-6xl mx-auto px-6 pt-8 pb-16 scroll-mt-24">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)] mb-5">
          <Icon name="Sparkles" size={14} />
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium">О клубе</span>
        </div>
        <h1
          className="leading-[0.95] mb-6"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 300 }}
        >
          Пространство, где женщине<br />разрешено быть собой.
        </h1>
        <p className="max-w-2xl text-lg text-black/70 leading-relaxed">
          «МОЖНО» — это закрытый женский клуб, который объединяет тех, кому важно живое общение,
          тёплое окружение и развитие в своём ритме. Мы собираемся на психологических кругах,
          бизнес-завтраках, спа-ретритах и танцевальных вечерах.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-black/5 px-5 py-6 text-center shadow-sm">
              <div
                className="text-3xl md:text-4xl text-pink-600"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
              >
                {s.value}
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/55 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section id="founder" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-24">
        <SectionHeading
          eyebrow="Владелица клуба"
          title="Юлия Мустафина"
          icon="Crown"
          description="Основательница и идеолог пространства, в котором каждой женщине разрешено быть собой."
        />
        <div className="grid md:grid-cols-[380px_1fr] gap-8 items-start">
          <div className="rounded-3xl overflow-hidden bg-white shadow-md">
            <img src={FOUNDER_PHOTO} alt="Юлия Мустафина" className="w-full h-auto block" />
          </div>
          <div>
            <div className="space-y-5">
              {INTERVIEW.map((item, i) => (
                <div key={i} className="rounded-2xl bg-white border border-black/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-pink-500 mt-0.5">
                      <Icon name="Quote" size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-black/90 mb-2">{item.q}</div>
                      <p className="text-black/70 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Founder's quote plate — centered */}
        <div className="mt-12 flex justify-center">
          <div className="relative max-w-3xl w-full">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-pink-200/60 via-rose-100/40 to-pink-300/60 blur-2xl" />
            <div className="relative rounded-[2rem] bg-white/80 backdrop-blur-md border border-pink-200/60 shadow-[0_20px_60px_-20px_rgba(255,79,163,0.35)] px-8 md:px-14 py-12 text-center overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none rounded-[2rem]"
                style={{
                  background:
                    "radial-gradient(ellipse at top, rgba(255,182,193,0.25), transparent 60%), radial-gradient(ellipse at bottom right, rgba(231,126,220,0.18), transparent 70%)",
                }}
              />

              <Icon name="Quote" size={32} className="mx-auto text-pink-400 mb-6 relative" />

              <p
                className="relative leading-[1.25] text-black/90 italic"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.5rem, 3.4vw, 2.5rem)",
                  fontWeight: 400,
                }}
              >
                «{FOUNDER_QUOTE}»
              </p>

              <div className="relative mx-auto mt-8 w-16 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />

              <div className="relative mt-4 text-xs uppercase tracking-[0.35em] text-pink-600">
                Юлия Мустафина · основательница
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}