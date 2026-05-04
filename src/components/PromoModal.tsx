import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const PROMO_KEY = "mojno_promo_residency_v1"
const PROMO_DISMISSED_KEY = "mojno_promo_residency_dismissed_v1"
const PROMO_PRICE = 3500
const PROMO_DAYS = 7

interface PromoState {
  // Когда участница в последний раз закрыла окно (чтобы не дёргать каждую минуту)
  dismissedAt?: string
  // Когда участница в последний раз увидела окно «продлить»
  renewShownAt?: string
}

const readPromoState = (email: string): PromoState => {
  try {
    const raw = localStorage.getItem(`${PROMO_DISMISSED_KEY}_${email}`)
    return raw ? (JSON.parse(raw) as PromoState) : {}
  } catch {
    return {}
  }
}

const writePromoState = (email: string, state: PromoState) => {
  localStorage.setItem(
    `${PROMO_DISMISSED_KEY}_${email}`,
    JSON.stringify(state)
  )
}

// Считаем, что участница уже когда-то покупала промо-резидентство
const hasUsedPromo = (email: string): boolean => {
  return localStorage.getItem(`${PROMO_KEY}_${email}_used`) === "1"
}
const markPromoUsed = (email: string) => {
  localStorage.setItem(`${PROMO_KEY}_${email}_used`, "1")
}

export default function PromoModal() {
  const { user, isAuthenticated, activatePromoResidency, updateProfile } =
    useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"offer" | "renew">("offer")

  const isResidentByPromo = useMemo(() => {
    if (!user?.residencyUntil) return false
    return new Date(user.residencyUntil).getTime() > Date.now()
  }, [user])

  // Открытие окна при загрузке/обновлении страницы
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOpen(false)
      return
    }
    // Если участница уже резидент по обычной схеме (не через промо) — не показываем
    const isPermanentResident = user.role === "resident" && !user.residencyUntil
    if (isPermanentResident) return
    // Команда — не показываем
    if (user.role === "team") return

    const state = readPromoState(user.email)

    // Если промо-резидентство активно — окно не показываем,
    // только если оно недавно истекло (или прямо сейчас)
    if (isResidentByPromo) return

    // Если у участницы есть «истёкший» residencyUntil (или promo был использован),
    // показываем «Продлить»
    const wasResident = hasUsedPromo(user.email) && !isResidentByPromo
    const newMode: "offer" | "renew" = wasResident ? "renew" : "offer"

    // Чтобы не показывать слишком навязчиво — закрытие действует 24 часа
    const lastShownKey = newMode === "renew" ? state.renewShownAt : state.dismissedAt
    if (lastShownKey) {
      const last = new Date(lastShownKey).getTime()
      if (Date.now() - last < 24 * 60 * 60 * 1000) return
    }

    setMode(newMode)
    // Небольшая задержка, чтобы окно не «прыгало» сразу при загрузке
    const t = setTimeout(() => setOpen(true), 600)
    return () => clearTimeout(t)
  }, [isAuthenticated, user?.email, isResidentByPromo])

  const handleClose = () => {
    if (user) {
      const state = readPromoState(user.email)
      if (mode === "renew") state.renewShownAt = new Date().toISOString()
      else state.dismissedAt = new Date().toISOString()
      writePromoState(user.email, state)
    }
    setOpen(false)
  }

  const handleBuy = () => {
    if (!user) return
    const balance = user.balance || 0
    if (balance < PROMO_PRICE) {
      toast.error(
        `Недостаточно средств · нужно ${PROMO_PRICE.toLocaleString("ru-RU")} ₽, на балансе ${balance.toLocaleString("ru-RU")} ₽`,
        {
          description:
            "Пополни баланс в личном кабинете или попроси администратора.",
        }
      )
      return
    }
    // Списываем деньги
    updateProfile({ balance: balance - PROMO_PRICE })
    // Активируем резидентство
    const { until } = activatePromoResidency(PROMO_DAYS)
    markPromoUsed(user.email)
    setOpen(false)
    toast.success(
      `Резидентство активировано на ${PROMO_DAYS} дней!`,
      {
        description: `Действует до ${new Date(until).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}. Все привилегии резидента уже доступны.`,
      }
    )
    // Уведомление в инбокс
    try {
      const inboxKey = `mojno_user_inbox_${user.email}`
      const inboxRaw = localStorage.getItem(inboxKey)
      const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
      const note = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: `Промо-резидентство активировано на ${PROMO_DAYS} дней`,
        description: `До ${new Date(until).toLocaleDateString("ru-RU")} ты резидент клуба со всеми привилегиями. Когда срок закончится — статус вернётся прежним.`,
        createdAt: new Date().toISOString(),
        read: false,
      }
      localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
    } catch {
      /* ignore */
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 px-6 pt-7 pb-5 text-white">
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.22em] bg-white/15 border border-white/30 rounded-full px-3 py-1">
            Только эту неделю
          </span>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 border border-white/30 mb-3">
            <Icon name="Gem" size={20} />
          </div>
          <DialogHeader className="text-left">
            <DialogTitle
              className="text-2xl text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              {mode === "renew"
                ? "Продлить резидентство?"
                : "Стань резидентом на 7 дней"}
            </DialogTitle>
            <DialogDescription className="text-white/85">
              {mode === "renew"
                ? "Твоё промо-резидентство закончилось. Хочешь продлить ещё на неделю на тех же условиях?"
                : "Открой все привилегии резидента всего за 3 500 ₽ — без подписки и обязательств."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/50">
                Цена акции
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold">
                  {PROMO_PRICE.toLocaleString("ru-RU")} ₽
                </span>
                <span className="text-sm text-black/40 line-through">
                  10 000 ₽
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/50">
                Срок
              </div>
              <div className="text-sm font-medium">{PROMO_DAYS} дней</div>
            </div>
          </div>

          <ul className="space-y-1.5 text-sm text-black/75">
            <li className="flex items-start gap-2">
              <Icon name="Check" size={14} className="text-pink-600 mt-0.5 flex-shrink-0" />
              Запись на мероприятия через администратора (часто бесплатно)
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={14} className="text-pink-600 mt-0.5 flex-shrink-0" />
              Закрытые встречи и приоритет на популярные события
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={14} className="text-pink-600 mt-0.5 flex-shrink-0" />
              Бейдж резидента и специальные предложения партнёров
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Clock" size={14} className="text-pink-600 mt-0.5 flex-shrink-0" />
              По окончании недели статус вернётся прежним — никакого автопродления
            </li>
          </ul>

          <div className="rounded-xl bg-pink-50/60 border border-pink-200 px-3 py-2 text-[11px] text-pink-700 flex items-center gap-2">
            <Icon name="Wallet" size={12} />
            Сейчас на твоём балансе:{" "}
            <b>{(user.balance || 0).toLocaleString("ru-RU")} ₽</b>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
            >
              {mode === "renew" ? "Не сейчас" : "Не интересно"}
            </button>
            <button
              type="button"
              onClick={handleBuy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:opacity-95"
            >
              <Icon name="Sparkles" size={13} />
              {mode === "renew" ? "Продлить" : "Хочу!"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
