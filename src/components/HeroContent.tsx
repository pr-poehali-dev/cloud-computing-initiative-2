import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import EventsModal from "@/components/EventsModal"
import AuthModal, { AuthMode } from "@/components/AuthModal"
import ProfileModal from "@/components/ProfileModal"
import { useAuth } from "@/contexts/AuthContext"
import Icon from "@/components/ui/icon"
import { EVENTS, categoryMeta } from "@/data/events"

export default function HeroContent() {
  const { isAuthenticated } = useAuth()
  const [eventsOpen, setEventsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("register")
  const [profileOpen, setProfileOpen] = useState(false)

  const upcoming = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start)
    end.setDate(end.getDate() + 2)
    return EVENTS.filter((e) => {
      const d = new Date(e.date)
      return d >= start && d < end
    }).slice(0, 4)
  }, [])

  const handleJoinClick = () => {
    if (isAuthenticated) {
      setProfileOpen(true)
    } else {
      setAuthMode("register")
      setAuthOpen(true)
    }
  }

  return (
    <>
      <main className="absolute inset-0 z-20 flex flex-col items-center text-center px-6 pb-[6vh]" style={{ paddingTop: "22vh" }}>
        {/* Tagline plate */}
        <div className="mb-3 px-7 py-2.5 rounded-full border border-white/30 bg-black/45 backdrop-blur-md fade-in-up">
          <span
            className="text-white uppercase block"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 200,
              fontSize: "clamp(0.7rem, 1.1vw, 0.95rem)",
              letterSpacing: "0.4em",
            }}
          >
            Каждой женщине всё
          </span>
        </div>

        {/* Logo / Club Name */}
        <div className="fade-in-up-delay w-full flex justify-center overflow-hidden">
          <h1
            className="leading-none uppercase shine-text pulse-title inline-block"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "clamp(3rem, 16vw, 99vw)",
              letterSpacing: "0.25em",
              paddingLeft: "0.25em",
              whiteSpace: "nowrap",
            }}
          >
            МОЖНО
          </h1>
        </div>

        {/* Upcoming events plate */}
        {upcoming.length > 0 && (
          <button
            onClick={() => setEventsOpen(true)}
            className="mt-3 max-w-[92vw] sm:max-w-md w-full px-5 py-3 rounded-2xl border border-white/25 bg-black/40 backdrop-blur-md text-left text-white hover:bg-black/55 hover:border-white/45 transition-all fade-in-up-delay"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CalendarClock" size={14} className="text-pink-300" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/80">
                Ближайшие мероприятия
              </span>
            </div>
            <ul className="space-y-1.5">
              {upcoming.map((ev, i) => {
                const meta = categoryMeta(ev.category)
                const dt = new Date(ev.date)
                const today0 = new Date()
                const isToday =
                  dt.toDateString() === today0.toDateString()
                const dayLabel = isToday
                  ? "Сегодня"
                  : "Завтра"
                return (
                  <li key={i} className="flex items-center gap-2.5 text-xs">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-br ${meta.color}`} />
                    <span className="text-white/60 w-[58px] flex-shrink-0">{dayLabel}</span>
                    <span className="text-white/50 w-[42px] flex-shrink-0">{ev.time}</span>
                    <span className="text-white/95 truncate">{ev.title}</span>
                  </li>
                )
              })}
            </ul>
          </button>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-5 flex-wrap justify-center mt-auto">
          <div className="relative inline-flex items-center justify-center">
            <div aria-hidden className="absolute -inset-3 rounded-full pointer-events-none join-soft-glow" />
            <div aria-hidden className="absolute -inset-[3px] rounded-full pointer-events-none pink-shimmer-border" />
            <button
              onClick={() => setEventsOpen(true)}
              className="relative z-10 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase"
            >
              Мероприятия
            </button>
          </div>

          <div className="relative inline-flex items-center justify-center">
            <div aria-hidden className="absolute -inset-3 rounded-full pointer-events-none join-soft-glow" />
            <div aria-hidden className="absolute -inset-[3px] rounded-full pointer-events-none pink-shimmer-border" />
            <button
              onClick={handleJoinClick}
              className="relative z-10 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase"
            >
              {isAuthenticated ? "Личный кабинет" : "Вступить в клуб"}
            </button>
          </div>

          {!isAuthenticated && (
            <button
              onClick={() => {
                setAuthMode("login")
                setAuthOpen(true)
              }}
              className="text-white/80 hover:text-white text-xs uppercase tracking-[0.25em] underline-offset-4 hover:underline transition-colors"
            >
              Уже в клубе? Войти
            </button>
          )}
        </div>

        {/* About club button */}
        <div className="relative inline-flex items-center justify-center mt-5">
          <div aria-hidden className="absolute -inset-3 rounded-full pointer-events-none join-soft-glow" />
          <div aria-hidden className="absolute -inset-[3px] rounded-full pointer-events-none pink-shimmer-border" />
          <Link
            to="/about"
            className="relative z-10 inline-flex items-center gap-2 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase"
          >
            <Icon name="Info" size={14} />
            Узнать о клубе
          </Link>
        </div>
      </main>

      <EventsModal open={eventsOpen} onOpenChange={setEventsOpen} />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode={authMode}
        onSuccess={() => setProfileOpen(true)}
      />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}