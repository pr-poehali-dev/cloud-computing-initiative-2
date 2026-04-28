import { useState } from "react"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import AuthModal, { AuthMode } from "@/components/AuthModal"
import ProfileModal from "@/components/ProfileModal"
import SocialModal from "@/components/SocialModal"

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [profileOpen, setProfileOpen] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-30 p-6">
        <div className="flex justify-between items-center">
          <div className="text-white text-sm uppercase tracking-widest font-light">МОЖНО</div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSocialOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-600/90 hover:bg-pink-600 text-white text-xs uppercase tracking-[0.2em] transition-colors"
              title="Соц.сеть клуба"
            >
              <Icon name="Heart" size={14} />
              <span className="hidden sm:inline">Соц.сеть</span>
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => setProfileOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
              >
                <Icon name="User" size={14} />
                {user?.firstName || "Кабинет"}
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuth("login")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs uppercase tracking-[0.2em] border border-white/40 hover:bg-white/10 transition-colors"
                >
                  <Icon name="LogIn" size={14} />
                  Войти
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 text-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
                >
                  <Icon name="Sparkles" size={14} />
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} onSuccess={() => setProfileOpen(true)} />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <SocialModal
        open={socialOpen}
        onOpenChange={setSocialOpen}
        onRequireAuth={() => openAuth("login")}
      />
    </>
  )
}