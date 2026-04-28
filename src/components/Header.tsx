import { useState } from "react"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import AuthModal, { AuthMode } from "@/components/AuthModal"
import ProfileModal from "@/components/ProfileModal"
import SocialModal from "@/components/SocialModal"
import NotificationsModal from "@/components/NotificationsModal"
import { useNotifications } from "@/contexts/NotificationsContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ABOUT_SECTIONS: { id: string; title: string; icon: string }[] = [
  { id: "about", title: "О клубе", icon: "Sparkles" },
  { id: "founder", title: "Владелица клуба", icon: "Crown" },
  { id: "speakers", title: "Спикеры", icon: "Mic" },
  { id: "events", title: "Мероприятия", icon: "CalendarHeart" },
  { id: "residency", title: "Резидентство", icon: "Gem" },
  { id: "gallery", title: "Галерея", icon: "Camera" },
  { id: "testimonials", title: "Отзывы", icon: "Quote" },
  { id: "cta", title: "Вступить в клуб", icon: "Heart" },
]

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [profileOpen, setProfileOpen] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-30 p-6">
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs uppercase tracking-[0.2em] transition-colors"
                aria-label="Меню разделов"
              >
                <Icon name="Menu" size={16} />
                <span className="hidden sm:inline">Меню</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 rounded-2xl border-pink-100 shadow-xl"
            >
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.22em] text-pink-600">
                Разделы клуба
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ABOUT_SECTIONS.map((s) => (
                <DropdownMenuItem key={s.id} asChild className="cursor-pointer">
                  <Link
                    to={`/about#${s.id}`}
                    className="flex items-center gap-2.5 py-2"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                      <Icon name={s.icon} size={13} />
                    </span>
                    <span className="text-sm">{s.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSocialOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-600/90 hover:bg-pink-600 text-white text-xs uppercase tracking-[0.2em] transition-colors"
              title="Соц.сеть клуба"
            >
              <Icon name="Heart" size={14} />
              <span className="hidden sm:inline">Соц.сеть</span>
            </button>
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-colors"
              title="Уведомления"
              aria-label="Уведомления"
            >
              <Icon name="Bell" size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-600 text-white text-[10px] font-medium flex items-center justify-center border-2 border-black/30">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
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
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  )
}