import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  EVENTS,
  CATEGORIES,
  categoryMeta,
  type ClubEvent,
  type EventCategory,
} from "@/data/events"
import SectionHeading from "@/components/about/SectionHeading"
import SuggestEventModal from "@/components/about/SuggestEventModal"
import { useEventSuggestions } from "@/contexts/EventSuggestionsContext"
import { useAuth } from "@/contexts/AuthContext"

export default function AboutEvents() {
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null)
  const [activeCategory, setActiveCategory] = useState<EventCategory | "Все">("Все")
  const [suggestOpen, setSuggestOpen] = useState(false)
  const { suggestions, toggleVote } = useEventSuggestions()
  const { user } = useAuth()
  const voterKey = user?.email || ""
  const publicSuggestions = useMemo(
    () =>
      suggestions
        .filter((s) => s.status !== "rejected")
        .sort((a, b) => b.votes.length - a.votes.length)
        .slice(0, 6),
    [suggestions]
  )

  const eventsByCategory = useMemo(() => {
    const map = new Map<EventCategory, ClubEvent[]>()
    EVENTS.forEach((e) => {
      const arr = map.get(e.category) || []
      arr.push(e)
      map.set(e.category, arr)
    })
    return map
  }, [])

  const visibleCategories =
    activeCategory === "Все"
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.name === activeCategory)

  return (
    <>
      <section id="events" className="pb-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading eyebrow="Наши мероприятия" title="" icon="CalendarHeart" />

          <div className="mb-8 rounded-[24px] bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 border border-pink-100 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white items-center justify-center flex-shrink-0">
              <Icon name="Lightbulb" size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="text-xl sm:text-2xl"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                Не нашла встречу мечты?
              </div>
              <p className="text-sm text-black/65 mt-0.5">
                Расскажи, на какое мероприятие ты бы пришла — и мы постараемся его провести.
              </p>
            </div>
            <button
              onClick={() => setSuggestOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-xs uppercase tracking-[0.22em] hover:opacity-95 transition-opacity flex-shrink-0"
            >
              <Icon name="Sparkles" size={14} />
              Предложить мероприятие
            </button>
          </div>

          {publicSuggestions.length > 0 && (
            <div className="mb-10 rounded-[24px] bg-white border border-black/5 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="Heart" size={16} className="text-pink-600" />
                  <h4
                    className="text-lg"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                  >
                    Идеи участниц — голосуй за лучшие
                  </h4>
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">
                  Всего идей: {suggestions.length}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {publicSuggestions.map((s) => {
                  const voted = !!voterKey && s.votes.includes(voterKey)
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-black/5 bg-gradient-to-br from-white to-pink-50/30 p-4 flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-pink-600 bg-pink-50 rounded-full px-2 py-0.5">
                          {s.category || "Идея"}
                        </span>
                        {s.status === "approved" && (
                          <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                            Принята
                          </span>
                        )}
                      </div>
                      <h5
                        className="text-base leading-snug mb-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 500,
                        }}
                      >
                        {s.title}
                      </h5>
                      <p className="text-xs text-black/60 leading-relaxed mb-3 line-clamp-3">
                        {s.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[11px] text-black/55 truncate">
                          {s.authorName}
                        </span>
                        <button
                          onClick={() => {
                            if (!voterKey) {
                              setSuggestOpen(true)
                              return
                            }
                            toggleVote(s.id, voterKey)
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                            voted
                              ? "bg-pink-600 text-white"
                              : "bg-black/[0.04] text-black/70 hover:bg-pink-50 hover:text-pink-600"
                          }`}
                        >
                          <Icon name="Heart" size={12} />
                          {s.votes.length}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory("Все")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition-all ${
                activeCategory === "Все"
                  ? "bg-black text-white border-transparent shadow-sm"
                  : "bg-white text-black/70 border-black/10 hover:border-pink-300"
              }`}
            >
              <Icon name="Sparkles" size={12} />
              Все направления
            </button>
            {CATEGORIES.map((c) => {
              const isActive = activeCategory === c.name
              return (
                <button
                  key={c.name}
                  onClick={() => setActiveCategory(c.name)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition-all ${
                    isActive
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

          <div className="space-y-12">
            {visibleCategories.map((cat) => {
              const items = eventsByCategory.get(cat.name) || []
              if (items.length === 0) return null
              return (
                <div
                  key={cat.name}
                  className="rounded-[28px] bg-white border border-black/5 shadow-sm overflow-hidden"
                >
                  <div
                    className={`bg-gradient-to-r ${cat.color} text-white px-7 py-6 flex items-center justify-between gap-4`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                        <Icon name={cat.icon} size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.28em] opacity-90">
                          Направление
                        </div>
                        <h3
                          className="text-2xl md:text-3xl leading-tight truncate"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 500,
                          }}
                        >
                          {cat.name}
                        </h3>
                      </div>
                    </div>
                    <span className="hidden md:inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                      {items.length}{" "}
                      {items.length === 1
                        ? "событие"
                        : items.length < 5
                          ? "события"
                          : "событий"}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {items.map((ev, i) => {
                      const dt = new Date(ev.date)
                      const day = dt.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                      })
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedEvent(ev)}
                          className="group relative text-left rounded-2xl border border-black/5 bg-gradient-to-br from-white to-pink-50/30 p-5 hover:-translate-y-1 hover:shadow-md hover:border-pink-200 transition-all duration-300 flex flex-col"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-pink-600 bg-pink-50 rounded-full px-2.5 py-1">
                              <Icon name="Calendar" size={10} />
                              {day}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                              {ev.time}
                            </span>
                          </div>
                          <h4
                            className="text-lg leading-snug mb-2 text-black/85"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontWeight: 500,
                            }}
                          >
                            {ev.title}
                          </h4>
                          <p className="text-[13px] text-black/60 leading-relaxed mb-4 line-clamp-3">
                            {ev.description}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-xs font-medium text-black/75">
                              {ev.price === 0
                                ? "Для резидентов"
                                : `${ev.price.toLocaleString("ru-RU")} ₽`}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-pink-600 group-hover:gap-2 transition-all">
                              Подробнее
                              <Icon name="ArrowRight" size={11} />
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedEvent} onOpenChange={(v) => !v && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {selectedEvent &&
            (() => {
              const meta = categoryMeta(selectedEvent.category)
              const dt = new Date(selectedEvent.date)
              const day = dt.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })
              const weekday = dt.toLocaleDateString("ru-RU", { weekday: "long" })
              return (
                <div>
                  <div className={`bg-gradient-to-br ${meta.color} text-white px-7 py-6`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-2.5">
                        <Icon name={meta.icon} size={18} />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.22em] opacity-90">
                        {selectedEvent.category}
                      </span>
                    </div>
                    <h3
                      className="text-2xl md:text-3xl leading-tight"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                      }}
                    >
                      {selectedEvent.title}
                    </h3>
                  </div>

                  <div className="px-7 py-6">
                    <p className="text-black/75 leading-relaxed mb-6">
                      {selectedEvent.description}
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <Icon name="Calendar" size={16} className="text-pink-600 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                            Дата
                          </div>
                          <div className="text-black/80 capitalize">
                            {weekday}, {day}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="Clock" size={16} className="text-pink-600 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                            Время
                          </div>
                          <div className="text-black/80">{selectedEvent.time}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="MapPin" size={16} className="text-pink-600 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                            Место
                          </div>
                          <div className="text-black/80">{selectedEvent.location}</div>
                        </div>
                      </div>
                      {selectedEvent.speaker && (
                        <div className="flex items-start gap-3">
                          <Icon name="User" size={16} className="text-pink-600 mt-0.5" />
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                              Спикер
                            </div>
                            <div className="text-black/80">{selectedEvent.speaker}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <Icon name="Wallet" size={16} className="text-pink-600 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                            Стоимость
                          </div>
                          <div className="text-black/80 font-medium">
                            {selectedEvent.price === 0
                              ? "Бесплатно для резидентов"
                              : `${selectedEvent.price.toLocaleString("ru-RU")} ₽`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/"
                      onClick={() => setSelectedEvent(null)}
                      className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
                    >
                      Записаться
                      <Icon name="ArrowRight" size={14} />
                    </Link>
                  </div>
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>

      <SuggestEventModal open={suggestOpen} onOpenChange={setSuggestOpen} />
    </>
  )
}