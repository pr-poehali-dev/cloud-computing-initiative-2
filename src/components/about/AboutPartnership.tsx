import { useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import SectionHeading from "@/components/about/SectionHeading"

interface Partner {
  name: string
  category: string
  description: string
  icon: string
  accent: string
}

const PARTNERS: Partner[] = [
  {
    name: "White SPA",
    category: "Спа и красота",
    description: "Премиальный спа-комплекс с хаммамом, массажами и закрытым бассейном.",
    icon: "Flower",
    accent: "from-rose-300 to-pink-400",
  },
  {
    name: "Wine Room",
    category: "Винотека",
    description: "Авторские винные дегустации и закрытые ужины для клубных вечеров.",
    icon: "Wine",
    accent: "from-fuchsia-400 to-purple-500",
  },
  {
    name: "Padel Club",
    category: "Спорт",
    description: "Корты падела и теннисные тренировки с персональным тренером.",
    icon: "Trophy",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    name: "Cycle Studio",
    category: "Фитнес",
    description: "Сайкл-вечеринки с диджеем — фирменный формат тренировок клуба.",
    icon: "Bike",
    accent: "from-amber-400 to-pink-500",
  },
  {
    name: "Café Pushkin",
    category: "Гастрономия",
    description: "Завтраки и бранчи для бизнес-нетворкингов клуба.",
    icon: "Coffee",
    accent: "from-stone-500 to-stone-700",
  },
  {
    name: "Studio «Свет»",
    category: "Фотопродакшен",
    description: "Профессиональная съёмка для резиденток и личных брендов.",
    icon: "Camera",
    accent: "from-pink-400 to-rose-500",
  },
]

const PROGRAM_PERKS = [
  {
    icon: "Users",
    title: "Доступ к женской аудитории",
    text: "Более 500 платежеспособных резиденток клуба — твои потенциальные клиентки.",
  },
  {
    icon: "Megaphone",
    title: "PR и продвижение",
    text: "Анонсы в соцсетях клуба, упоминания в рассылках и публикации в подборках партнёров.",
  },
  {
    icon: "CalendarHeart",
    title: "Совместные события",
    text: "Проводим коллаборации, мастер-классы и закрытые вечера на твоей площадке.",
  },
  {
    icon: "Sparkles",
    title: "Размещение на сайте",
    text: "Постоянное место в разделе «Партнёры» с логотипом, описанием и ссылкой.",
  },
  {
    icon: "Gift",
    title: "Спецпредложения резиденткам",
    text: "Оформляем твою персональную скидку или подарок участницам клуба.",
  },
  {
    icon: "Crown",
    title: "Личный менеджер",
    text: "Сопровождение на всех этапах: от подписания до отчёта по результатам.",
  },
]

const TIERS = [
  {
    name: "Базовый",
    price: "от 50 000 ₽",
    period: "разово",
    perks: [
      "Размещение на странице «Партнёры»",
      "1 совместная активность",
      "Анонс в соцсетях клуба",
    ],
    highlight: false,
    accent: "from-pink-200 to-rose-200",
  },
  {
    name: "Премиум",
    price: "от 150 000 ₽",
    period: "за квартал",
    perks: [
      "Всё из Базового",
      "3 совместных мероприятия",
      "Закрытое представление резиденткам",
      "Спецпредложение и промокод",
      "PR-публикации в рассылке",
    ],
    highlight: true,
    accent: "from-pink-500 via-rose-500 to-fuchsia-600",
  },
  {
    name: "Стратегический",
    price: "индивидуально",
    period: "годовой контракт",
    perks: [
      "Всё из Премиума",
      "Эксклюзив в категории",
      "Брендирование клубных событий",
      "Личный менеджер 24/7",
      "Совместная медийная кампания",
    ],
    highlight: false,
    accent: "from-purple-500 to-fuchsia-600",
  },
]

interface FormState {
  company: string
  contactName: string
  phone: string
  email: string
  category: string
  budget: string
  message: string
}

const EMPTY_FORM: FormState = {
  company: "",
  contactName: "",
  phone: "",
  email: "",
  category: "",
  budget: "",
  message: "",
}

export default function AboutPartnership() {
  const [perksOpen, setPerksOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.contactName || !form.phone) {
      toast.error("Заполни компанию, имя и телефон — этого достаточно")
      return
    }
    setSubmitting(true)
    try {
      const list = JSON.parse(localStorage.getItem("partnership_requests") || "[]")
      list.push({ ...form, createdAt: new Date().toISOString() })
      localStorage.setItem("partnership_requests", JSON.stringify(list))
      await new Promise((r) => setTimeout(r, 600))
      toast.success("Заявка отправлена! Администратор свяжется в течение 1–2 дней.")
      setForm(EMPTY_FORM)
      setFormOpen(false)
      setPerksOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section id="partnership" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
        <SectionHeading
          eyebrow="Партнёрство"
          title=""
          icon="Handshake"
          description="Бренды, которые разделяют ценности клуба «можно» и помогают создавать пространство для женщин."
        />

        {/* Current partners */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
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
                <p className="text-[13px] text-black/60 leading-relaxed">
                  {p.description}
                </p>
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
              onClick={() => setPerksOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-pink-700 hover:bg-pink-50 px-7 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-colors flex-shrink-0"
            >
              <Icon name="Handshake" size={14} />
              Стать партнёром
            </button>
          </div>
        </div>
      </section>

      {/* Perks modal */}
      <Dialog open={perksOpen} onOpenChange={setPerksOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white px-7 py-7">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] mb-3">
              <Icon name="Handshake" size={12} />
              Партнёрская программа
            </div>
            <h3
              className="text-3xl md:text-4xl leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Что получает партнёр клуба «можно»
            </h3>
          </div>

          <div className="overflow-y-auto flex-1 px-7 py-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {PROGRAM_PERKS.map((p) => (
                <div
                  key={p.title}
                  className="flex gap-3 p-4 rounded-2xl bg-pink-50/60 border border-pink-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-pink-600 flex items-center justify-center flex-shrink-0">
                    <Icon name={p.icon} size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-black/85 mb-1">
                      {p.title}
                    </div>
                    <p className="text-[13px] text-black/65 leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Icon name="BadgeDollarSign" size={14} className="text-pink-600" />
              <div className="text-[11px] uppercase tracking-[0.22em] text-pink-700 font-medium">
                Форматы и стоимость
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-2">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`relative rounded-2xl p-5 border ${
                    t.highlight
                      ? "border-transparent text-white shadow-lg"
                      : "bg-white border-black/10"
                  }`}
                  style={
                    t.highlight
                      ? {
                          backgroundImage:
                            "linear-gradient(135deg, rgb(236 72 153), rgb(244 63 94), rgb(192 38 211))",
                        }
                      : undefined
                  }
                >
                  {t.highlight && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-pink-700 text-[10px] uppercase tracking-[0.2em] px-3 py-0.5 rounded-full font-medium shadow">
                      Хит
                    </span>
                  )}
                  <div
                    className={`text-[10px] uppercase tracking-[0.22em] mb-2 ${
                      t.highlight ? "opacity-90" : "text-pink-600"
                    }`}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-2xl mb-1"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    {t.price}
                  </div>
                  <div
                    className={`text-[11px] mb-4 ${
                      t.highlight ? "opacity-80" : "text-black/50"
                    }`}
                  >
                    {t.period}
                  </div>
                  <ul className="space-y-2">
                    {t.perks.map((perk) => (
                      <li
                        key={perk}
                        className={`flex items-start gap-2 text-[13px] leading-snug ${
                          t.highlight ? "text-white/95" : "text-black/75"
                        }`}
                      >
                        <Icon
                          name="Check"
                          size={13}
                          className={`mt-0.5 flex-shrink-0 ${
                            t.highlight ? "text-white" : "text-pink-600"
                          }`}
                        />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="px-7 py-5 border-t border-black/5 bg-white">
            <button
              onClick={() => {
                setPerksOpen(false)
                setTimeout(() => setFormOpen(true), 150)
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:opacity-95 text-white px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-opacity"
            >
              <Icon name="Send" size={14} />
              Стать партнёром — оставить заявку
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application form modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white px-7 py-6">
            <div className="text-[11px] uppercase tracking-[0.28em] opacity-90 mb-2">
              Анкета партнёра
            </div>
            <h3
              className="text-2xl md:text-3xl leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Расскажи о партнёрском предложении
            </h3>
            <p className="text-sm opacity-90 mt-2">
              Заявка попадёт администратору клуба. Мы свяжемся в течение 1–2 рабочих дней.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto flex-1 px-7 py-6 space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Компания / бренд *
              </label>
              <Input
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Название"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                  Контактное лицо *
                </label>
                <Input
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  placeholder="Имя и фамилия"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                  Телефон *
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+7 ..."
                  required
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="company@mail.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                  Сфера / категория
                </label>
                <Input
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="Спа, ресторан, бренд..."
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Желаемый формат / бюджет
              </label>
              <Input
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                placeholder="Базовый / Премиум / индивидуально"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Партнёрское предложение
              </label>
              <Textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={5}
                placeholder="Опиши, что вы готовы предложить клубу и резиденткам, какие коллаборации интересны."
              />
            </div>

            <div className="text-[11px] text-black/50 leading-relaxed">
              Нажимая кнопку, ты соглашаешься на обработку контактных данных для связи
              по партнёрскому предложению.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:opacity-95 disabled:opacity-60 text-white px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-opacity"
            >
              {submitting ? (
                <>
                  <Icon name="Loader2" size={14} className="animate-spin" />
                  Отправляем...
                </>
              ) : (
                <>
                  <Icon name="Send" size={14} />
                  Отправить заявку администратору
                </>
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
