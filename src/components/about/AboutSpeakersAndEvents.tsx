import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EVENTS, CATEGORIES, categoryMeta, type ClubEvent, type EventCategory } from "@/data/events"
import SectionHeading from "@/components/about/SectionHeading"
import BecomeSpeakerCTA from "@/components/about/BecomeSpeakerCTA"

const SPEAKERS = [
  {
    name: "Екатерина Лаврова",
    role: "Психолог, гештальт-терапевт",
    bio: "10 лет частной практики, ведущая кругов поддержки и расстановок.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/08af00b7-f487-4913-bfcb-18209d8986fb.jpg",
  },
  {
    name: "Алина Светлова",
    role: "Тренер по йоге и пилатесу",
    bio: "Сертифицированный преподаватель, авторские утренние практики у воды.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e70a851-f500-4868-9a3f-6d1f5a1df032.jpg",
  },
  {
    name: "Марина Корн",
    role: "Бизнес-наставник, инвестор",
    bio: "Основательница венчурного фонда, ментор женского предпринимательства.",
    photo: "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e0dbeba-9b07-40a5-a5a1-6f912e4f8ab8.jpg",
  },
]

export default function AboutSpeakersAndEvents() {
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null)
  const [activeCategory, setActiveCategory] = useState<EventCategory | "Все">("Все")

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
      {/* Speakers */}
      <section id="speakers" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-24">
        <SectionHeading
          eyebrow="Спикеры клуба"
          title=""
          icon="Mic"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {SPEAKERS.map((s) => (
            <div key={s.name} className="group rounded-3xl bg-white border border-black/5 overflow-hidden shadow-sm">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={s.photo}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                />
              </div>
              <div className="p-5">
                <div className="text-lg font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {s.name}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-pink-600 mt-1">{s.role}</div>
                <p className="text-sm text-black/70 mt-3 leading-relaxed">{s.bio}</p>
              </div>
            </div>
          ))}
        </div>

        <BecomeSpeakerCTA />
      </section>

      {/* Our events — by categories */}
      <section id="events" className="pb-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            eyebrow="Наши мероприятия"
            title=""
            icon="CalendarHeart"
          />

          {/* Category filters */}
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

          {/* Category windows */}
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

      {/* Event details modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(v) => !v && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {selectedEvent && (() => {
            const meta = categoryMeta(selectedEvent.category)
            const dt = new Date(selectedEvent.date)
            const day = dt.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
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
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
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
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Дата</div>
                        <div className="text-black/80 capitalize">{weekday}, {day}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Clock" size={16} className="text-pink-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Время</div>
                        <div className="text-black/80">{selectedEvent.time}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="MapPin" size={16} className="text-pink-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Место</div>
                        <div className="text-black/80">{selectedEvent.location}</div>
                      </div>
                    </div>
                    {selectedEvent.speaker && (
                      <div className="flex items-start gap-3">
                        <Icon name="User" size={16} className="text-pink-600 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Спикер</div>
                          <div className="text-black/80">{selectedEvent.speaker}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Icon name="Wallet" size={16} className="text-pink-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50">Стоимость</div>
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
    </>
  )
}