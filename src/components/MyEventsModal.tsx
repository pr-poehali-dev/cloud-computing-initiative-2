import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Icon from "@/components/ui/icon"
import { CATEGORIES, type EventCategory } from "@/data/events"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

interface StoredRegistration {
  email: string
  eventTitle: string
  category: EventCategory
  date: string
  registeredAt: string
  status?: "paid" | "pending_admin" | "deposit" | "cancel_pending" | "cancelled"
  role?: string
  amount?: number
  pointsUsed?: number
  cashPaid?: number
  surcharge?: number
  telegram?: string
  cancelReason?: string
  cancelRequestedAt?: string
}

type Tab = "upcoming" | "past"

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  paid: {
    label: "Подтверждено",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  pending_admin: {
    label: "Ждёт админа",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  deposit: {
    label: "С депозита",
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
  cancel_pending: {
    label: "Отмена в обработке",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  cancelled: {
    label: "Отменено",
    color: "bg-stone-100 text-stone-600 border-stone-200",
  },
}

export default function MyEventsModal({ open, onOpenChange }: Props) {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("upcoming")
  const [regs, setRegs] = useState<StoredRegistration[]>([])
  const [cancelTarget, setCancelTarget] = useState<StoredRegistration | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const reload = () => {
    if (!user) return
    try {
      const all = JSON.parse(
        localStorage.getItem("mojno_event_registrations") || "[]"
      ) as StoredRegistration[]
      const my = (Array.isArray(all) ? all : []).filter((r) => r.email === user.email)
      setRegs(my)
    } catch {
      setRegs([])
    }
  }

  useEffect(() => {
    if (!open || !user) return
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const { upcoming, past } = useMemo(() => {
    const up: StoredRegistration[] = []
    const pa: StoredRegistration[] = []
    regs.forEach((r) => {
      const d = new Date(r.date)
      d.setHours(0, 0, 0, 0)
      if (d.getTime() >= today.getTime()) up.push(r)
      else pa.push(r)
    })
    up.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    pa.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return { upcoming: up, past: pa }
  }, [regs, today])

  const list = tab === "upcoming" ? upcoming : past
  const categoryMeta = (c: EventCategory) =>
    CATEGORIES.find((x) => x.name === c) || {
      icon: "CalendarDays",
      color: "from-pink-400 to-rose-500",
    }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

  const submitCancel = () => {
    if (!cancelTarget || !user) return
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      toast.error("Опиши причину отмены подробнее (от 5 символов)")
      return
    }
    try {
      const all = JSON.parse(
        localStorage.getItem("mojno_event_registrations") || "[]"
      ) as StoredRegistration[]
      const idx = all.findIndex(
        (r) =>
          r.email === cancelTarget.email &&
          r.eventTitle === cancelTarget.eventTitle &&
          r.registeredAt === cancelTarget.registeredAt
      )
      if (idx === -1) {
        toast.error("Запись не найдена")
        return
      }
      all[idx] = {
        ...all[idx],
        status: "cancel_pending",
        cancelReason: cancelReason.trim(),
        cancelRequestedAt: new Date().toISOString(),
      }
      localStorage.setItem("mojno_event_registrations", JSON.stringify(all))
      reload()
    } catch {
      toast.error("Не удалось отправить запрос")
      return
    }
    toast.success("Запрос на отмену отправлен администратору", {
      description:
        "После подтверждения сумма мероприятия вернётся бонусными баллами на твой счёт.",
    })
    setCancelTarget(null)
    setCancelReason("")
  }

  const refundAmount = (r: StoredRegistration) =>
    (r.cashPaid || 0) + (r.pointsUsed || 0) || r.amount || 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-2xl uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
            >
              Мои мероприятия
            </DialogTitle>
            <DialogDescription>История твоих записей в клубе</DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-full bg-black/5 mt-2">
            <button
              type="button"
              onClick={() => setTab("upcoming")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all ${
                tab === "upcoming" ? "bg-black text-white" : "text-black/60"
              }`}
            >
              <Icon name="CalendarClock" size={14} />
              Предстоящие
              {upcoming.length > 0 && (
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                    tab === "upcoming" ? "bg-white/20" : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {upcoming.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab("past")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all ${
                tab === "past" ? "bg-black text-white" : "text-black/60"
              }`}
            >
              <Icon name="History" size={14} />
              Прошедшие
              {past.length > 0 && (
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                    tab === "past" ? "bg-white/20" : "bg-black/5 text-black/70"
                  }`}
                >
                  {past.length}
                </span>
              )}
            </button>
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-black/55 mt-3">
              <Icon
                name={tab === "upcoming" ? "CalendarOff" : "History"}
                size={32}
                className="mx-auto text-black/20 mb-2"
              />
              <div className="text-sm">
                {tab === "upcoming"
                  ? "Ты пока не записана на ближайшие мероприятия"
                  : "У тебя ещё нет посещённых мероприятий"}
              </div>
              <div className="text-xs text-black/45 mt-1">
                {tab === "upcoming"
                  ? "Загляни в календарь и выбери что-то по душе"
                  : "Самое интересное впереди"}
              </div>
            </div>
          ) : (
            <ul className="space-y-3 mt-3">
              {list.map((r, i) => {
                const meta = categoryMeta(r.category)
                const status = r.status ? STATUS_LABEL[r.status] : null
                const canCancel =
                  tab === "upcoming" &&
                  (r.status === "paid" ||
                    r.status === "deposit" ||
                    r.status === "pending_admin") &&
                  r.status !== undefined
                return (
                  <li
                    key={`${r.eventTitle}-${r.registeredAt}-${i}`}
                    className="rounded-2xl border border-black/10 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${meta.color} text-white flex-shrink-0`}
                      >
                        <Icon name={meta.icon} size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className="text-base leading-tight"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontWeight: 500,
                            }}
                          >
                            {r.eventTitle}
                          </div>
                          {status && (
                            <span
                              className={`text-[9px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 border ${status.color}`}
                            >
                              {status.label}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-black/55 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <Icon name="CalendarDays" size={12} />
                            {formatDate(r.date)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Icon name="Tag" size={12} />
                            {r.category}
                          </span>
                          {typeof r.cashPaid === "number" && r.cashPaid > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Icon name="Wallet" size={12} />
                              {r.cashPaid.toLocaleString("ru-RU")} ₽
                            </span>
                          )}
                          {typeof r.pointsUsed === "number" && r.pointsUsed > 0 && (
                            <span className="inline-flex items-center gap-1 text-pink-600">
                              <Icon name="Sparkles" size={12} />
                              {r.pointsUsed.toLocaleString("ru-RU")} баллов
                            </span>
                          )}
                          {typeof r.surcharge === "number" && r.surcharge > 0 && (
                            <span className="inline-flex items-center gap-1 text-pink-600">
                              <Icon name="Plus" size={12} />
                              доплата {r.surcharge.toLocaleString("ru-RU")} ₽
                            </span>
                          )}
                        </div>
                        {r.status === "cancel_pending" && r.cancelReason && (
                          <div className="mt-2 text-[11px] text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5">
                            <Icon name="Clock" size={11} className="inline mr-1" />
                            Запрос на отмену в обработке. Причина: «{r.cancelReason}»
                          </div>
                        )}
                      </div>
                    </div>
                    {canCancel && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            setCancelTarget(r)
                            setCancelReason("")
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-[11px] uppercase tracking-[0.18em]"
                        >
                          <Icon name="X" size={12} />
                          Отменить запись
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог отмены */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(v) => {
          if (!v) {
            setCancelTarget(null)
            setCancelReason("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle
              className="text-xl uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
            >
              Отмена записи
            </DialogTitle>
            <DialogDescription>
              {cancelTarget?.eventTitle} · {cancelTarget && formatDate(cancelTarget.date)}
            </DialogDescription>
          </DialogHeader>

          {/* Информер о возврате баллами */}
          <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 border border-pink-200 p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex-shrink-0">
                <Icon name="Sparkles" size={15} />
              </span>
              <div>
                <div className="text-sm font-medium text-black/85">
                  Возврат бонусными баллами
                </div>
                <div className="text-[12px] text-black/65 mt-0.5 leading-relaxed">
                  При отмене бронирования оплаченная сумма за мероприятие
                  возвращается <b>бонусными баллами</b>, которые можно будет
                  потратить вновь на следующие мероприятия. Деньги рублями не
                  возвращаются.
                </div>
                {cancelTarget && refundAmount(cancelTarget) > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-white border border-pink-200 rounded-full px-3 py-1 text-[12px] text-pink-700 font-medium">
                    <Icon name="ArrowRight" size={12} />
                    К возврату: {refundAmount(cancelTarget).toLocaleString("ru-RU")} баллов
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <label className="text-[10px] uppercase tracking-[0.18em] text-black/55 font-medium">
              Причина отмены*
            </label>
            <Textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Расскажи коротко, почему хочешь отменить — это поможет нам стать лучше"
            />
            <div className="text-[11px] text-black/45">
              После отправки запрос увидит администратор. Возврат баллами
              произойдёт после подтверждения отмены.
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setCancelTarget(null)
                setCancelReason("")
              }}
              className="flex-1 px-4 py-3 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
            >
              Передумала
            </button>
            <button
              onClick={submitCancel}
              className="flex-1 px-4 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs uppercase tracking-[0.2em]"
            >
              <Icon name="Send" size={12} className="inline mr-1.5" />
              Отправить запрос
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
