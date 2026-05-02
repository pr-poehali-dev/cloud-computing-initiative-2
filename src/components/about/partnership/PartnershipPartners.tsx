import Icon from "@/components/ui/icon"
import SectionHeading from "@/components/about/SectionHeading"
import { useDirectory } from "@/contexts/DirectoryContext"

interface Props {
  onOpenPerks: () => void
}

export default function PartnershipPartners({ onOpenPerks }: Props) {
  const { partners } = useDirectory()

  return (
    <section id="partnership" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
      <SectionHeading
        eyebrow="Партнёрство"
        title=""
        icon="Handshake"
        description="Бренды, которые разделяют ценности клуба «можно» и помогают создавать пространство для женщин."
      />

      {/* Current partners */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {partners.map((p) => (
          <div
            key={p.id}
            className="group rounded-2xl bg-white border border-black/5 p-5 hover:-translate-y-1 hover:shadow-md hover:border-pink-200 transition-all duration-300 flex gap-4 items-start"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center text-white flex-shrink-0`}
            >
              <Icon name={p.icon} size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-pink-600 mb-1">
                {p.category}
              </div>
              <div
                className="text-lg leading-tight mb-1.5 text-black/85"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {p.name}
              </div>
              <p className="text-[13px] text-black/60 leading-relaxed">{p.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white p-8 md:p-10">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-xl">
            <div className="text-[11px] uppercase tracking-[0.28em] opacity-90 mb-3">
              Стать партнёром клуба
            </div>
            <h3
              className="text-3xl md:text-4xl leading-tight mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Расскажи о своём бренде женщинам, которые умеют выбирать
            </h3>
            <p className="text-sm md:text-base opacity-90 leading-relaxed">
              Мы открыты к коллаборациям с премиальными сервисами, экспертами и
              площадками. Узнай, что входит в партнёрскую программу.
            </p>
          </div>
          <button
            onClick={onOpenPerks}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-pink-700 hover:bg-pink-50 px-7 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-colors flex-shrink-0"
          >
            <Icon name="Sparkles" size={14} />
            Узнать о программе
          </button>
        </div>
      </div>
    </section>
  )
}
