import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"

interface PreviewCard {
  to: string
  eyebrow: string
  title: string
  description: string
  icon: string
  accent: string
  image: string
  meta?: string
}

const CARDS: PreviewCard[] = [
  {
    to: "/about/speakers",
    eyebrow: "Раздел",
    title: "Спикеры клуба",
    description:
      "Психологи, наставники и эксперты, которые делятся опытом на наших встречах. Здесь же — анкета, чтобы стать спикером.",
    icon: "Mic",
    accent: "from-rose-400 to-pink-500",
    image:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/08af00b7-f487-4913-bfcb-18209d8986fb.jpg",
    meta: "3 спикера + набор",
  },
  {
    to: "/about/events",
    eyebrow: "Раздел",
    title: "Мероприятия",
    description:
      "Игры, девичники, бизнес-нетворкинг, фотопроекты, спорт, мода и психология — всё, что происходит в клубе.",
    icon: "CalendarHeart",
    accent: "from-amber-400 to-pink-500",
    image:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/15422723-dc66-4444-9812-8306f234551a.jpg",
    meta: "7 направлений",
  },
  {
    to: "/about/residency",
    eyebrow: "Раздел",
    title: "Резидентство",
    description:
      "Форматы участия в клубе с тарифами и привилегиями. И знакомство с нашими действующими резидентками.",
    icon: "Gem",
    accent: "from-fuchsia-500 to-pink-600",
    image:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/5c4bf05c-35f8-4749-b418-c0e1cca8c492.jpg",
    meta: "4 тарифа",
  },
  {
    to: "/about/partnership",
    eyebrow: "Раздел",
    title: "Партнёрство",
    description:
      "Текущие партнёры клуба и условия партнёрской программы. Можно оставить заявку на сотрудничество.",
    icon: "Handshake",
    accent: "from-purple-500 to-fuchsia-600",
    image:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/cc92f513-6f64-4f7a-94fc-dc94c5f64021.jpg",
    meta: "6 партнёров",
  },
  {
    to: "/about/gallery",
    eyebrow: "Раздел",
    title: "Галерея",
    description:
      "Атмосфера клуба в фотографиях с прошедших встреч, ретритов и закрытых вечеров.",
    icon: "Camera",
    accent: "from-pink-400 to-rose-500",
    image:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6a8cfa15-cec6-4996-9062-69db8eb29d2f.jpg",
    meta: "Фотохроника",
  },
  {
    to: "/about/testimonials",
    eyebrow: "Раздел",
    title: "Отзывы участниц",
    description:
      "Истории женщин, которые нашли в клубе подруг, поддержку и пространство для себя.",
    icon: "Quote",
    accent: "from-rose-300 to-pink-400",
    image:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/d2433a2e-1d20-4cf3-bc29-b9d7e77330f5.jpg",
    meta: "Живые истории",
  },
]

export default function AboutSectionsPreview() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-[10px] uppercase tracking-[0.28em] mb-4">
          <Icon name="Compass" size={12} />
          Что ещё есть в клубе
        </div>
        <h2
          className="leading-tight text-black/85"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          }}
        >
          Узнай клуб ближе
        </h2>
        <p className="text-sm md:text-base text-black/60 mt-3 max-w-2xl mx-auto leading-relaxed">
          Каждый раздел — отдельная история. Загляни туда, что откликается прямо сейчас.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group relative rounded-3xl overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${c.accent} mix-blend-multiply opacity-40 group-hover:opacity-30 transition-opacity duration-500`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-pink-700 text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full">
                  <Icon name={c.icon} size={11} />
                  {c.eyebrow}
                </span>
                {c.meta && (
                  <span className="bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
                    {c.meta}
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3
                  className="text-2xl leading-tight"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}
                >
                  {c.title}
                </h3>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <p className="text-sm text-black/65 leading-relaxed mb-4 line-clamp-3">
                {c.description}
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-pink-600 group-hover:gap-3 transition-all">
                Перейти в раздел
                <Icon name="ArrowRight" size={12} />
              </div>
            </div>

            <div
              aria-hidden
              className={`absolute -bottom-px left-5 right-5 h-px bg-gradient-to-r ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
          </Link>
        ))}
      </div>

      {/* Final CTA */}
      <div className="mt-10 relative overflow-hidden rounded-[28px] bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white p-8 md:p-10">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-xl">
            <div className="text-[11px] uppercase tracking-[0.28em] opacity-90 mb-2">
              Готова присоединиться
            </div>
            <h3
              className="text-2xl md:text-3xl leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Стань частью женского клуба «можно»
            </h3>
          </div>
          <Link
            to="/about/join"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-pink-700 hover:bg-pink-50 px-7 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-colors flex-shrink-0"
          >
            <Icon name="Heart" size={14} />
            Вступить в клуб
          </Link>
        </div>
      </div>
    </section>
  )
}