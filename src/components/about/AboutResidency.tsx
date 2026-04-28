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

export default function AboutResidency() {
  const { isAuthenticated, user, updateProfile } = useAuth()

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
    <section id="residency" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-24">
      <SectionHeading
        eyebrow="Резидентство клуба"
        title="Стань частью клуба надолго"
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
    </section>
  )
}