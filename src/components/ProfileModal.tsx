import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function ProfileModal({ open, onOpenChange }: Props) {
  const { user, logout } = useAuth()
  if (!user) return null

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
  const memberSince = new Date(user.joinedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

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
          <Stat icon="Star" value="0" label="Посещено" />
          <Stat icon="Users" value="—" label="Подруг в клубе" />
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
