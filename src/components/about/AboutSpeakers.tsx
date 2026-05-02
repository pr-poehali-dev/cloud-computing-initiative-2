import SectionHeading from "@/components/about/SectionHeading"
import BecomeSpeakerCTA from "@/components/about/BecomeSpeakerCTA"
import { useDirectory } from "@/contexts/DirectoryContext"

export default function AboutSpeakers() {
  const { speakers } = useDirectory()
  return (
    <section id="speakers" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-24">
      <SectionHeading eyebrow="Спикеры клуба" title="" icon="Mic" />
      <div className="grid md:grid-cols-3 gap-6">
        {speakers.map((s) => (
          <div
            key={s.id}
            className="group rounded-3xl bg-white border border-black/5 overflow-hidden shadow-sm"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={s.photo}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
              />
            </div>
            <div className="p-5">
              <div
                className="text-lg font-medium"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {s.name}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-pink-600 mt-1">
                {s.role}
              </div>
              <p className="text-sm text-black/70 mt-3 leading-relaxed">{s.bio}</p>
            </div>
          </div>
        ))}
      </div>

      <BecomeSpeakerCTA />
    </section>
  )
}