import { useState } from "react"
import EventsModal from "@/components/EventsModal"
import AuthModal, { AuthMode } from "@/components/AuthModal"
import ProfileModal from "@/components/ProfileModal"
import { useAuth } from "@/contexts/AuthContext"

export default function HeroContent() {
  const { isAuthenticated } = useAuth()
  const [eventsOpen, setEventsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("register")
  const [profileOpen, setProfileOpen] = useState(false)

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
            className="leading-none uppercase shine-text inline-block"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "clamp(3rem, 16vw, 99vw)",
              letterSpacing: "0.25em",
              paddingLeft: "0.25em",
              filter: "drop-shadow(0 2px 40px rgba(0,0,0,0.18))",
              whiteSpace: "nowrap",
            }}
          >
            МОЖНО
          </h1>
        </div>

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
