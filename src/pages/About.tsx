import { useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EVENTS, categoryMeta, type ClubEvent } from "@/data/events"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface ResidencyPlan {
  id: string
  title: string
  duration: string
  price: number
  oldPrice?: number
  badge?: string
  highlight?: boolean
  perks: string[]
  accent: string
  icon: string
}

const RESIDENCY_PLANS: ResidencyPlan[] = [
  {
    id: "month",
    title: "Резидентство «Знакомство»",
    duration: "1 месяц",
    price: 18000,
    perks: [
      "Доступ ко всем встречам месяца",
      "Закрытый чат участниц",
      "1 круг поддержки в подарок",
      "Скидка 10% на индивидуальные сессии",
    ],
    accent: "from-pink-300 to-rose-400",
    icon: "Sparkles",
  },
  {
    id: "halfYear",
    title: "Резидентство «Близкий круг»",
    duration: "6 месяцев",
    price: 89000,
    oldPrice: 108000,
    badge: "Популярный",
    highlight: true,
    perks: [
      "Все мероприятия 6 месяцев без ограничений",
      "Личный куратор клуба",
      "Доступ к спикерским вечерам",
      "Спа-ретрит в подарок",
      "Скидка 15% на индивидуальные сессии",
    ],
    accent: "from-fuchsia-500 to-pink-600",
    icon: "Crown",
  },
  {
    id: "year",
    title: "Резидентство «Навсегда наша»",
    duration: "1 год",
    price: 165000,
    oldPrice: 216000,
    badge: "Премиум",
    perks: [
      "Год без ограничений на встречах",
      "VIP-места и приоритет на ивентах",
      "2 спа-ретрита и закрытое путешествие",
      "Личное сопровождение основательницы",
      "Скидка 20% на всё",
      "Подарочный сертификат подруге",
    ],
    accent: "from-amber-400 via-rose-500 to-fuchsia-600",
    icon: "Gem",
  },
]

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
  const { isAuthenticated, user, updateProfile } = useAuth()
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null)

  const handleBuyPlan = (plan: ResidencyPlan) => {
    if (!isAuthenticated || !user) {
      toast.error("Чтобы оформить резидентство, нужно зарегистрироваться")
      return
    }
    if ((user.balance || 0) < plan.price) {
      toast.error("Недостаточно средств. Пополни баланс в личном кабинете.")
      return
    }
    updateProfile({ balance: (user.balance || 0) - plan.price })
    toast.success(`Резидентство «${plan.duration}» оформлено!`, {
      description: "Куратор свяжется с тобой в течение дня.",
    })
  }

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
            <img src={FOUNDER_PHOTO} alt="Юлия Мустафина" className="w-full h-auto block" />
          </div>
          <div>
            <h2
              className="mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
            >
              Юлия Мустафина
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

      {/* Our events */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">Наши мероприятия</div>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
          >
            Что мы проводим в клубе
          </h2>
        </div>

        <div className="overflow-x-auto scrollbar-thin pb-3">
          <div className="flex gap-5 px-6" style={{ width: "max-content" }}>
            {EVENTS.map((ev, i) => {
              const meta = categoryMeta(ev.category)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedEvent(ev)}
                  className="w-[300px] flex-shrink-0 rounded-3xl bg-white border border-black/5 shadow-sm overflow-hidden flex flex-col text-left hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  <div className={`bg-gradient-to-br ${meta.color} h-2`} />
                  <div className="p-6 flex flex-col flex-1">
                    <span className="self-start text-[10px] uppercase tracking-[0.2em] text-pink-600 mb-3">
                      {ev.category}
                    </span>
                    <h3
                      className="text-xl leading-snug mb-3"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                    >
                      {ev.title}
                    </h3>
                    <p className="text-sm text-black/65 leading-relaxed mb-5">
                      {ev.description}
                    </p>
                    <div className="mt-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-pink-600">
                      Подробнее
                      <Icon name="ArrowRight" size={12} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Event details modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(v) => !v && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {selectedEvent && (() => {
            const meta = categoryMeta(selectedEvent.category)
            const dt = new Date(selectedEvent.date)
            const day = dt.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
            const weekday = dt.toLocaleDateString("ru-RU", { weekday: "long" })
            return (
              <div>
                <div className={`bg-gradient-to-br ${meta.color} text-white px-7 py-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-2.5">
                      <Icon name={meta.icon} size={18} />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.22em] opacity-90">
                      {selectedEvent.category}
                    </span>
                  </div>
                  <h3
                    className="text-2xl md:text-3xl leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                  >
                    {selectedEvent.title}
                  </h3>
                </div>

                <div className="px-7 py-6">
                  <p className="text-black/75 leading-relaxed mb-6">
                    {selectedEvent.description}
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Icon name="Calendar" size={16} className="text-pink-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Дата</div>
                        <div className="text-black/80 capitalize">{weekday}, {day}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Clock" size={16} className="text-pink-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Время</div>
                        <div className="text-black/80">{selectedEvent.time}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="MapPin" size={16} className="text-pink-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Место</div>
                        <div className="text-black/80">{selectedEvent.location}</div>
                      </div>
                    </div>
                    {selectedEvent.speaker && (
                      <div className="flex items-start gap-3">
                        <Icon name="User" size={16} className="text-pink-600 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Спикер</div>
                          <div className="text-black/80">{selectedEvent.speaker}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Icon name="Wallet" size={16} className="text-pink-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Стоимость</div>
                        <div className="text-black/80 font-medium">{selectedEvent.price.toLocaleString("ru-RU")} ₽</div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/"
                    onClick={() => setSelectedEvent(null)}
                    className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
                  >
                    Записаться
                    <Icon name="ArrowRight" size={14} />
                  </Link>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Residency plans carousel */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">
          Резидентство клуба
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
            }}
          >
            Стань частью клуба надолго
          </h2>
          <p className="max-w-md text-sm text-black/65 leading-relaxed">
            Выбери срок — и получи неограниченный доступ к мероприятиям, кругам
            поддержки и закрытым гостиным.
          </p>
        </div>

        <Carousel opts={{ align: "start", loop: false }} className="relative">
          <CarouselContent className="-ml-4">
            {RESIDENCY_PLANS.map((plan) => (
              <CarouselItem
                key={plan.id}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div
                  className={`group h-full rounded-3xl overflow-hidden border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col ${
                    plan.highlight
                      ? "border-pink-300 ring-2 ring-pink-200"
                      : "border-black/5"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${plan.accent} text-white px-7 pt-7 pb-6 relative`}
                  >
                    {plan.badge && (
                      <span className="absolute top-5 right-5 inline-flex items-center gap-1 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                        <Icon name="Star" size={10} />
                        {plan.badge}
                      </span>
                    )}
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-3 inline-flex mb-4">
                      <Icon name={plan.icon} size={20} />
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.22em] opacity-90 mb-1">
                      {plan.duration}
                    </div>
                    <h3
                      className="text-2xl leading-snug"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                      }}
                    >
                      {plan.title}
                    </h3>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-baseline gap-3 mb-5">
                      <div className="text-3xl font-semibold text-black">
                        {plan.price.toLocaleString("ru-RU")} ₽
                      </div>
                      {plan.oldPrice && (
                        <div className="text-sm text-black/40 line-through">
                          {plan.oldPrice.toLocaleString("ru-RU")} ₽
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      {plan.perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-black/75">
                          <Icon
                            name="Check"
                            size={14}
                            className="text-pink-600 mt-0.5 flex-shrink-0"
                          />
                          <span className="leading-snug">{perk}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleBuyPlan(plan)}
                      className={`mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm uppercase tracking-[0.2em] transition-colors ${
                        plan.highlight
                          ? "bg-pink-600 hover:bg-pink-700 text-white"
                          : "bg-black hover:bg-black/85 text-white"
                      }`}
                    >
                      <Icon name="Sparkles" size={14} />
                      Оформить
                    </button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-white border-black/10 hover:bg-pink-50" />
          <CarouselNext className="hidden sm:flex -right-4 bg-white border-black/10 hover:bg-pink-50" />
        </Carousel>
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