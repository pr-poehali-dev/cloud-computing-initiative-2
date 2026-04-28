import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import { useNotifications } from "@/contexts/NotificationsContext"
import { CATEGORIES, type EventCategory } from "@/data/events"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const formatTime = (iso: string) => {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "только что"
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days} д назад`
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
}

export default function NotificationsModal({ open, onOpenChange }: Props) {
  const {
    prefs,
    notifications,
    toggleCategory,
    addKeyword,
    removeKeyword,
    markAllRead,
    removeNotification,
    pushTestNotification,
  } = useNotifications()
  const [keywordInput, setKeywordInput] = useState("")

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return
    addKeyword(keywordInput)
    setKeywordInput("")
    toast.success("Ключевое слово добавлено")
  }

  const isCategoryOn = (c: EventCategory) => prefs.categories.includes(c)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
          <DialogTitle
            className="text-2xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Уведомления
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-[0.22em] text-pink-600">
            Подписывайся на интересные мероприятия
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {/* Subscriptions */}
          <div className="px-6 py-5 border-b border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="BellRing" size={14} className="text-pink-600" />
              <div className="text-[11px] uppercase tracking-[0.22em] text-pink-700 font-medium">
                Категории, которые я жду
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((c) => {
                const on = isCategoryOn(c.name)
                return (
                  <button
                    key={c.name}
                    onClick={() => toggleCategory(c.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                      on
                        ? `bg-gradient-to-r ${c.color} text-white border-transparent shadow-sm`
                        : "bg-white text-black/70 border-black/10 hover:border-pink-300"
                    }`}
                  >
                    <Icon name={c.icon} size={12} />
                    {c.name}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Icon name="Tag" size={14} className="text-pink-600" />
              <div className="text-[11px] uppercase tracking-[0.22em] text-pink-700 font-medium">
                Ключевые слова в названии
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddKeyword()
                  }
                }}
                placeholder="Например: йога, ретрит, вино"
                className="flex-1 h-10 text-sm"
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.18em]"
              >
                <Icon name="Plus" size={14} />
              </button>
            </div>
            {prefs.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {prefs.keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs text-pink-700"
                  >
                    {k}
                    <button
                      onClick={() => removeKeyword(k)}
                      className="text-pink-400 hover:text-pink-700"
                    >
                      <Icon name="X" size={10} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-black/50">
                Добавь слова — мы пришлём, как только появится подходящее мероприятие.
              </p>
            )}
          </div>

          {/* Notifications list */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-black/55 font-medium">
                Лента уведомлений
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-pink-600 hover:text-pink-700 uppercase tracking-[0.18em]"
                >
                  Прочитать всё
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center text-sm text-black/55 py-8 px-4 rounded-2xl bg-pink-50/40 border border-dashed border-pink-200">
                <Icon name="Bell" size={22} className="mx-auto text-pink-400 mb-2" />
                Уведомлений пока нет. Подпишись на категории — и мы дадим знать, как
                только появится новое мероприятие.
                <button
                  onClick={pushTestNotification}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-pink-200 text-pink-700 text-[11px] uppercase tracking-[0.18em] hover:bg-pink-50"
                >
                  <Icon name="Sparkles" size={12} />
                  Показать пример
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`relative rounded-2xl p-4 border ${
                      n.read
                        ? "bg-white border-black/5"
                        : "bg-pink-50/60 border-pink-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center flex-shrink-0">
                        <Icon name="CalendarPlus" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium text-black/85 leading-snug">
                            {n.title}
                          </div>
                          <button
                            onClick={() => removeNotification(n.id)}
                            className="text-black/30 hover:text-red-500"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-black/65 leading-relaxed mt-1">
                          {n.description}
                        </p>
                        <div className="flex items-center justify-between mt-2.5 gap-2">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                            {formatTime(n.createdAt)}
                          </span>
                          <button className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[10px] uppercase tracking-[0.18em]">
                            Записаться
                            <Icon name="ArrowRight" size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {!n.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-pink-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
