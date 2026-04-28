import { useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import SectionHeading from "@/components/about/SectionHeading"

const GALLERY = [
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/15422723-dc66-4444-9812-8306f234551a.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/1aa5f880-559c-4ec5-838d-659f307e9df8.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6a8cfa15-cec6-4996-9062-69db8eb29d2f.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/bb1cf627-1e95-4e23-9518-47c7799c1556.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/cc92f513-6f64-4f7a-94fc-dc94c5f64021.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/7685cd55-3a4e-4846-bfad-bae8b82b24f0.jpg",
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

export default function AboutGalleryAndCta() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      {/* Gallery */}
      <section id="gallery" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
        <SectionHeading
          eyebrow="Галерея"
          title="Как проходят встречи"
          icon="Camera"
        />
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
      <section id="testimonials" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
        <SectionHeading
          eyebrow="Отзывы участниц"
          title="Что говорят девушки клуба"
          icon="Quote"
        />
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
      <section id="cta" className="max-w-3xl mx-auto px-6 pb-24 text-center scroll-mt-24">
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
    </>
  )
}