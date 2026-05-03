import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRequests } from "@/contexts/RequestsContext"
import { toast } from "sonner"

const FORMATS = [
  { id: "private", label: "Закрытый ужин", icon: "Wine" },
  { id: "spa", label: "Спа-день / ретрит", icon: "Flower" },
  { id: "lecture", label: "Лекция / мастер-класс", icon: "Mic" },
  { id: "party", label: "Девичник / праздник", icon: "Sparkles" },
  { id: "yoga", label: "Йога / телесные практики", icon: "Heart" },
  { id: "custom", label: "Свой формат", icon: "Wand2" },
]

const PERKS = [
  { icon: "Crown", text: "Полный сервис под ключ — от концепта до финального тоста" },
  { icon: "Users", text: "Подбор состава: только женский круг или открытый формат" },
  { icon: "MapPin", text: "Лучшие площадки города — спа, рестораны, лофты, виллы" },
  { icon: "Sparkles", text: "Декор, флористика, фотограф, спикеры — всё включено" },
]

export default function MojnoEvents() {
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Header */}
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pink-300/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-fuchsia-300/40 blur-3xl"
        />

        <div className="relative max-w-5xl mx-auto px-5 pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-pink-700 mb-5 shadow-sm">
            <Icon name="Sparkles" size={12} />
            Закажи своё мероприятие
          </div>
          <h1
            className="text-black/85 leading-[1.05] mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
            }}
          >
            МОЖНО <span className="italic text-pink-600">EVENTS</span>
          </h1>
          <p className="text-base md:text-lg text-black/65 max-w-2xl mx-auto leading-relaxed">
            Создаём женские события под ключ — от тёплого вечера в кругу подруг до закрытых
            ретритов и больших праздников. Расскажи, что хочешь, — соберём команду и площадку.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-5xl mx-auto px-5 pb-10">
        <div className="grid sm:grid-cols-2 gap-3">
          {PERKS.map((p) => (
            <div
              key={p.text}
              className="flex gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur border border-pink-100"
            >
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white flex items-center justify-center flex-shrink-0">
                <Icon name={p.icon} size={16} />
              </span>
              <p className="text-sm text-black/75 leading-relaxed self-center">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
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
            <p className="text-sm opacity-90 mt-2">
              Заявка попадёт в админ-панель клуба. Свяжемся в течение дня и предложим варианты.
            </p>
          </div>

          <div className="p-7 space-y-5">
            <div>
              <Label>Формат мероприятия</Label>
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
              <div>
                <Label>Имя*</Label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Как к тебе обращаться"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Телефон*</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 ..."
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@mail.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Желаемая дата</Label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Например: 12 июля или конец августа"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Количество гостей</Label>
                <Input
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="6 / 12 / 30+"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Бюджет</Label>
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="до 100к / 100–300к / открытый"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label>Расскажи подробнее</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Какое настроение, повод, какие активности хочется, какие гости..."
                className="mt-1.5"
              />
            </div>

            <div className="text-[11px] text-black/50 leading-relaxed">
              Нажимая кнопку, ты соглашаешься на обработку контактных данных для связи по
              заявке.
            </div>

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
      </section>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 font-medium">
      {children}
    </label>
  )
}
