import { useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const FOUNDER_PHOTO = "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/426bd8fc-c039-4714-9337-a409e04a17fc.jpg"

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
  {
    q: "Что ты желаешь каждой, кто пришла?",
    a: "Чтобы услышала себя и почувствовала: можно по-своему, можно медленно, можно ярко. Можно — всё.",
  },
]

const SPEAKERS = [
  {
    name: "Екатерина Лаврова",
    role: "Психолог, гештальт-терапевт",
    bio: "10 лет частной практики, ведущая кругов поддержки и расстановок.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/08af00b7-f487-4913-bfcb-18209d8986fb.jpg",
  },
  {
    name: "Алина Светлова",
    role: "Тренер по йоге и пилатесу",
    bio: "Сертифицированный преподаватель, авторские утренние практики у воды.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e70a851-f500-4868-9a3f-6d1f5a1df032.jpg",
  },
  {
    name: "Марина Корн",
    role: "Бизнес-наставник, инвестор",
    bio: "Основательница венчурного фонда, ментор женского предпринимательства.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e0dbeba-9b07-40a5-a5a1-6f912e4f8ab8.jpg",
  },
]

const GALLERY = [
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/15422723-dc66-4444-9812-8306f234551a.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/1aa5f880-559c-4ec5-838d-659f307e9df8.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6a8cfa15-cec6-4996-9062-69db8eb29d2f.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/bb1cf627-1e95-4e23-9518-47c7799c1556.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/cc92f513-6f64-4f7a-94fc-dc94c5f64021.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/7685cd55-3a4e-4846-bfad-bae8b82b24f0.jpg",
]

const STATS = [
  { value: "847", label: "участниц" },
  { value: "120+", label: "мероприятий в год" },
  { value: "32", label: "приглашённых спикера" },
  { value: "4 года", label: "клубу" },
]

const TESTIMONIALS = [
  {
    name: "Анна Резник",
    role: "Предприниматель · 32 года",
    text: "В клубе я впервые почувствовала, что не нужно ничего из себя строить. Здесь меня поддержали в самый сложный период запуска компании — и подсказали, и просто были рядом.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/d2433a2e-1d20-4cf3-bc29-b9d7e77330f5.jpg",
  },
  {
    name: "Ольга Седова",
    role: "Психолог · 38 лет",
    text: "«МОЖНО» — это про честный разговор и тёплое окружение. После каждого круга поддержки я возвращаюсь домой собранной и спокойной.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/25c443e8-3174-4d5b-9a43-8b3395b87dbd.jpg",
  },
  {
    name: "Елена Морозова",
    role: "Дизайнер · 41 год",
    text: "Я нашла здесь подруг, с которыми вижусь и вне мероприятий. Это редкость во взрослом возрасте — найти своих.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/c87b3216-41fa-4c5d-90e4-a0f80f417cc2.jpg",
  },
  {
    name: "Дарья Климова",
    role: "Студентка магистратуры · 26 лет",
    text: "Думала, что я тут самая молодая и не впишусь. А оказалось наоборот — возраст не имеет значения, важна женская близость и доверие.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/0bdce787-5f16-4561-bccb-ceaf2def1175.jpg",
  },
]

export default function About() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 text-black">
      {/* Top bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 hover:text-black transition-colors">
          <Icon name="ChevronLeft" size={16} />
          На главную
        </Link>
        <div className="text-sm uppercase tracking-[0.3em] font-light">МОЖНО</div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">О клубе</div>
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
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">Владелица клуба</div>
        <div className="grid md:grid-cols-[380px_1fr] gap-8 items-start">
          <div className="rounded-3xl overflow-hidden bg-white shadow-md">
            <img src={FOUNDER_PHOTO} alt="Софья Берг" className="w-full h-auto block" />
          </div>
          <div>
            <h2
              className="mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
            >
              Софья Берг
            </h2>
            <div className="text-sm uppercase tracking-[0.2em] text-black/55 mb-6">
              Основательница · идеолог клуба
            </div>

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
      </section>

      {/* Speakers */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">Спикеры клуба</div>
        <h2
          className="mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
        >
          Те, кто делится опытом
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {SPEAKERS.map((s) => (
            <div key={s.name} className="group rounded-3xl bg-white border border-black/5 overflow-hidden shadow-sm">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={s.photo}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                />
              </div>
              <div className="p-5">
                <div className="text-lg font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {s.name}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-pink-600 mt-1">{s.role}</div>
                <p className="text-sm text-black/70 mt-3 leading-relaxed">{s.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">Галерея</div>
        <h2
          className="mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
        >
          Как проходят встречи
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY.map((src, i) => (
            <button
              key={src}
              onClick={() => setLightbox(src)}
              className={`relative rounded-2xl overflow-hidden bg-white shadow-sm group ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"}`}
            >
              <img
                src={src}
                alt={`Мероприятие ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">Отзывы участниц</div>
        <h2
          className="mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
        >
          Что говорят девушки клуба
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-3xl bg-white border border-black/5 shadow-sm p-6 flex gap-5 items-start"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-pink-100">
                <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-pink-500 mb-2">
                  <Icon name="Quote" size={18} />
                </div>
                <p className="text-black/80 leading-relaxed text-[0.95rem]">{t.text}</p>
                <div className="mt-4">
                  <div className="font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {t.name}
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-black/50 mt-0.5">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2
          className="mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
        >
          Готова стать частью клуба?
        </h2>
        <p className="text-black/70 mb-8">Подай заявку на вступление — мы свяжемся с тобой и пригласим на ближайшую встречу.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-black text-white text-sm uppercase tracking-[0.25em] hover:bg-black/85 transition-colors"
        >
          <Icon name="Sparkles" size={16} />
          Вступить в клуб
        </Link>
      </section>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(v) => !v && setLightbox(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          {lightbox && <img src={lightbox} alt="" className="w-full h-auto rounded-2xl" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}