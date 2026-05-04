import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { CATEGORIES, type EventCategory } from "@/data/events"
import { useAuth } from "@/contexts/AuthContext"

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
  status?: "paid" | "pending_admin" | "deposit"
  role?: string
  amount?: number
  surcharge?: number
  telegram?: string
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
}

export default function MyEventsModal({ open, onOpenChange }: Props) {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("upcoming")
  const [regs, setRegs] = useState<StoredRegistration[]>([])

  useEffect(() => {
    if (!open || !user) return
    try {
      const all = JSON.parse(
        localStorage.getItem("mojno_event_registrations") || "[]"
      ) as StoredRegistration[]
      const my = (Array.isArray(all) ? all : []).filter((r) => r.email === user.email)
      setRegs(my)
    } catch {
      setRegs([])
    }
  }, [open, user])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
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
    CATEGORIES.find((x) => x.name === c) || { icon: "CalendarDays", color: "from-pink-400 to-rose-500" }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

  return (
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
              return (
                <li
                  key={`${r.eventTitle}-${r.registeredAt}-${i}`}
                  className="rounded-2xl border border-black/10 bg-white p-4 flex items-start gap-3"
                >
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
                      {typeof r.amount === "number" && r.amount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="Wallet" size={12} />
                          {r.amount.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                      {typeof r.surcharge === "number" && r.surcharge > 0 && (
                        <span className="inline-flex items-center gap-1 text-pink-600">
                          <Icon name="Plus" size={12} />
                          доплата {r.surcharge.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
