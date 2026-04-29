import { useEffect, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import Icon from "@/components/ui/icon"
import AboutTopBar from "@/components/about/AboutTopBar"

export interface AboutNavItem {
  to: string
  title: string
  icon: string
}

export const ABOUT_NAV: AboutNavItem[] = [
  { to: "/about", title: "О клубе", icon: "Sparkles" },
  { to: "/about/speakers", title: "Спикеры", icon: "Mic" },
  { to: "/about/events", title: "Мероприятия", icon: "CalendarHeart" },
  { to: "/about/residency", title: "Резидентство", icon: "Gem" },
  { to: "/about/partnership", title: "Партнёрство", icon: "Handshake" },
  { to: "/about/gallery", title: "Галерея", icon: "Camera" },
  { to: "/about/testimonials", title: "Отзывы", icon: "Quote" },
  { to: "/about/join", title: "Вступить в клуб", icon: "Heart" },
]

interface Props {
  children: ReactNode
}

export default function AboutPageLayout({ children }: Props) {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const currentPath = location.pathname.replace(/\/$/, "")

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 text-black">
      <AboutTopBar />

      {/* Section nav */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-y border-black/5">
        <div className="max-w-6xl mx-auto px-3 md:px-6 py-3 overflow-x-auto scrollbar-thin">
          <div className="flex gap-2 w-max">
            {ABOUT_NAV.map((item) => {
              const isActive =
                currentPath === item.to.replace(/\/$/, "") ||
                (item.to === "/about" && currentPath === "/about")
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white border-transparent shadow-sm"
                      : "bg-white text-black/70 border-black/10 hover:border-pink-300"
                  }`}
                >
                  <Icon name={item.icon} size={12} />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="pt-6">{children}</main>
    </div>
  )
}
