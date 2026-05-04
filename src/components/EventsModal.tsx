import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Icon from "@/components/ui/icon"
import { toast } from "sonner"
import { EVENTS, CATEGORIES, today, ymd, type ClubEvent, type EventCategory as Category } from "@/data/events"
import { useAuth } from "@/contexts/AuthContext"

const REMINDER_OPTIONS = [
  { value: "15m", label: "За 15 минут" },
  { value: "1h", label: "За 1 час" },
  { value: "3h", label: "За 3 часа" },
  { value: "1d", label: "За 1 день" },
  { value: "3d", label: "За 3 дня" },
  { value: "1w", label: "За неделю" },
]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

type View = "list" | "register"

const REGISTRATIONS_KEY = "mojno_event_registrations"
const CUSTOM_EVENTS_KEY = "mojno_custom_events"

interface StoredRegistration {
  email: string
  eventTitle: string
  category: Category
  date: string
  registeredAt: string
  status: "paid" | "pending_admin" | "deposit" | "cancel_pending" | "cancelled"
  role?: string
  amount?: number
  pointsUsed?: number
  cashPaid?: number
  telegram?: string
  cancelReason?: string
  cancelRequestedAt?: string
}

const readCustomEvents = (): ClubEvent[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const readRegistrations = (): StoredRegistration[] => {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function EventsModal({ open, onOpenChange }: Props) {
  const { user, updateProfile } = useAuth()
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today)
  const [view, setView] = useState<View>("list")
  const [customEvents, setCustomEvents] = useState<ClubEvent[]>([])
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([])

  useEffect(() => {
    if (open) {
      setCustomEvents(readCustomEvents())
      setRegistrations(readRegistrations())
    }
  }, [open])

  // Registration form state
  const [regName, setRegName] = useState("")
  const [regContact, setRegContact] = useState("")
  const [regTelegram, setRegTelegram] = useState("")
  const [notifyMethod, setNotifyMethod] = useState<"email" | "phone">("email")
  const [notifyEmail, setNotifyEmail] = useState("")
  const [notifyPhone, setNotifyPhone] = useState("")
  const [reminder, setReminder] = useState("1d")
  const [comment, setComment] = useState("")
  const [usePoints, setUsePoints] = useState(false)

  // Автозаполнение всех известных полей из профиля при открытии формы записи
  useEffect(() => {
    if (view !== "register" || !user) return
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
    if (!regName && fullName) setRegName(fullName)
    if (!regContact && user.phone) setRegContact(user.phone)
    if (!regTelegram && user.telegram) setRegTelegram(user.telegram)
    if (!notifyEmail && user.email) setNotifyEmail(user.email)
    if (!notifyPhone && user.phone) setNotifyPhone(user.phone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, user])

  const allEvents = useMemo(() => [...customEvents, ...EVENTS], [customEvents])

  const filtered = useMemo(() => {
    if (activeCategories.size === 0) return allEvents
    return allEvents.filter((e) => activeCategories.has(e.category))
  }, [activeCategories, allEvents])

  const eventDates = useMemo(() => filtered.map((e) => new Date(e.date)), [filtered])

  const dayEvent = useMemo(() => {
    if (!selectedDate) return null
    const key = ymd(selectedDate)
    return filtered.find((e) => e.date === key) ?? null
  }, [selectedDate, filtered])

  // Count current registrations for the selected event
  const registeredCount = useMemo(() => {
    if (!dayEvent) return 0
    return registrations.filter((r) => r.eventTitle === dayEvent.title).length
  }, [dayEvent, registrations])

  const isFull = useMemo(() => {
    if (!dayEvent || !dayEvent.capacity || dayEvent.capacity <= 0) return false
    return registeredCount >= dayEvent.capacity
  }, [dayEvent, registeredCount])

  const role = user?.role || "member"
  const userBalance = user?.points || 0
  const isBlogger = role === "blogger"
  const isResident = role === "resident"
  const isTeam = role === "team"
  const insufficientBalance = isBlogger && dayEvent ? userBalance < dayEvent.price : false

  // Скидка баллами для участниц/команды (макс 20% от стоимости, не больше доступных баллов)
  const maxPointsForEvent = dayEvent ? Math.floor(dayEvent.price * 0.2) : 0
  const canUsePoints = !isResident && !isBlogger && dayEvent && dayEvent.price > 0 && userBalance > 0
  const pointsToUse = usePoints && canUsePoints ? Math.min(userBalance, maxPointsForEvent) : 0
  const cashToPay = dayEvent ? dayEvent.price - pointsToUse : 0

  const toggleCategory = (c: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  const categoryMeta = (c: Category) => CATEGORIES.find((x) => x.name === c)!

  const resetForm = () => {
    setRegName("")
    setRegContact("")
    setRegTelegram("")
    setNotifyMethod("email")
    setNotifyEmail("")
    setNotifyPhone("")
    setReminder("1d")
    setComment("")
    setUsePoints(false)
  }

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dayEvent) return
    if (isFull) {
      toast.error("Мест уже нет — свяжись с администратором.")
      return
    }
    const tgClean = regTelegram.trim().replace(/^@/, "")
    if (!tgClean) {
      toast.error("Укажи Telegram — он нужен, чтобы добавить тебя в группу мероприятия")
      return
    }
    const reminderLabel = REMINDER_OPTIONS.find((r) => r.value === reminder)?.label
    const channel = notifyMethod === "email" ? `на почту ${notifyEmail}` : `на телефон ${notifyPhone}`

    // Determine status by role
    let status: StoredRegistration["status"] = "paid"
    let amount = dayEvent.price
    let pointsUsed = 0
    let cashPaid = dayEvent.price
    if (isResident) {
      status = "pending_admin"
      amount = 0
      cashPaid = 0
    } else if (isBlogger) {
      status = "deposit"
      if (userBalance < dayEvent.price) {
        toast.error(
          `Недостаточно баллов на депозите. Нужно ${dayEvent.price.toLocaleString("ru-RU")}, есть ${userBalance.toLocaleString("ru-RU")}.`
        )
        return
      }
      // списываем с депозита
      updateProfile({ points: userBalance - dayEvent.price })
      amount = dayEvent.price
      pointsUsed = dayEvent.price
      cashPaid = 0
    } else {
      // member / team: возможна доплата баллами до 20%
      pointsUsed = pointsToUse
      cashPaid = cashToPay
      if (pointsUsed > 0) {
        updateProfile({ points: userBalance - pointsUsed })
      }
    }

    // Persist registration
    if (user) {
      try {
        const list: StoredRegistration[] = readRegistrations()
        list.push({
          email: user.email,
          eventTitle: dayEvent.title,
          category: dayEvent.category,
          date: dayEvent.date,
          registeredAt: new Date().toISOString(),
          status,
          role,
          amount,
          pointsUsed,
          cashPaid,
          telegram: `@${tgClean}`,
        })
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(list))
        setRegistrations(list)
      } catch {
        /* ignore */
      }
    }

    if (status === "pending_admin") {
      toast.success(`Заявка на «${dayEvent.title}» отправлена админу.`, {
        description: "Администратор подтвердит запись и выставит доплату при необходимости.",
      })
    } else if (status === "deposit") {
      toast.success(`Запись на «${dayEvent.title}» подтверждена!`, {
        description: `С депозита списано ${dayEvent.price.toLocaleString("ru-RU")} баллов. Напомним ${reminderLabel?.toLowerCase()} ${channel}.`,
      })
    } else {
      toast.success(`Переходим к оплате «${dayEvent.title}»`, {
        description: `Напомним ${reminderLabel?.toLowerCase()} ${channel}.`,
      })
    }
    resetForm()
    setView("list")
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setView("list")
      resetForm()
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto">
        {view === "list" && (
          <>
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
                      active ? "bg-black text-white border-black" : "bg-white text-black border-black/15 hover:border-black/40"
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
                          <div className="flex items-center gap-2 font-semibold text-black">
                            <Icon name="Wallet" size={14} />
                            {dayEvent.price.toLocaleString("ru-RU")} ₽
                          </div>
                          {dayEvent.capacity && dayEvent.capacity > 0 && (
                            <div className="flex items-center gap-2">
                              <Icon name="Users" size={14} />
                              <span>
                                {registeredCount}/{dayEvent.capacity}{" "}
                                {isFull ? (
                                  <span className="text-red-500 font-medium">— мест нет</span>
                                ) : (
                                  <span className="text-black/50">
                                    — осталось {dayEvent.capacity - registeredCount}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-black/75 leading-relaxed">{dayEvent.description}</p>

                        {isFull ? (
                          <a
                            href="https://t.me/+QgiLIa1gFRY4Y2Iy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto pt-5 block"
                          >
                            <span className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-fuchsia-600 text-white text-sm uppercase tracking-[0.2em] hover:opacity-95 transition-opacity">
                              <Icon name="MessageCircle" size={16} />
                              Связаться с администратором
                            </span>
                          </a>
                        ) : (
                          <button onClick={() => setView("register")} className="mt-auto pt-5 text-left">
                            <span className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-black text-white text-sm uppercase tracking-[0.2em] hover:bg-black/85 transition-colors">
                              <Icon name={isResident ? "ShieldCheck" : isBlogger ? "Wallet" : "CalendarCheck"} size={16} />
                              {isResident
                                ? "Записаться через администратора"
                                : isBlogger
                                ? "Записаться (с депозита)"
                                : "Записаться"}
                            </span>
                          </button>
                        )}
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
          </>
        )}

        {view === "register" && dayEvent && (
          <>
            <DialogHeader>
              <button
                onClick={() => setView("list")}
                className="inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-black mb-2 self-start"
              >
                <Icon name="ChevronLeft" size={16} />
                К мероприятиям
              </button>
              <DialogTitle className="text-2xl uppercase tracking-[0.2em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                Запись на мероприятие
              </DialogTitle>
              <DialogDescription>
                {dayEvent.title} · {selectedDate?.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} · {dayEvent.time}
              </DialogDescription>
            </DialogHeader>

            {/* Event summary card */}
            <div className="mt-2 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-black/10 p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] text-white bg-gradient-to-r ${categoryMeta(dayEvent.category).color}`}>
                  <Icon name={categoryMeta(dayEvent.category).icon} size={11} />
                  {dayEvent.category}
                </span>
                <div className="text-sm text-black/70 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><Icon name="MapPin" size={13} />{dayEvent.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-black/50 uppercase tracking-[0.2em]">
                  {isResident ? "Уточняется" : isBlogger ? "С депозита" : "К оплате"}
                </div>
                <div className="text-2xl font-semibold">
                  {isResident ? "—" : `${dayEvent.price.toLocaleString("ru-RU")} ${isBlogger ? "" : "₽"}`}
                </div>
                {dayEvent.capacity && dayEvent.capacity > 0 && (
                  <div className="text-[11px] text-black/55 mt-1">
                    Записано: {registeredCount}/{dayEvent.capacity}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-5 pt-4">
              {user && (
                <div className="rounded-xl bg-pink-50 border border-pink-100 px-3 py-2 flex items-center gap-2 text-xs text-black/70">
                  <Icon name="Sparkles" size={13} className="text-pink-500 flex-shrink-0" />
                  Поля заполнены данными из твоего профиля — проверь и при необходимости поправь.
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="regName">Имя</Label>
                  <Input id="regName" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Анна" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="regContact">Телефон для связи</Label>
                  <Input id="regContact" type="tel" required value={regContact} onChange={(e) => setRegContact(e.target.value)} placeholder="+7 (___) ___-__-__" />
                </div>
              </div>

              {/* Telegram (обязательно) */}
              <div className="space-y-1.5">
                <Label htmlFor="regTg" className="flex items-center gap-1.5">
                  <Icon name="Send" size={13} className="text-sky-500" />
                  Telegram*
                </Label>
                <Input
                  id="regTg"
                  required
                  value={regTelegram}
                  onChange={(e) => setRegTelegram(e.target.value)}
                  placeholder="@username или https://t.me/username"
                />
                <div className="flex items-start gap-2 text-[11px] text-sky-700 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
                  <Icon name="Info" size={13} className="mt-0.5 flex-shrink-0" />
                  <div>
                    Telegram нужен обязательно — за день до мероприятия мы добавим тебя в
                    закрытую группу события для общения, организационных деталей и фотоотчёта.
                  </div>
                </div>
              </div>

              {/* Notification channel */}
              <div className="space-y-2">
                <Label>Куда присылать уведомление о мероприятии?</Label>
                <RadioGroup value={notifyMethod} onValueChange={(v) => setNotifyMethod(v as "email" | "phone")} className="grid grid-cols-2 gap-3">
                  <label htmlFor="notify-email" className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${notifyMethod === "email" ? "border-black bg-black/5" : "border-black/15 hover:border-black/30"}`}>
                    <RadioGroupItem id="notify-email" value="email" />
                    <Icon name="Mail" size={16} />
                    <span className="text-sm">На почту</span>
                  </label>
                  <label htmlFor="notify-phone" className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${notifyMethod === "phone" ? "border-black bg-black/5" : "border-black/15 hover:border-black/30"}`}>
                    <RadioGroupItem id="notify-phone" value="phone" />
                    <Icon name="Phone" size={16} />
                    <span className="text-sm">SMS на телефон</span>
                  </label>
                </RadioGroup>

                {notifyMethod === "email" ? (
                  <Input
                    type="email"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                ) : (
                  <Input
                    type="tel"
                    required
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                  />
                )}
              </div>

              {/* Reminder timing */}
              <div className="space-y-1.5">
                <Label>Когда напомнить о мероприятии?</Label>
                <Select value={reminder} onValueChange={setReminder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="regComment">Комментарий (необязательно)</Label>
                <Textarea id="regComment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Особые пожелания, питание, доступная среда…" />
              </div>

              {/* Role-specific info */}
              {isResident && (
                <div className="flex items-start gap-2 text-xs text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 rounded-xl px-3 py-2.5">
                  <Icon name="Gem" size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    Для резидентов запись подтверждает администратор. Часть мероприятий бесплатна,
                    для других может быть доплата — мы свяжемся с тобой.
                  </div>
                </div>
              )}
              {isBlogger && (
                <div className="flex items-start gap-2 text-xs text-pink-700 bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5">
                  <Icon name="Camera" size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    Оплата с депозита блогера. Доступно: <b>{userBalance.toLocaleString("ru-RU")}</b> ·
                    Списание: <b>{dayEvent.price.toLocaleString("ru-RU")}</b>
                    {insufficientBalance && (
                      <div className="text-red-600 mt-1">Недостаточно баллов на депозите.</div>
                    )}
                  </div>
                </div>
              )}
              {/* Доплата баллами — для member/team */}
              {canUsePoints && (
                <div className="rounded-xl border border-pink-100 bg-pink-50/40 p-3.5 space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-pink-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black/85 flex items-center gap-1.5">
                        <Icon name="Sparkles" size={13} className="text-pink-500" />
                        Использовать бонусные баллы
                      </div>
                      <div className="text-[11px] text-black/60 mt-0.5">
                        Можно покрыть до 20% стоимости —
                        максимум{" "}
                        <b>{maxPointsForEvent.toLocaleString("ru-RU")}</b> баллов из
                        твоих <b>{userBalance.toLocaleString("ru-RU")}</b>.
                      </div>
                    </div>
                  </label>
                  {usePoints && (
                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <div className="rounded-lg bg-white border border-black/5 px-3 py-2">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-black/45">
                          Баллами
                        </div>
                        <div className="text-base font-semibold text-pink-600">
                          −{pointsToUse.toLocaleString("ru-RU")}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white border border-black/5 px-3 py-2">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-black/45">
                          К оплате рублями
                        </div>
                        <div className="text-base font-semibold">
                          {cashToPay.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!isResident && !isBlogger && !isTeam && (
                <div className="flex items-center gap-2 text-xs text-black/55 bg-black/[0.03] rounded-xl px-3 py-2">
                  <Icon name="ShieldCheck" size={14} />
                  Безопасная оплата · при отмене бронирования сумма возвращается баллами
                </div>
              )}

              {isResident ? (
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm uppercase tracking-[0.2em] hover:opacity-95 transition-opacity"
                >
                  <Icon name="ShieldCheck" size={16} />
                  Записаться через администратора
                </button>
              ) : isBlogger ? (
                <button
                  type="submit"
                  disabled={insufficientBalance}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-fuchsia-500 text-white text-sm uppercase tracking-[0.2em] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="Wallet" size={16} />
                  Списать с депозита {dayEvent.price.toLocaleString("ru-RU")}
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-black text-white text-sm uppercase tracking-[0.2em] hover:bg-black/85 transition-colors"
                >
                  <Icon name="CreditCard" size={16} />
                  {pointsToUse > 0
                    ? `Оплатить ${cashToPay.toLocaleString("ru-RU")} ₽ + ${pointsToUse.toLocaleString("ru-RU")} баллов`
                    : `Оплатить ${dayEvent.price.toLocaleString("ru-RU")} ₽`}
                </button>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}