import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import Icon from "@/components/ui/icon"

type Category = "Психология" | "Спорт" | "Развлечения" | "Бизнес" | "Отдых"

interface ClubEvent {
  date: string
  title: string
  category: Category
  time: string
  location: string
  description: string
}

const CATEGORIES: { name: Category; icon: string; color: string }[] = [
  { name: "Психология", icon: "Brain", color: "from-purple-400 to-pink-400" },
  { name: "Спорт", icon: "Dumbbell", color: "from-emerald-400 to-teal-400" },
  { name: "Развлечения", icon: "Sparkles", color: "from-amber-400 to-pink-400" },
  { name: "Бизнес", icon: "Briefcase", color: "from-slate-500 to-slate-700" },
  { name: "Отдых", icon: "Palmtree", color: "from-sky-400 to-cyan-400" },
]

const today = new Date()
const ymd = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

const EVENTS: ClubEvent[] = [
  { date: ymd(addDays(today, 0)), title: "Круг поддержки: я и мои границы", category: "Психология", time: "19:00", location: "Лофт «Резиденция»", description: "Открытый разговор с психологом о личных границах и умении говорить нет." },
  { date: ymd(addDays(today, 1)), title: "Утренняя йога у воды", category: "Спорт", time: "08:30", location: "Парк Горького, набережная", description: "Лёгкая практика для пробуждения тела и спокойного начала дня." },
  { date: ymd(addDays(today, 2)), title: "Вечер виноделия", category: "Развлечения", time: "20:00", location: "Wine Room, Патриаршие", description: "Дегустация авторских вин и неформальные знакомства." },
  { date: ymd(addDays(today, 3)), title: "Мастер-класс: личный бренд", category: "Бизнес", time: "18:00", location: "Коворкинг SOK", description: "Как женщине строить узнаваемость и монетизировать экспертизу." },
  { date: ymd(addDays(today, 4)), title: "Спа-ретрит на весь день", category: "Отдых", time: "11:00", location: "White SPA, Москва-Сити", description: "Хаммам, бассейн, массажи и ужин в кругу клуба." },
  { date: ymd(addDays(today, 5)), title: "Расстановки по Хеллингеру", category: "Психология", time: "17:00", location: "Студия «Тишина»", description: "Системные расстановки на запросы участниц." },
  { date: ymd(addDays(today, 7)), title: "Танцевальный вечер", category: "Развлечения", time: "21:00", location: "Bar 8 Marta", description: "Латина, бачата и живая музыка." },
  { date: ymd(addDays(today, 8)), title: "Пилатес для осанки", category: "Спорт", time: "10:00", location: "Studio Pilates", description: "Глубокая работа с мышцами кора и спиной." },
  { date: ymd(addDays(today, 10)), title: "Завтрак с инвестором", category: "Бизнес", time: "09:00", location: "Café Pushkin", description: "Камерный завтрак с приглашённой гостьей — основательницей фонда." },
  { date: ymd(addDays(today, 12)), title: "Чайная церемония", category: "Отдых", time: "16:00", location: "Чайный клуб «Тэ»", description: "Медитативная церемония и беседа о внутреннем покое." },
  { date: ymd(addDays(today, 14)), title: "Арт-терапия: рисуем эмоции", category: "Психология", time: "18:30", location: "Студия «Цвет»", description: "Без навыков рисования — только чувства и краски." },
  { date: ymd(addDays(today, 16)), title: "Кинопоказ под открытым небом", category: "Развлечения", time: "21:30", location: "Крыша клуба", description: "Авторское кино, плед, глинтвейн." },
]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function EventsModal({ open, onOpenChange }: Props) {
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today)

  const filtered = useMemo(() => {
    if (activeCategories.size === 0) return EVENTS
    return EVENTS.filter((e) => activeCategories.has(e.category))
  }, [activeCategories])

  const eventDates = useMemo(() => filtered.map((e) => new Date(e.date)), [filtered])

  const dayEvent = useMemo(() => {
    if (!selectedDate) return null
    const key = ymd(selectedDate)
    return filtered.find((e) => e.date === key) ?? null
  }, [selectedDate, filtered])

  const toggleCategory = (c: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  const categoryMeta = (c: Category) => CATEGORIES.find((x) => x.name === c)!

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase tracking-[0.2em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            Мероприятия клуба
          </DialogTitle>
          <DialogDescription>
            Выбери категории и дату — мы покажем, что у нас в этот день.
          </DialogDescription>
        </DialogHeader>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 pt-2">
          {CATEGORIES.map((c) => {
            const active = activeCategories.has(c.name)
            return (
              <button
                key={c.name}
                onClick={() => toggleCategory(c.name)}
                className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/15 hover:border-black/40"
                }`}
              >
                <Icon name={c.icon} size={16} />
                {c.name}
              </button>
            )
          })}
          {activeCategories.size > 0 && (
            <button
              onClick={() => setActiveCategories(new Set())}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs text-black/60 hover:text-black"
            >
              <Icon name="X" size={14} />
              Сбросить
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* Calendar */}
          <div className="rounded-2xl border border-black/10 p-2 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{
                hasEvent: "relative font-semibold text-pink-600 after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-pink-500",
              }}
              className="mx-auto"
            />
          </div>

          {/* Day event */}
          <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-pink-50 to-white p-5 flex flex-col">
            {selectedDate ? (
              <>
                <div className="text-xs uppercase tracking-[0.2em] text-black/50 mb-2">
                  {selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" })}
                </div>

                {dayEvent ? (
                  <>
                    <span className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${categoryMeta(dayEvent.category).color} mb-3`}>
                      <Icon name={categoryMeta(dayEvent.category).icon} size={12} />
                      {dayEvent.category}
                    </span>
                    <h3 className="text-xl font-medium leading-snug mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {dayEvent.title}
                    </h3>
                    <div className="space-y-2 text-sm text-black/70 mb-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={14} />
                        {dayEvent.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={14} />
                        {dayEvent.location}
                      </div>
                    </div>
                    <p className="text-sm text-black/75 leading-relaxed">{dayEvent.description}</p>

                    <button className="mt-auto pt-5">
                      <span className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-black text-white text-sm uppercase tracking-[0.2em] hover:bg-black/85 transition-colors">
                        Записаться
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-black/50 py-8">
                    <Icon name="CalendarOff" size={32} />
                    <p className="mt-3 text-sm">В этот день мероприятий нет</p>
                    <p className="text-xs mt-1">Выбери другую дату с розовой точкой</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-black/50 text-sm">
                Выбери дату в календаре
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
