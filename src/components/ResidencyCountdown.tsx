import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"

export default function ResidencyCountdown() {
  const { user } = useAuth()
  const [now, setNow] = useState(() => Date.now())
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => clearInterval(t)
  }, [])

  if (!user || !user.residencyUntil || hidden) return null

  const exp = new Date(user.residencyUntil).getTime()
  const diff = exp - now
  if (diff <= 0) return null

  const totalMin = Math.floor(diff / (60 * 1000))
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin % (60 * 24)) / 60)
  const mins = totalMin % 60

  const label =
    days > 0
      ? `${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}`
      : hours > 0
      ? `${hours} ${hours === 1 ? "час" : hours < 5 ? "часа" : "часов"}`
      : `${mins} мин`

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-[280px]">
      <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 border border-white/20 p-3 pr-9 relative">
        <button
          onClick={() => setHidden(true)}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center"
          title="Скрыть"
        >
          <Icon name="X" size={12} />
        </button>
        <div className="flex items-start gap-2.5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 border border-white/25 flex-shrink-0">
            <Icon name="Gem" size={15} />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/80">
              Промо-резидентство
            </div>
            <div className="text-base font-semibold leading-tight mt-0.5">
              Осталось {label}
            </div>
            <div className="text-[10px] text-white/75 mt-0.5">
              до{" "}
              {new Date(exp).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
