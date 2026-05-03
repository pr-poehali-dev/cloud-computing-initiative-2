import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRequests } from "@/contexts/RequestsContext"
import { useDirectory } from "@/contexts/DirectoryContext"
import { useTestimonials } from "@/contexts/TestimonialsContext"
import { toast } from "sonner"

type Section = "order" | "gallery" | "team" | "pricing" | "testimonials"

const MENU: { id: Section; label: string; icon: string }[] = [
  { id: "order", label: "Заказать", icon: "Sparkles" },
  { id: "gallery", label: "Галерея", icon: "Images" },
  { id: "team", label: "Команда", icon: "Users" },
  { id: "pricing", label: "Цены и условия", icon: "BadgeDollarSign" },
  { id: "testimonials", label: "Отзывы", icon: "MessageSquareQuote" },
]

const FOUNDER_PHOTO =
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/bucket/730bdab3-0cef-4810-afab-704db40f3d73.jpg"

const PAST_GALLERY = [
  {
    id: "g1",
    title: "Винный вечер «Розовый сад»",
    date: "Май 2024",
    guests: 24,
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/5c4bf05c-35f8-4749-b418-c0e1cca8c492.jpg",
  },
  {
    id: "g2",
    title: "Спа-ретрит у воды",
    date: "Апрель 2024",
    guests: 12,
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/199c539f-65ae-45ff-9dce-788c75bc8605.jpg",
  },
  {
    id: "g3",
    title: "Девичник «Цветение»",
    date: "Март 2024",
    guests: 18,
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/7eaa2546-85bc-4980-81be-59714b94eb87.jpg",
  },
  {
    id: "g4",
    title: "Закрытый ужин-нетворкинг",
    date: "Февраль 2024",
    guests: 16,
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/ccceea76-3131-4851-bbed-0df24fd39011.jpg",
  },
  {
    id: "g5",
    title: "Йога-утро «Лотос»",
    date: "Январь 2024",
    guests: 22,
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/bf4dcd2b-9578-4647-bad3-7521b953678f.jpg",
  },
  {
    id: "g6",
    title: "Новогодний бал «МОЖНО»",
    date: "Декабрь 2023",
    guests: 60,
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/2539cd88-42a8-4b5f-a8e8-eaece27e4dc7.jpg",
  },
]

const TIERS = [
  {
    name: "Камерный формат",
    price: "от 80 000 ₽",
    note: "до 12 гостей",
    perks: [
      "Подбор площадки (ресторан, лофт, спа)",
      "Согласование меню и сервировка",
      "Координатор на вечере",
      "Подарки гостям",
    ],
    highlight: false,
  },
  {
    name: "Премиум-вечер",
    price: "от 250 000 ₽",
    note: "до 30 гостей",
    perks: [
      "Всё из «Камерного»",
      "Авторский декор и флористика",
      "Спикер или артист по запросу",
      "Фотограф и видеограф",
      "Персональный сценарий",
    ],
    highlight: true,
  },
  {
    name: "Большой ивент",
    price: "индивидуально",
    note: "30+ гостей",
    perks: [
      "Всё из «Премиума»",
      "Брендирование и сувениры",
      "Несколько локаций / спа-ретрит",
      "PR и анонс в соцсетях клуба",
      "Команда из 5+ человек",
    ],
    highlight: false,
  },
]

const STEPS = [
  { icon: "MessageCircle", title: "Заявка", text: "Заполняешь форму или пишешь нам напрямую." },
  { icon: "Phone", title: "Звонок-знакомство", text: "Обсуждаем повод, настроение, бюджет, сроки." },
  { icon: "FileText", title: "Концепт и смета", text: "Присылаем 1–2 варианта концепта со стоимостью." },
  { icon: "Sparkles", title: "Воплощение", text: "Берём всю организацию на себя — ты только наслаждаешься." },
]

const CONDITIONS = [
  "Минимальный срок подготовки — 14 дней (для премиум — от 30 дней).",
  "Предоплата 50% подтверждает дату и команду, остаток — за 3 дня до события.",
  "Возможна оплата с расчётного счёта компании, выдаём закрывающие документы.",
  "Бесплатная замена даты при форс-мажоре до 7 дней до события.",
]

export default function MojnoEvents() {
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>("order")
  const [menuOpen, setMenuOpen] = useState(false)

  const currentLabel = MENU.find((m) => m.id === section)?.label || ""
  const currentIcon = MENU.find((m) => m.id === section)?.icon || "Menu"

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-fuchsia-50">
      <header className="bg-white/70 backdrop-blur-md border-b border-pink-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-black/65 hover:text-pink-600 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </button>
          <div className="text-[10px] uppercase tracking-[0.28em] text-pink-600 font-medium">
            МОЖНО EVENTS
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 pt-6">
        <nav className="hidden md:flex bg-white rounded-2xl border border-pink-100 shadow-sm p-1.5 gap-1">
          {MENU.map((m) => {
            const active = m.id === section
            return (
              <button
                key={m.id}
                onClick={() => setSection(m.id)}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-md shadow-pink-300"
                    : "text-black/65 hover:bg-pink-50"
                }`}
              >
                <Icon name={m.icon} size={15} />
                {m.label}
              </button>
            )
          })}
        </nav>

        <div className="md:hidden relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full bg-white rounded-2xl border border-pink-100 shadow-sm px-5 py-4 flex items-center gap-3"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white">
              <Icon name={currentIcon} size={15} />
            </span>
            <div className="flex-1 text-left">
              <div className="text-[10px] uppercase tracking-[0.22em] text-pink-600">
                Раздел
              </div>
              <div className="text-base font-medium">{currentLabel}</div>
            </div>
            <Icon
              name={menuOpen ? "ChevronUp" : "ChevronDown"}
              size={18}
              className="text-black/40"
            />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute z-40 left-0 right-0 mt-2 bg-white rounded-2xl border border-pink-100 shadow-xl overflow-hidden">
                {MENU.map((m) => {
                  const active = m.id === section
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSection(m.id)
                        setMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                        active
                          ? "bg-gradient-to-r from-pink-50 to-fuchsia-50 text-pink-700"
                          : "hover:bg-pink-50/40"
                      }`}
                    >
                      <Icon name={m.icon} size={15} />
                      <span className="text-sm">{m.label}</span>
                      {active && (
                        <Icon name="Check" size={14} className="ml-auto text-pink-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {section === "order" && <OrderSection />}
        {section === "gallery" && <GallerySection />}
        {section === "team" && <TeamSection />}
        {section === "pricing" && (
          <PricingSection onOrder={() => setSection("order")} />
        )}
        {section === "testimonials" && <TestimonialsSection />}
      </main>
    </div>
  )
}

/* ───── Order ───── */

const FORMATS = [
  { id: "private", label: "Закрытый ужин", icon: "Wine" },
  { id: "spa", label: "Спа-день / ретрит", icon: "Flower" },
  { id: "lecture", label: "Лекция / мастер-класс", icon: "Mic" },
  { id: "party", label: "Девичник / праздник", icon: "Sparkles" },
  { id: "yoga", label: "Йога / телесные практики", icon: "Heart" },
  { id: "custom", label: "Свой формат", icon: "Wand2" },
]

function OrderSection() {
  const { addEventOrder } = useRequests()
  const [submitting, setSubmitting] = useState(false)
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [format, setFormat] = useState("")
  const [date, setDate] = useState("")
  const [guests, setGuests] = useState("")
  const [budget, setBudget] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim() || !phone.trim()) {
      toast.error("Заполни имя и телефон — этого достаточно для связи")
      return
    }
    setSubmitting(true)
    try {
      addEventOrder({
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        format: format || "Не выбран",
        date: date.trim(),
        guests: guests.trim(),
        budget: budget.trim(),
        message: message.trim(),
      })
      await new Promise((r) => setTimeout(r, 600))
      toast.success("Заявка отправлена! Свяжемся в течение дня.")
      setContactName("")
      setPhone("")
      setEmail("")
      setFormat("")
      setDate("")
      setGuests("")
      setBudget("")
      setMessage("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Hero
        title="Закажи своё мероприятие"
        text="Создаём женские события под ключ — расскажи, что хочешь, и мы соберём команду, площадку и атмосферу."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[28px] shadow-xl shadow-pink-200/40 border border-pink-100 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white px-7 py-6">
          <div className="text-[11px] uppercase tracking-[0.28em] opacity-90 mb-2">
            Заявка на мероприятие
          </div>
          <h2
            className="text-2xl md:text-3xl leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Расскажи о своей идее
          </h2>
        </div>

        <div className="p-7 space-y-5">
          <div>
            <FieldLabel>Формат мероприятия</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {FORMATS.map((f) => {
                const active = format === f.label
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.label)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all text-center ${
                      active
                        ? "bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-300"
                        : "bg-white border-pink-100 text-black/70 hover:border-pink-300 hover:bg-pink-50/50"
                    }`}
                  >
                    <Icon name={f.icon} size={18} />
                    <span className="text-[11px] leading-tight">{f.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Имя*">
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} required />
            </Field>
            <Field label="Телефон*">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ..." required />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Желаемая дата">
              <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="12 июля" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Гостей">
              <Input value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="6 / 12 / 30+" />
            </Field>
            <Field label="Бюджет">
              <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="до 100к / 100–300к" />
            </Field>
          </div>
          <Field label="Расскажи подробнее">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:opacity-95 disabled:opacity-60 text-white px-6 py-4 text-xs uppercase tracking-[0.22em] font-medium transition-opacity shadow-lg shadow-pink-300"
          >
            {submitting ? (
              <>
                <Icon name="Loader2" size={14} className="animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                <Icon name="Send" size={14} />
                Отправить заявку
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ───── Gallery ───── */

function GallerySection() {
  const [active, setActive] = useState<string | null>(null)
  const photo = PAST_GALLERY.find((p) => p.id === active)

  return (
    <div className="space-y-6">
      <Hero
        title="Уже провели"
        text="Атмосфера, гости и моменты, которые делают наши мероприятия особенными."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PAST_GALLERY.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100"
          >
            <img
              src={g.photo}
              alt={g.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white text-left">
              <div className="text-[10px] uppercase tracking-[0.18em] opacity-90">
                {g.date} · {g.guests} гостей
              </div>
              <div
                className="text-sm leading-tight mt-0.5"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {g.title}
              </div>
            </div>
          </button>
        ))}
      </div>

      {photo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
            onClick={() => setActive(null)}
          >
            <Icon name="X" size={18} />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={photo.photo}
              alt={photo.title}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="text-white text-center mt-4">
              <div
                className="text-2xl"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {photo.title}
              </div>
              <div className="text-sm opacity-70 mt-1">
                {photo.date} · {photo.guests} гостей
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───── Team ───── */

function TeamSection() {
  const { team } = useDirectory()

  return (
    <div className="space-y-6">
      <Hero
        title="Команда МОЖНО EVENTS"
        text="Те, кто продумает каждую мелочь и сделает твоё событие особенным."
      />

      <div className="rounded-3xl overflow-hidden bg-white border border-pink-100 shadow-lg shadow-pink-200/40 grid sm:grid-cols-[260px_1fr]">
        <div className="aspect-square sm:aspect-auto sm:h-full overflow-hidden bg-stone-100">
          <img src={FOUNDER_PHOTO} alt="Юлия Мустафина" className="w-full h-full object-cover" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] mb-3">
            <Icon name="Crown" size={11} />
            Руководитель
          </div>
          <h3
            className="text-2xl md:text-3xl leading-tight mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Юлия Мустафина
          </h3>
          <p className="text-sm text-black/65 leading-relaxed">
            Основательница клуба «МОЖНО» и идейный вдохновитель направления EVENTS.
            Лично курирует каждое мероприятие — от первого звонка до финального тоста.
          </p>
        </div>
      </div>

      <div>
        <h4
          className="text-xl mb-4 text-black/85"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Команда
        </h4>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {team.map((m) => (
            <article
              key={m.id}
              className="rounded-2xl overflow-hidden bg-white border border-pink-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={`${m.firstName} ${m.lastName}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-300">
                    <Icon name="User" size={42} />
                  </div>
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${m.accent} mix-blend-multiply opacity-15`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-[10px] uppercase tracking-[0.22em] opacity-90 mb-0.5">
                    {m.role}
                  </div>
                  <div
                    className="text-lg leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                  >
                    {m.firstName} {m.lastName}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───── Pricing ───── */

function PricingSection({ onOrder }: { onOrder: () => void }) {
  return (
    <div className="space-y-6">
      <Hero
        title="Цены и условия"
        text="Три формата, чтобы каждая нашла своё. Точная стоимость — после знакомства и брифа."
      />

      <div className="grid md:grid-cols-3 gap-4">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl p-6 border ${
              t.highlight
                ? "border-transparent text-white shadow-xl shadow-pink-300/40"
                : "bg-white border-pink-100 shadow-sm"
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
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-pink-700 text-[10px] uppercase tracking-[0.22em] px-3 py-1 rounded-full font-medium shadow">
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
              className="text-3xl mb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              {t.price}
            </div>
            <div className={`text-xs mb-5 ${t.highlight ? "opacity-80" : "text-black/50"}`}>
              {t.note}
            </div>
            <ul className="space-y-2">
              {t.perks.map((p) => (
                <li
                  key={p}
                  className={`flex items-start gap-2 text-sm leading-snug ${
                    t.highlight ? "text-white/95" : "text-black/75"
                  }`}
                >
                  <Icon
                    name="Check"
                    size={14}
                    className={`mt-0.5 flex-shrink-0 ${
                      t.highlight ? "text-white" : "text-pink-600"
                    }`}
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm">
        <h3
          className="text-2xl mb-5 text-black/85"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Как мы работаем
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white flex items-center justify-center mb-3">
                <Icon name={s.icon} size={16} />
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-pink-600 mb-1">
                Шаг {i + 1}
              </div>
              <div className="font-medium text-sm text-black/85 mb-1">{s.title}</div>
              <p className="text-xs text-black/60 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm">
        <h3
          className="text-2xl mb-4 text-black/85"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Условия
        </h3>
        <ul className="space-y-3">
          {CONDITIONS.map((c) => (
            <li key={c} className="flex items-start gap-3 text-sm text-black/75 leading-relaxed">
              <Icon name="ShieldCheck" size={16} className="text-pink-600 mt-0.5 flex-shrink-0" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={onOrder}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:opacity-95 text-white px-8 py-4 text-xs uppercase tracking-[0.22em] font-medium shadow-lg shadow-pink-300"
        >
          <Icon name="Sparkles" size={14} />
          Оставить заявку
        </button>
      </div>
    </div>
  )
}

/* ───── Testimonials ───── */

function TestimonialsSection() {
  const { testimonials, submitTestimonial } = useTestimonials()
  const approved = useMemo(
    () => testimonials.filter((t) => t.status === "approved"),
    [testimonials]
  )

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [text, setText] = useState("")
  const [rating, setRating] = useState(5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) {
      toast.error("Заполни имя и текст отзыва")
      return
    }
    submitTestimonial({
      authorName: name.trim(),
      authorEmail: email.trim(),
      text: text.trim(),
      rating,
    })
    toast.success("Спасибо! Отзыв появится после модерации.")
    setName("")
    setEmail("")
    setText("")
    setRating(5)
  }

  return (
    <div className="space-y-6">
      <Hero
        title="Отзывы гостей"
        text="Что говорят женщины, которые уже побывали на наших мероприятиях."
      />

      {approved.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-10 text-center text-black/55">
          <Icon name="Quote" size={32} className="mx-auto text-pink-300 mb-3" />
          Пока отзывов нет. Стань первой!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {approved.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl bg-white border border-pink-100 p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={14}
                    className={
                      i < (t.rating || 5) ? "text-pink-500 fill-pink-500" : "text-pink-100"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-black/75 leading-relaxed italic mb-4">«{t.text}»</p>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-black/85">{t.authorName}</div>
                <div className="text-[11px] text-black/45">
                  {new Date(t.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-pink-100 p-6 sm:p-8 shadow-sm space-y-4"
      >
        <h3
          className="text-2xl text-black/85"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Поделись впечатлениями
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Имя*">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="не публикуется"
            />
          </Field>
        </div>
        <div>
          <FieldLabel>Оценка</FieldLabel>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="p-1"
              >
                <Icon
                  name="Star"
                  size={22}
                  className={
                    i < rating
                      ? "text-pink-500 fill-pink-500"
                      : "text-pink-200 hover:text-pink-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>
        <Field label="Отзыв*">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Что понравилось, что запомнилось..."
            required
          />
        </Field>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:opacity-95 text-white px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium shadow-md shadow-pink-300"
        >
          <Icon name="Send" size={14} />
          Отправить отзыв
        </button>
      </form>
    </div>
  )
}

/* ───── Shared ───── */

function Hero({ title, text }: { title: string; text: string }) {
  return (
    <div className="text-center pt-2 pb-2">
      <h1
        className="text-black/85 leading-[1.1] mb-3"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          fontSize: "clamp(1.8rem, 5vw, 3rem)",
        }}
      >
        {title}
      </h1>
      <p className="text-base text-black/65 max-w-2xl mx-auto leading-relaxed">{text}</p>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 font-medium">
      {children}
    </label>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
