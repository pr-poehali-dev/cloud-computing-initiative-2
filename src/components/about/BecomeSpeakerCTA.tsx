import { useState } from "react"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const SPEAKER_PERKS = [
  {
    icon: "Users",
    title: "Тёплая женская аудитория",
    text: "Резидентки приходят за глубиной — слушают вовлечённо, задают живые вопросы, остаются на нетворкинг.",
  },
  {
    icon: "Camera",
    title: "Профессиональный продакшен",
    text: "Свет, звук, фото и видео — всё включено. На выходе получаешь готовый контент для соцсетей.",
  },
  {
    icon: "Megaphone",
    title: "PR и анонсирование",
    text: "Анонсы в соцсетях клуба, рассылках и в сообществе. Ты получаешь новых подписчиц и клиенток.",
  },
  {
    icon: "Heart",
    title: "Гонорар и оплата",
    text: "Все выступления оплачиваются. Резидентам клуба — приоритет и повышенный гонорар.",
  },
  {
    icon: "Crown",
    title: "Статус резидента-спикера",
    text: "Постоянное место на странице «Спикеры», участие в фирменных событиях и ретритах.",
  },
  {
    icon: "Sparkles",
    title: "Премиальная атмосфера",
    text: "Эстетичные локации, цветы, угощения и команда, которая делает выступление праздником.",
  },
]

const TOPICS = [
  "Психология и отношения",
  "Бизнес и предпринимательство",
  "Стиль и мода",
  "Здоровье и тело",
  "Сексуальность и проявленность",
  "Творчество и контент",
  "Финансы и инвестиции",
  "Материнство",
]

interface FormState {
  name: string
  phone: string
  email: string
  expertise: string
  topic: string
  experience: string
  socials: string
  message: string
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  expertise: "",
  topic: "",
  experience: "",
  socials: "",
  message: "",
}

export default function BecomeSpeakerCTA() {
  const [perksOpen, setPerksOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.expertise) {
      toast.error("Заполни имя, телефон и экспертизу — этого достаточно")
      return
    }
    setSubmitting(true)
    try {
      const list = JSON.parse(localStorage.getItem("speaker_requests") || "[]")
      list.push({ ...form, createdAt: new Date().toISOString() })
      localStorage.setItem("speaker_requests", JSON.stringify(list))
      await new Promise((r) => setTimeout(r, 600))
      toast.success("Заявка отправлена! Администратор клуба свяжется с тобой.")
      setForm(EMPTY_FORM)
      setFormOpen(false)
      setPerksOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white p-8 md:p-10 mt-10">
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
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.28em] mb-3">
              <Icon name="Mic" size={12} />
              Открытый набор спикеров
            </div>
            <h3
              className="text-3xl md:text-4xl leading-tight mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Хочешь выступить перед нашими резидентками?
            </h3>
            <p className="text-sm md:text-base opacity-90 leading-relaxed">
              Расскажи о своей экспертизе на сцене клуба «можно». Мы создадим для тебя
              тёплую и эстетичную атмосферу, в которой выступать — одно удовольствие.
            </p>
          </div>
          <button
            onClick={() => setPerksOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-pink-700 hover:bg-pink-50 px-7 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-colors flex-shrink-0"
          >
            <Icon name="Mic" size={14} />
            Стать спикером
          </button>
        </div>
      </div>

      {/* Perks modal */}
      <Dialog open={perksOpen} onOpenChange={setPerksOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white px-7 py-7">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] mb-3">
              <Icon name="Mic" size={12} />
              Спикеры клуба «можно»
            </div>
            <h3
              className="text-3xl md:text-4xl leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Почему выступать у нас — особенный опыт
            </h3>
          </div>

          <div className="overflow-y-auto flex-1 px-7 py-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {SPEAKER_PERKS.map((p) => (
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

            <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Compass" size={14} className="text-pink-600" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-pink-700 font-medium">
                  Темы, которые ищем
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-white text-xs text-black/70 border border-pink-100"
                  >
                    {t}
                  </span>
                ))}
              </div>
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
              Заполнить анкету спикера
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white px-7 py-6">
            <div className="text-[11px] uppercase tracking-[0.28em] opacity-90 mb-2">
              Анкета спикера
            </div>
            <h3
              className="text-2xl md:text-3xl leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Расскажи о себе и своей теме
            </h3>
            <p className="text-sm opacity-90 mt-2">
              Заявка попадёт администратору клуба. Мы свяжемся в течение 1–2 рабочих дней.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto flex-1 px-7 py-6 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                  Имя и фамилия *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Как тебя представить"
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
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@mail.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Профессия / экспертиза *
              </label>
              <Input
                value={form.expertise}
                onChange={(e) => update("expertise", e.target.value)}
                placeholder="Например: психолог, основательница бренда, стилист"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Тема выступления
              </label>
              <Input
                value={form.topic}
                onChange={(e) => update("topic", e.target.value)}
                placeholder="О чём ты хочешь рассказать"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Опыт выступлений
              </label>
              <Input
                value={form.experience}
                onChange={(e) => update("experience", e.target.value)}
                placeholder="Где выступала, какая аудитория"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Соцсети / портфолио
              </label>
              <Input
                value={form.socials}
                onChange={(e) => update("socials", e.target.value)}
                placeholder="@instagram, сайт, telegram"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                О чём хочешь рассказать резиденткам
              </label>
              <Textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={4}
                placeholder="Краткий тезис, формат (лекция, мастер-класс, разбор), хронометраж"
              />
            </div>

            <div className="text-[11px] text-black/50 leading-relaxed">
              Нажимая кнопку, ты соглашаешься на обработку контактных данных для связи
              по заявке.
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
