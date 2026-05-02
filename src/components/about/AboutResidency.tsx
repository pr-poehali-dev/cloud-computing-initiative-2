import Icon from "@/components/ui/icon"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useRequests } from "@/contexts/RequestsContext"
import SectionHeading from "@/components/about/SectionHeading"

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
    price: 14000,
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
    id: "quarter",
    title: "Резидентство «Тёплый старт»",
    duration: "3 месяца",
    price: 36000,
    oldPrice: 42000,
    perks: [
      "Все мероприятия 3 месяца без ограничений",
      "Закрытый чат и круги поддержки",
      "Личное знакомство с командой клуба",
      "Скидка 12% на индивидуальные сессии",
    ],
    accent: "from-rose-400 to-pink-500",
    icon: "Heart",
  },
  {
    id: "halfYear",
    title: "Резидентство «Близкий круг»",
    duration: "6 месяцев",
    price: 54000,
    oldPrice: 84000,
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
    duration: "12 месяцев",
    price: 84000,
    oldPrice: 168000,
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

interface Resident {
  name: string
  role: string
  since: string
  quote: string
  photo: string
}

const RESIDENTS: Resident[] = [
  {
    name: "Анастасия К.",
    role: "Основательница студии",
    since: "С нами 2 года",
    quote: "Здесь я нашла подруг, партнёров и саму себя.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/5c4bf05c-35f8-4749-b418-c0e1cca8c492.jpg",
  },
  {
    name: "Вероника М.",
    role: "Маркетолог, наставница",
    since: "С нами 1 год",
    quote: "Клуб «можно» — про право быть собой без оправданий.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/199c539f-65ae-45ff-9dce-788c75bc8605.jpg",
  },
  {
    name: "Ольга С.",
    role: "Психолог, коуч",
    since: "С нами 3 года",
    quote: "Каждая встреча — глоток воздуха в плотном графике.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/7eaa2546-85bc-4980-81be-59714b94eb87.jpg",
  },
  {
    name: "Дарья Л.",
    role: "Креативный продюсер",
    since: "С нами 1.5 года",
    quote: "Тёплый круг, в котором вырастают идеи и смелость.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/ccceea76-3131-4851-bbed-0df24fd39011.jpg",
  },
  {
    name: "Мария Р.",
    role: "Основательница бренда",
    since: "С нами 2 года",
    quote: "Здесь поддерживают так, как умеют только женщины.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/bf4dcd2b-9578-4647-bad3-7521b953678f.jpg",
  },
  {
    name: "Елизавета Н.",
    role: "Юрист, мама",
    since: "С нами 8 месяцев",
    quote: "Наконец нашла место, где можно просто быть.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/2539cd88-42a8-4b5f-a8e8-eaece27e4dc7.jpg",
  },
]

export default function AboutResidency() {
  const { isAuthenticated, user, updateProfile } = useAuth()
  const { addResidencyRequest } = useRequests()

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
    addResidencyRequest({
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`.trim(),
      planTitle: plan.title,
      amount: plan.price,
      createdAt: new Date().toISOString(),
      status: "approved",
    })
    toast.success(`Резидентство «${plan.duration}» оформлено!`, {
      description: "Куратор свяжется с тобой в течение дня.",
    })
  }

  return (
    <section id="residency" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-24">
      <SectionHeading
        eyebrow="Резидентство клуба"
        title=""
        icon="Crown"
        description="Выбери срок — и получи неограниченный доступ к мероприятиям, кругам поддержки и закрытым гостиным."
      />

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

      {/* Current residents carousel */}
      <div className="mt-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-[10px] uppercase tracking-[0.28em] mb-3">
              <Icon name="Heart" size={12} />
              Наши резидентки
            </div>
            <h3
              className="text-3xl md:text-4xl leading-tight text-black/85"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Женщины, которые сейчас в клубе
            </h3>
          </div>
          <div className="hidden md:block text-xs uppercase tracking-[0.22em] text-black/45">
            {RESIDENTS.length}+ резиденток
          </div>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="relative">
          <CarouselContent className="-ml-4">
            {RESIDENTS.map((r) => (
              <CarouselItem
                key={r.name}
                className="pl-4 basis-[78%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="group h-full rounded-3xl overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={r.photo}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur-md text-pink-700 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full">
                      <Icon name="Sparkles" size={10} />
                      {r.since}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div
                        className="text-xl leading-tight"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 500,
                        }}
                      >
                        {r.name}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.22em] opacity-90 mt-0.5">
                        {r.role}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <Icon name="Quote" size={14} className="text-pink-400 mb-2" />
                    <p className="text-sm text-black/70 leading-relaxed italic">
                      «{r.quote}»
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-white border-black/10 hover:bg-pink-50" />
          <CarouselNext className="hidden sm:flex -right-4 bg-white border-black/10 hover:bg-pink-50" />
        </Carousel>
      </div>
    </section>
  )
}