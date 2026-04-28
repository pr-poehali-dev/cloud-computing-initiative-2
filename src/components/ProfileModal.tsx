import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { useAuth, REFERRAL_BONUS } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function ProfileModal({ open, onOpenChange }: Props) {
  const { user, logout, updateProfile } = useAuth()

  // Sync stats from storage when modal opens (in case someone registered via my link)
  useEffect(() => {
    if (!open || !user) return
    try {
      const all = JSON.parse(localStorage.getItem("mojno_users") || "[]") as Array<
        { email: string; invitedCount?: number; points?: number }
      >
      const fresh = all.find((u) => u.email === user.email)
      if (
        fresh &&
        ((fresh.invitedCount ?? 0) !== (user.invitedCount ?? 0) ||
          (fresh.points ?? 0) !== (user.points ?? 0))
      ) {
        updateProfile({
          invitedCount: fresh.invitedCount ?? 0,
          points: fresh.points ?? 0,
        })
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!user) return null

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
  const memberSince = new Date(user.joinedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast.success("Ссылка скопирована!")
    } catch {
      toast.error("Не удалось скопировать")
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Клуб «МОЖНО»",
          text: "Присоединяйся к нашему женскому клубу",
          url: referralLink,
        })
      } catch {
        /* cancelled */
      }
    } else {
      copyLink()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase tracking-[0.2em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            Личный кабинет
          </DialogTitle>
          <DialogDescription>Твой профиль и активность в клубе</DialogDescription>
        </DialogHeader>

        {/* Profile header */}
        <div className="mt-2 rounded-2xl bg-gradient-to-br from-pink-100 to-white border border-black/10 p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center text-xl font-medium">
            {initials || "—"}
          </div>
          <div className="flex-1">
            <div className="text-xl font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-black/55 uppercase tracking-[0.2em] mt-1">В клубе с {memberSince}</div>
          </div>
        </div>

        {/* Contacts */}
        <div className="grid sm:grid-cols-2 gap-3 pt-4">
          <InfoRow icon="Mail" label="Email" value={user.email} />
          <InfoRow icon="Phone" label="Телефон" value={user.phone} />
          {user.age && <InfoRow icon="User" label="Возраст" value={user.age} />}
        </div>

        {user.interests && (
          <Section title="Интересы" icon="Sparkles" text={user.interests} />
        )}
        {user.expectations && (
          <Section title="Чего ждёшь от клуба" icon="Heart" text={user.expectations} />
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          <Stat icon="CalendarCheck" value="0" label="Записей" />
          <Stat icon="UserPlus" value={String(user.invitedCount || 0)} label="Подруг приглашено" />
          <Stat icon="Sparkles" value={String(user.points || 0)} label="Баллов" />
        </div>

        {/* Referral block */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Gift" size={16} className="text-pink-600" />
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-pink-700">
              Пригласи подругу
            </div>
          </div>
          <p className="text-sm text-black/70 leading-relaxed mb-3">
            За каждую подругу, которая зарегистрируется по твоей ссылке, тебе начислим{" "}
            <span className="font-semibold text-pink-700">+{REFERRAL_BONUS} баллов</span>. Баллы
            можно обменять на скидки и подарки клуба.
          </p>
          <div className="flex items-center gap-2 bg-white rounded-full border border-pink-200 px-4 py-2.5">
            <Icon name="Link" size={14} className="text-pink-600 flex-shrink-0" />
            <input
              readOnly
              value={referralLink}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 bg-transparent text-sm text-black/80 outline-none truncate min-w-0"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={copyLink}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.18em] transition-colors"
            >
              <Icon name="Copy" size={14} />
              Скопировать
            </button>
            <button
              onClick={shareLink}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-pink-300 text-pink-700 hover:bg-pink-100 text-xs uppercase tracking-[0.18em] transition-colors"
            >
              <Icon name="Share2" size={14} />
              Поделиться
            </button>
          </div>
          <div className="mt-3 text-[11px] text-black/55 text-center">
            Твой код: <span className="font-medium text-black/80">{user.referralCode}</span>
          </div>
        </div>

        <button
          onClick={() => {
            logout()
            onOpenChange(false)
          }}
          className="mt-4 inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full border border-black/15 text-black text-sm uppercase tracking-[0.2em] hover:bg-black/5 transition-colors"
        >
          <Icon name="LogOut" size={16} />
          Выйти
        </button>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/10 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-black/50 flex items-center gap-1.5">
        <Icon name={icon} size={12} />
        {label}
      </div>
      <div className="text-sm mt-1 break-words">{value}</div>
    </div>
  )
}

function Section({ title, icon, text }: { title: string; icon: string; text: string }) {
  return (
    <div className="pt-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-black/50 flex items-center gap-1.5 mb-1">
        <Icon name={icon} size={12} />
        {title}
      </div>
      <p className="text-sm leading-relaxed text-black/80">{text}</p>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-black/10 px-3 py-3 text-center">
      <Icon name={icon} size={18} className="mx-auto text-pink-500" />
      <div className="text-lg font-semibold mt-1">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-black/50">{label}</div>
    </div>
  )
}