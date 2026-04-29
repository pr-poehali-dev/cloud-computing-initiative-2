import SectionHeading from "@/components/about/SectionHeading"
import BecomeSpeakerCTA from "@/components/about/BecomeSpeakerCTA"

const SPEAKERS = [
  {
    name: "Екатерина Лаврова",
    role: "Психолог, гештальт-терапевт",
    bio: "10 лет частной практики, ведущая кругов поддержки и расстановок.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/08af00b7-f487-4913-bfcb-18209d8986fb.jpg",
  },
  {
    name: "Алина Светлова",
    role: "Тренер по йоге и пилатесу",
    bio: "Сертифицированный преподаватель, авторские утренние практики у воды.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e70a851-f500-4868-9a3f-6d1f5a1df032.jpg",
  },
  {
    name: "Марина Корн",
    role: "Бизнес-наставник, инвестор",
    bio: "Основательница венчурного фонда, ментор женского предпринимательства.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e0dbeba-9b07-40a5-a5a1-6f912e4f8ab8.jpg",
  },
]

export default function AboutSpeakers() {
  return (
    <section id="speakers" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-24">
      <SectionHeading eyebrow="Спикеры клуба" title="" icon="Mic" />
      <div className="grid md:grid-cols-3 gap-6">
        {SPEAKERS.map((s) => (
          <div
            key={s.name}
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
