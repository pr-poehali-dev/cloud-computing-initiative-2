import Icon from "@/components/ui/icon"
import SectionHeading from "@/components/about/SectionHeading"

const TESTIMONIALS = [
  {
    name: "Анна Резник",
    role: "Предприниматель · 32 года",
    text: "В клубе я впервые почувствовала, что не нужно ничего из себя строить. Здесь меня поддержали в самый сложный период запуска компании — и подсказали, и просто были рядом.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/d2433a2e-1d20-4cf3-bc29-b9d7e77330f5.jpg",
  },
  {
    name: "Ольга Седова",
    role: "Психолог · 38 лет",
    text: "«МОЖНО» — это про честный разговор и тёплое окружение. После каждого круга поддержки я возвращаюсь домой собранной и спокойной.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/25c443e8-3174-4d5b-9a43-8b3395b87dbd.jpg",
  },
  {
    name: "Елена Морозова",
    role: "Дизайнер · 41 год",
    text: "Я нашла здесь подруг, с которыми вижусь и вне мероприятий. Это редкость во взрослом возрасте — найти своих.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/c87b3216-41fa-4c5d-90e4-a0f80f417cc2.jpg",
  },
  {
    name: "Дарья Климова",
    role: "Студентка магистратуры · 26 лет",
    text: "Думала, что я тут самая молодая и не впишусь. А оказалось наоборот — возраст не имеет значения, важна женская близость и доверие.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/0bdce787-5f16-4561-bccb-ceaf2def1175.jpg",
  },
]

export default function AboutTestimonials() {
  return (
    <section id="testimonials" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
      <SectionHeading eyebrow="Отзывы участниц" title="" icon="Quote" />
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
                <div
                  className="font-medium"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {t.name}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-black/50 mt-0.5">
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
