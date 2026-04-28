import { useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EVENTS, categoryMeta, type ClubEvent } from "@/data/events"

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

  return (
    <>
      {/* Speakers */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">Спикеры клуба</div>
        <h2
          className="mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
        >
          Те, кто делится опытом
        </h2>
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
      </section>

      {/* Our events */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-pink-600 mb-3">Наши мероприятия</div>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}
          >
            Что мы проводим в клубе
          </h2>
        </div>

        <div className="overflow-x-auto scrollbar-thin pb-3">
          <div className="flex gap-5 px-6" style={{ width: "max-content" }}>
            {EVENTS.map((ev, i) => {
              const meta = categoryMeta(ev.category)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedEvent(ev)}
                  className="w-[300px] flex-shrink-0 rounded-3xl bg-white border border-black/5 shadow-sm overflow-hidden flex flex-col text-left hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  <div className={`bg-gradient-to-br ${meta.color} h-2`} />
                  <div className="p-6 flex flex-col flex-1">
                    <span className="self-start text-[10px] uppercase tracking-[0.2em] text-pink-600 mb-3">
                      {ev.category}
                    </span>
                    <h3
                      className="text-xl leading-snug mb-3"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                    >
                      {ev.title}
                    </h3>
                    <p className="text-sm text-black/65 leading-relaxed mb-5">
                      {ev.description}
                    </p>
                    <div className="mt-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-pink-600">
                      Подробнее
                      <Icon name="ArrowRight" size={12} />
                    </div>
                  </div>
                </button>
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
                        <div className="text-black/80 font-medium">{selectedEvent.price.toLocaleString("ru-RU")} ₽</div>
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
