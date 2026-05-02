import { useMemo, useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth, type User } from "@/contexts/AuthContext"
import { useRequests, type RequestStatus } from "@/contexts/RequestsContext"
import { useNews, type NewsPost } from "@/contexts/NewsContext"
import { useTestimonials } from "@/contexts/TestimonialsContext"
import { useTeamChat } from "@/contexts/TeamChatContext"
import { useNotifications } from "@/contexts/NotificationsContext"
import { useEventSuggestions } from "@/contexts/EventSuggestionsContext"
import {
  useCategories,
  CATEGORY_PRESETS,
  type CategoryItem,
} from "@/contexts/CategoriesContext"
import {
  useDirectory,
  PARTNER_ACCENTS,
  PARTNER_ICONS,
  type Speaker,
  type Resident,
  type Partner,
} from "@/contexts/DirectoryContext"
import { EVENTS, type ClubEvent } from "@/data/events"

type Tab =
  | "dashboard"
  | "members"
  | "events"
  | "directory"
  | "requests"
  | "testimonials"
  | "news"
  | "broadcasts"
  | "chat"

const TABS: { id: Tab; label: string; icon: string; description?: string }[] = [
  { id: "dashboard", label: "Дашборд", icon: "BarChart3", description: "Главные метрики и сводка" },
  { id: "members", label: "Участницы", icon: "Users", description: "База участниц клуба" },
  { id: "events", label: "Мероприятия", icon: "CalendarDays", description: "Расписание и категории" },
  { id: "directory", label: "Каталог клуба", icon: "BookOpen", description: "Спикеры, резиденты, партнёры" },
  { id: "requests", label: "Заявки", icon: "Inbox", description: "Спикеры, партнёры, идеи" },
  { id: "testimonials", label: "Отзывы", icon: "MessageSquareQuote", description: "Модерация отзывов" },
  { id: "news", label: "Новости", icon: "Newspaper", description: "Анонсы и публикации" },
  { id: "broadcasts", label: "Рассылки", icon: "Send", description: "Уведомления участницам" },
  { id: "chat", label: "Чат команды", icon: "Lock", description: "Закрытое общение" },
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  approved: "Одобрена",
  rejected: "Отклонена",
}

const STATUS_COLOR: Record<RequestStatus, string> = {
  new: "bg-sky-100 text-sky-700 border-sky-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-stone-100 text-stone-600 border-stone-200",
}

const CUSTOM_EVENTS_KEY = "mojno_custom_events"

interface CustomEvent extends ClubEvent {
  id: string
}

const readCustomEvents = (): CustomEvent[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeCustomEvents = (list: CustomEvent[]) =>
  localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(list))

export default function Team() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("dashboard")

  if (!isAuthenticated || user?.role !== "team") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-pink-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-black/10 p-8 text-center shadow-sm">
          <span className="inline-flex w-14 h-14 rounded-full bg-stone-100 items-center justify-center mb-4">
            <Icon name="Lock" size={26} className="text-stone-500" />
          </span>
          <h1
            className="text-2xl mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Только для команды клуба
          </h1>
          <p className="text-sm text-black/60 mb-6">
            Этот раздел доступен участницам команды клуба «МОЖНО».
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-black/85"
          >
            <Icon name="ArrowLeft" size={14} />
            На главную
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 via-pink-500 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center gap-4">
          <span className="inline-flex w-11 h-11 rounded-full bg-white/15 items-center justify-center">
            <Icon name="Crown" size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/85">
              Панель управления
            </div>
            <h1
              className="text-2xl sm:text-3xl truncate"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Команда клуба «МОЖНО»
            </h1>
            <div className="text-xs text-white/85 mt-0.5 truncate">
              {user.firstName} {user.lastName}
              {user.teamPosition ? ` — ${user.teamPosition}` : ""}
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-xs uppercase tracking-[0.2em] transition-colors"
          >
            <Icon name="Globe" size={14} />
            На сайт
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <SectionMenu activeTab={tab} onChange={setTab} />

        {/* Content */}
        <main className="min-w-0">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "members" && <MembersTab />}
          {tab === "events" && <EventsTab />}
          {tab === "directory" && <DirectoryTab />}
          {tab === "requests" && <RequestsTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "news" && <NewsTab />}
          {tab === "broadcasts" && <BroadcastsTab />}
          {tab === "chat" && <ChatTab />}
        </main>
      </div>
    </div>
  )
}

/* ───────── Dashboard ───────── */

function DashboardTab() {
  const { getAllUsers } = useAuth()
  const { speakerRequests, partnerRequests, residencyRequests } = useRequests()
  const { testimonials } = useTestimonials()
  const { suggestions } = useEventSuggestions()

  const users = useMemo(() => getAllUsers(), [getAllUsers])
  const teamCount = users.filter((u) => u.role === "team").length
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
  const newWeek = users.filter((u) => new Date(u.joinedAt).getTime() > weekAgo).length
  const totalBalance = users.reduce((s, u) => s + (u.balance || 0), 0)

  const socialPostsCount = useMemo(() => {
    try {
      const raw = localStorage.getItem("mojno_social_posts")
      const arr = raw ? JSON.parse(raw) : []
      return Array.isArray(arr) ? arr.length : 0
    } catch {
      return 0
    }
  }, [])

  const newSpeakers = speakerRequests.filter((r) => r.status === "new").length
  const newPartners = partnerRequests.filter((r) => r.status === "new").length
  const pendingTestimonials = testimonials.filter((t) => t.status === "pending").length
  const newSuggestions = suggestions.filter((s) => s.status === "new").length

  const recentMembers = [...users]
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, 5)

  const allRequests = useMemo(() => {
    const a = speakerRequests.map((r) => ({
      kind: "Спикер",
      title: r.name,
      sub: r.topic || r.expertise,
      date: r.createdAt,
      status: r.status,
    }))
    const b = partnerRequests.map((r) => ({
      kind: "Партнёр",
      title: r.company,
      sub: r.category,
      date: r.createdAt,
      status: r.status,
    }))
    const c = residencyRequests.map((r) => ({
      kind: "Резидентство",
      title: r.userName,
      sub: r.planTitle,
      date: r.createdAt,
      status: r.status,
    }))
    return [...a, ...b, ...c]
      .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())
      .slice(0, 5)
  }, [speakerRequests, partnerRequests, residencyRequests])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        <MetricCard icon="Users" value={users.length} label="Всего участниц" />
        <MetricCard icon="Crown" value={teamCount} label="В команде" />
        <MetricCard icon="UserPlus" value={newWeek} label="Новых за 7 дней" />
        <MetricCard icon="Image" value={socialPostsCount} label="Постов в соцсети" />
        <MetricCard icon="Mic" value={newSpeakers} label="Заявок спикеров" sublabel="новые" />
        <MetricCard
          icon="Handshake"
          value={newPartners}
          label="Заявок партнёров"
          sublabel="новые"
        />
        <MetricCard
          icon="MessageSquareQuote"
          value={pendingTestimonials}
          label="Отзывов на модерации"
        />
        <MetricCard
          icon="Lightbulb"
          value={newSuggestions}
          label="Идей мероприятий"
          sublabel="новые"
        />
        <MetricCard
          icon="Wallet"
          value={`${totalBalance.toLocaleString("ru-RU")} ₽`}
          label="Сумма балансов"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Последние регистрации" icon="UserPlus">
          {recentMembers.length === 0 ? (
            <Empty text="Пока никого нет" />
          ) : (
            <ul className="divide-y divide-black/5">
              {recentMembers.map((m) => (
                <li key={m.email} className="py-2.5 flex items-center gap-3">
                  <Avatar name={`${m.firstName} ${m.lastName}`} team={m.role === "team"} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {m.firstName} {m.lastName}
                    </div>
                    <div className="text-xs text-black/55 truncate">{m.email}</div>
                  </div>
                  <div className="text-[11px] text-black/45">{formatDate(m.joinedAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Последние заявки" icon="Inbox">
          {allRequests.length === 0 ? (
            <Empty text="Заявок пока нет" />
          ) : (
            <ul className="divide-y divide-black/5">
              {allRequests.map((r, i) => (
                <li key={i} className="py-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-pink-600">
                      {r.kind}
                    </span>
                    <StatusBadge status={r.status} />
                    <span className="text-[11px] text-black/45 ml-auto">{formatDate(r.date)}</span>
                  </div>
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  {r.sub && <div className="text-xs text-black/55 truncate">{r.sub}</div>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

/* ───────── Members ───────── */

function MembersTab() {
  const { getAllUsers, updateUserByEmail } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const users = useMemo(() => getAllUsers(), [getAllUsers, refresh])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "member" | "team">("all")
  const [selected, setSelected] = useState<User | null>(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
      const matchSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const role = u.role || "member"
      const matchRole = filter === "all" || role === filter
      return matchSearch && matchRole
    })
  }, [users, search, filter])

  const triggerRefresh = () => setRefresh((x) => x + 1)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-black/[0.04]">
          {(["all", "member", "team"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] transition-colors ${
                filter === f ? "bg-black text-white" : "text-black/60"
              }`}
            >
              {f === "all" ? "Все" : f === "member" ? "Участницы" : "Команда"}
            </button>
          ))}
        </div>
        <div className="text-xs text-black/55">Найдено: {filtered.length}</div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        {filtered.length === 0 ? (
          <Empty text="Никого не найдено" />
        ) : (
          <ul className="divide-y divide-black/5">
            {filtered.map((u) => (
              <li
                key={u.email}
                onClick={() => setSelected(u)}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-black/[0.02]"
              >
                <Avatar name={`${u.firstName} ${u.lastName}`} team={u.role === "team"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-medium truncate">
                      {u.firstName} {u.lastName}
                    </div>
                    {u.role === "team" && (
                      <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white">
                        {u.teamPosition || "Команда"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-black/55 truncate">{u.email}</div>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium">
                    {(u.balance || 0).toLocaleString("ru-RU")} ₽
                  </div>
                  <div className="text-[11px] text-black/45">
                    Приглашено: {u.invitedCount || 0}
                  </div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-black/30" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <MemberDetailDialog
          user={selected}
          onClose={() => setSelected(null)}
          onUpdate={(patch) => {
            const ok = updateUserByEmail(selected.email, patch)
            if (ok) {
              setSelected({ ...selected, ...patch })
              triggerRefresh()
              toast.success("Обновлено")
            }
          }}
        />
      )}
    </div>
  )
}

function MemberDetailDialog({
  user,
  onClose,
  onUpdate,
}: {
  user: User
  onClose: () => void
  onUpdate: (patch: Partial<User>) => void
}) {
  const [notes, setNotes] = useState(user.notes || "")
  const isTeam = user.role === "team"

  const toggleTeam = () => {
    if (isTeam) {
      onUpdate({ role: "member", teamPosition: undefined })
      return
    }
    const position = window.prompt(
      "Должность в команде (например, «Менеджер клуба»)",
      "Команда клуба"
    )
    if (position === null) return
    onUpdate({ role: "team", teamPosition: position.trim() || "Команда клуба" })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar name={`${user.firstName} ${user.lastName}`} team={isTeam} />
            <span>
              {user.firstName} {user.lastName}
            </span>
          </DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Телефон" value={user.phone} />
          <Field label="Возраст" value={user.age} />
          <Field label="Дата вступления" value={formatDate(user.joinedAt)} />
          <Field label="Источник" value={user.source} />
          <Field label="Реферальный код" value={user.referralCode} />
          <Field label="Пригласила" value={user.referredBy} />
          <Field label="Баланс" value={`${(user.balance || 0).toLocaleString("ru-RU")} ₽`} />
          <Field label="Баллы" value={String(user.points || 0)} />
          <Field label="Приглашено" value={String(user.invitedCount || 0)} />
          <Field label="Роль" value={isTeam ? user.teamPosition || "Команда" : "Участница"} />
        </div>

        {user.interests && (
          <div className="mt-3">
            <Label className="text-[11px] uppercase tracking-[0.2em] text-black/50">
              Интересы
            </Label>
            <p className="text-sm text-black/80 mt-1">{user.interests}</p>
          </div>
        )}
        {user.expectations && (
          <div className="mt-3">
            <Label className="text-[11px] uppercase tracking-[0.2em] text-black/50">
              Ожидания от клуба
            </Label>
            <p className="text-sm text-black/80 mt-1">{user.expectations}</p>
          </div>
        )}

        <div className="mt-4">
          <Label htmlFor="notes" className="text-[11px] uppercase tracking-[0.2em] text-black/50">
            Заметка команды
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Например: VIP, нужен персональный подход..."
            className="mt-1"
            rows={3}
          />
          <button
            onClick={() => onUpdate({ notes })}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-black/85"
          >
            <Icon name="Save" size={14} />
            Сохранить заметку
          </button>
        </div>

        <button
          onClick={toggleTeam}
          className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs uppercase tracking-[0.2em] transition-colors ${
            isTeam
              ? "border border-black/15 text-black hover:bg-black/5"
              : "bg-gradient-to-r from-amber-400 via-pink-500 to-fuchsia-600 text-white hover:opacity-95"
          }`}
        >
          <Icon name={isTeam ? "UserMinus" : "Crown"} size={14} />
          {isTeam ? "Снять с команды" : "Назначить в команду"}
        </button>
      </DialogContent>
    </Dialog>
  )
}

/* ───────── Events ───────── */

function EventsTab() {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([])
  const [editing, setEditing] = useState<CustomEvent | null>(null)
  const [creating, setCreating] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  useEffect(() => {
    setCustomEvents(readCustomEvents())
  }, [])

  const registrationsByTitle = useMemo(() => {
    try {
      const raw = localStorage.getItem("mojno_event_registrations")
      const arr = raw ? JSON.parse(raw) : []
      const map = new Map<string, number>()
      if (Array.isArray(arr)) {
        arr.forEach((r: { eventTitle?: string }) => {
          if (r.eventTitle) map.set(r.eventTitle, (map.get(r.eventTitle) || 0) + 1)
        })
      }
      return map
    } catch {
      return new Map<string, number>()
    }
  }, [])

  const persist = (next: CustomEvent[]) => {
    writeCustomEvents(next)
    setCustomEvents(next)
  }

  const upsert = (ev: CustomEvent) => {
    const existing = customEvents.find((e) => e.id === ev.id)
    if (existing) {
      persist(customEvents.map((e) => (e.id === ev.id ? ev : e)))
      toast.success("Мероприятие обновлено")
    } else {
      persist([ev, ...customEvents])
      toast.success("Мероприятие создано")
    }
    setEditing(null)
    setCreating(false)
  }

  const remove = (id: string) => {
    if (!window.confirm("Удалить мероприятие?")) return
    persist(customEvents.filter((e) => e.id !== id))
    toast.success("Удалено")
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Мероприятия клуба
          </h2>
          <p className="text-xs text-black/55 mt-0.5">
            Базовые события из календаря и созданные командой
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoriesOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 text-xs uppercase tracking-[0.2em]"
          >
            <Icon name="Tag" size={14} />
            Категории
          </button>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.2em]"
          >
            <Icon name="Plus" size={14} />
            Создать
          </button>
        </div>
      </div>

      {categoriesOpen && (
        <CategoriesManager open={categoriesOpen} onOpenChange={setCategoriesOpen} />
      )}

      {customEvents.length > 0 && (
        <Panel title="Команда добавила" icon="Star">
          <ul className="divide-y divide-black/5">
            {customEvents.map((e) => (
              <li key={e.id} className="py-2.5 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                  <Icon name="CalendarDays" size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{e.title}</div>
                  <div className="text-xs text-black/55">
                    {formatDate(e.date)} · {e.time} · {e.location}
                  </div>
                </div>
                <div className="text-xs text-black/55">
                  Записано: {registrationsByTitle.get(e.title) || 0}
                </div>
                <button
                  onClick={() => setEditing(e)}
                  className="p-2 rounded-full hover:bg-black/5"
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <button
                  onClick={() => remove(e.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-500"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Базовые мероприятия (только просмотр)" icon="CalendarDays">
        <ul className="divide-y divide-black/5">
          {EVENTS.slice(0, 12).map((e, idx) => (
            <li key={idx} className="py-2.5 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-600">
                <Icon name="CalendarDays" size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{e.title}</div>
                <div className="text-xs text-black/55">
                  {formatDate(e.date)} · {e.time} · {e.location}
                </div>
              </div>
              <div className="text-xs text-black/55">
                Записано: {registrationsByTitle.get(e.title) || 0}
              </div>
            </li>
          ))}
        </ul>
        <div className="text-xs text-black/45 px-2 pt-2">
          Показаны первые 12 из {EVENTS.length}
        </div>
      </Panel>

      {(creating || editing) && (
        <EventForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={upsert}
        />
      )}
    </div>
  )
}

function EventForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: CustomEvent | null
  onCancel: () => void
  onSave: (ev: CustomEvent) => void
}) {
  const { categories } = useCategories()
  const [title, setTitle] = useState(initial?.title || "")
  const [date, setDate] = useState(initial?.date || "")
  const [time, setTime] = useState(initial?.time || "")
  const [category, setCategory] = useState<string>(
    initial?.category || categories[0]?.name || "Девичники"
  )
  const [location, setLocation] = useState(initial?.location || "")
  const [price, setPrice] = useState<string>(String(initial?.price ?? ""))
  const [speaker, setSpeaker] = useState(initial?.speaker || "")
  const [description, setDescription] = useState(initial?.description || "")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !time || !location) {
      toast.error("Заполни обязательные поля")
      return
    }
    const item: CustomEvent = {
      id: initial?.id || `ce-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      date,
      time,
      category: category as ClubEvent["category"],
      location,
      price: Number(price) || 0,
      speaker: speaker || undefined,
      description,
    }
    onSave(item)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initial ? "Редактировать мероприятие" : "Новое мероприятие"}</DialogTitle>
          <DialogDescription>Заполни информацию о встрече</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label>Название*</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Дата*</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Время*</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Категория</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Цена, ₽</Label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Место*</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <Label>Спикер</Label>
            <Input value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ───────── Requests ───────── */

function RequestsTab() {
  const [sub, setSub] = useState<"speakers" | "partners" | "residency" | "ideas">(
    "speakers"
  )
  const { suggestions } = useEventSuggestions()
  const newIdeasCount = suggestions.filter((s) => s.status === "new").length

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-2 flex gap-1 overflow-x-auto">
        {(
          [
            { id: "speakers", label: "Спикеры", icon: "Mic" },
            { id: "partners", label: "Партнёры", icon: "Handshake" },
            { id: "residency", label: "Резидентство", icon: "Home" },
            { id: "ideas", label: "Идеи мероприятий", icon: "Lightbulb" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            onClick={() => setSub(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
              sub === s.id ? "bg-black text-white" : "text-black/65 hover:bg-black/[0.04]"
            }`}
          >
            <Icon name={s.icon} size={14} />
            {s.label}
            {s.id === "ideas" && newIdeasCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  sub === s.id ? "bg-white text-black" : "bg-pink-100 text-pink-700"
                }`}
              >
                {newIdeasCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {sub === "speakers" && <SpeakerRequests />}
      {sub === "partners" && <PartnerRequests />}
      {sub === "residency" && <ResidencyRequests />}
      {sub === "ideas" && <SuggestionRequests />}
    </div>
  )
}

function SuggestionRequests() {
  const { suggestions, updateSuggestion, deleteSuggestion } = useEventSuggestions()
  const [open, setOpen] = useState<string | null>(null)

  if (suggestions.length === 0) return <Empty text="Идей от участниц пока нет" />

  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <ul className="divide-y divide-black/5">
        {suggestions.map((s) => (
          <li key={s.id} className="px-4 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white items-center justify-center flex-shrink-0">
                <Icon name="Lightbulb" size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.title}</div>
                <div className="text-xs text-black/55 truncate">
                  {s.authorName} · {s.category}
                  {s.format ? ` · ${s.format}` : ""}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-pink-600 bg-pink-50 rounded-full px-2 py-0.5">
                <Icon name="Heart" size={11} />
                {s.votes.length}
              </span>
              <StatusBadge status={s.status} />
              <button
                onClick={() => setOpen(open === s.id ? null : s.id)}
                className="text-xs text-black/55 hover:text-black underline"
              >
                {open === s.id ? "Свернуть" : "Подробнее"}
              </button>
              <select
                value={s.status}
                onChange={(e) =>
                  updateSuggestion(s.id, {
                    status: e.target.value as RequestStatus,
                  })
                }
                className="h-9 text-xs rounded-md border border-input bg-background px-2"
              >
                {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABEL[st]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (window.confirm("Удалить идею?")) deleteSuggestion(s.id)
                }}
                className="p-2 rounded-full hover:bg-red-50 text-red-500"
                title="Удалить"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
            {open === s.id && (
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs bg-black/[0.02] rounded-xl p-3">
                <Field label="Контакт" value={s.contact} />
                <Field label="Желаемая дата" value={s.preferredDate} />
                <Field label="Готова прийти" value={s.willAttend ? "Да" : "Нет"} />
                <Field label="Голосов" value={String(s.votes.length)} />
                <div className="sm:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                    Идея
                  </Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{s.description}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                    Комментарий команды
                  </Label>
                  <Textarea
                    rows={2}
                    defaultValue={s.teamComment || ""}
                    onBlur={(e) =>
                      updateSuggestion(s.id, { teamComment: e.target.value })
                    }
                    placeholder="Заметки..."
                  />
                </div>
                <div className="text-[11px] text-black/45 sm:col-span-2">
                  Создана: {formatDateTime(s.createdAt)}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusActions<T extends { id: string; status: RequestStatus; teamComment?: string }>({
  item,
  onUpdate,
  onDelete,
}: {
  item: T
  onUpdate: (patch: Partial<T>) => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={item.status}
        onChange={(e) => onUpdate({ status: e.target.value as RequestStatus } as Partial<T>)}
        className="h-9 text-xs rounded-md border border-input bg-background px-2"
      >
        {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <button
        onClick={onDelete}
        className="p-2 rounded-full hover:bg-red-50 text-red-500"
        title="Удалить"
      >
        <Icon name="Trash2" size={14} />
      </button>
    </div>
  )
}

function SpeakerRequests() {
  const { speakerRequests, updateSpeakerRequest, deleteSpeakerRequest } = useRequests()
  const [open, setOpen] = useState<string | null>(null)

  if (speakerRequests.length === 0) return <Empty text="Заявок от спикеров пока нет" />
  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <ul className="divide-y divide-black/5">
        {speakerRequests.map((r) => (
          <li key={r.id} className="px-4 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Avatar name={r.name} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-xs text-black/55 truncate">
                  {r.expertise} · {r.topic}
                </div>
              </div>
              <StatusBadge status={r.status} />
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                className="text-xs text-black/55 hover:text-black underline"
              >
                {open === r.id ? "Свернуть" : "Подробнее"}
              </button>
              <StatusActions
                item={r}
                onUpdate={(patch) => updateSpeakerRequest(r.id, patch)}
                onDelete={() => deleteSpeakerRequest(r.id)}
              />
            </div>
            {open === r.id && (
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs bg-black/[0.02] rounded-xl p-3">
                <Field label="Email" value={r.email} />
                <Field label="Телефон" value={r.phone} />
                <Field label="Опыт" value={r.experience} />
                <Field label="Соцсети" value={r.socials} />
                <div className="sm:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                    Сообщение
                  </Label>
                  <p className="text-sm mt-1">{r.message || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                    Комментарий команды
                  </Label>
                  <Textarea
                    rows={2}
                    defaultValue={r.teamComment || ""}
                    onBlur={(e) => updateSpeakerRequest(r.id, { teamComment: e.target.value })}
                    placeholder="Заметки..."
                  />
                </div>
                <div className="text-[11px] text-black/45 sm:col-span-2">
                  Создана: {formatDateTime(r.createdAt)}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PartnerRequests() {
  const { partnerRequests, updatePartnerRequest, deletePartnerRequest } = useRequests()
  const [open, setOpen] = useState<string | null>(null)

  if (partnerRequests.length === 0) return <Empty text="Заявок от партнёров пока нет" />
  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <ul className="divide-y divide-black/5">
        {partnerRequests.map((r) => (
          <li key={r.id} className="px-4 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex w-9 h-9 rounded-full bg-stone-100 items-center justify-center">
                <Icon name="Building2" size={14} className="text-stone-500" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.company}</div>
                <div className="text-xs text-black/55 truncate">
                  {r.contactName} · {r.category}
                </div>
              </div>
              <StatusBadge status={r.status} />
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                className="text-xs text-black/55 hover:text-black underline"
              >
                {open === r.id ? "Свернуть" : "Подробнее"}
              </button>
              <StatusActions
                item={r}
                onUpdate={(patch) => updatePartnerRequest(r.id, patch)}
                onDelete={() => deletePartnerRequest(r.id)}
              />
            </div>
            {open === r.id && (
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs bg-black/[0.02] rounded-xl p-3">
                <Field label="Контакт" value={r.contactName} />
                <Field label="Email" value={r.email} />
                <Field label="Телефон" value={r.phone} />
                <Field label="Бюджет" value={r.budget} />
                <div className="sm:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                    Сообщение
                  </Label>
                  <p className="text-sm mt-1">{r.message || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                    Комментарий команды
                  </Label>
                  <Textarea
                    rows={2}
                    defaultValue={r.teamComment || ""}
                    onBlur={(e) => updatePartnerRequest(r.id, { teamComment: e.target.value })}
                    placeholder="Заметки..."
                  />
                </div>
                <div className="text-[11px] text-black/45 sm:col-span-2">
                  Создана: {formatDateTime(r.createdAt)}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ResidencyRequests() {
  const { residencyRequests, updateResidencyRequest, deleteResidencyRequest } = useRequests()

  if (residencyRequests.length === 0)
    return <Empty text="Активных резидентств пока нет" />
  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <ul className="divide-y divide-black/5">
        {residencyRequests.map((r) => (
          <li key={r.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="inline-flex w-9 h-9 rounded-full bg-pink-50 items-center justify-center">
              <Icon name="Home" size={14} className="text-pink-600" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.userName}</div>
              <div className="text-xs text-black/55 truncate">
                {r.email} · {r.planTitle}
              </div>
            </div>
            <div className="text-sm font-medium whitespace-nowrap">
              {r.amount.toLocaleString("ru-RU")} ₽
            </div>
            <StatusBadge status={r.status} />
            <StatusActions
              item={r}
              onUpdate={(patch) => updateResidencyRequest(r.id, patch)}
              onDelete={() => deleteResidencyRequest(r.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ───────── Testimonials ───────── */

function TestimonialsTab() {
  const { testimonials, updateTestimonial, deleteTestimonial } = useTestimonials()
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const filtered = testimonials.filter((t) => filter === "all" || t.status === filter)

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-black/75 flex items-center gap-2">
        <Icon name="Info" size={16} className="text-amber-600 flex-shrink-0" />
        Только одобренные отзывы публикуются на сайте.
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-3 flex gap-1 overflow-x-auto">
        {(
          [
            { id: "all", label: "Все" },
            { id: "pending", label: "На модерации" },
            { id: "approved", label: "Одобрены" },
            { id: "rejected", label: "Отклонены" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] transition-colors ${
              filter === f.id ? "bg-black text-white" : "text-black/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty text="Пока нет отзывов от участниц" />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-black/5 p-4">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Avatar name={t.authorName} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.authorName}</div>
                  <div className="text-xs text-black/55 truncate">{t.authorEmail}</div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${
                    t.status === "approved"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : t.status === "pending"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {t.status === "approved"
                    ? "Одобрен"
                    : t.status === "pending"
                    ? "На модерации"
                    : "Отклонён"}
                </span>
              </div>
              <p className="text-sm text-black/80 leading-relaxed">{t.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => updateTestimonial(t.id, { status: "approved" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
                >
                  <Icon name="Check" size={13} />
                  Одобрить
                </button>
                <button
                  onClick={() => updateTestimonial(t.id, { status: "rejected" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs hover:bg-stone-200"
                >
                  <Icon name="X" size={13} />
                  Отклонить
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Удалить отзыв?")) deleteTestimonial(t.id)
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-red-500 text-xs hover:bg-red-50"
                >
                  <Icon name="Trash2" size={13} />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────── News ───────── */

function NewsTab() {
  const { news, createNews, updateNews, publishNews, unpublishNews, deleteNews } = useNews()
  const { user } = useAuth()
  const [editing, setEditing] = useState<NewsPost | null>(null)
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all")

  const filtered = news.filter((n) => filter === "all" || n.status === filter)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 rounded-full bg-black/[0.04]">
          {(
            [
              { id: "all", label: "Все" },
              { id: "draft", label: "Черновики" },
              { id: "published", label: "Опубликованы" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] transition-colors ${
                filter === f.id ? "bg-black text-white" : "text-black/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.2em]"
        >
          <Icon name="Plus" size={14} />
          Новая запись
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty text="Пока нет новостей" />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden">
              {n.cover && (
                <div className="aspect-[16/6] bg-stone-100">
                  <img src={n.cover} alt={n.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${
                      n.status === "published"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    {n.status === "published" ? "Опубликовано" : "Черновик"}
                  </span>
                  <span className="text-[11px] text-black/45">
                    {n.publishedAt ? formatDate(n.publishedAt) : formatDate(n.createdAt)}
                  </span>
                  <span className="text-[11px] text-black/45 ml-auto truncate">
                    {n.authorName}
                  </span>
                </div>
                <h3
                  className="text-xl"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                >
                  {n.title}
                </h3>
                {n.excerpt && (
                  <p className="text-sm text-black/65 mt-1 line-clamp-2">{n.excerpt}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {n.status === "draft" ? (
                    <button
                      onClick={() => publishNews(n.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
                    >
                      <Icon name="Send" size={13} />
                      Опубликовать
                    </button>
                  ) : (
                    <button
                      onClick={() => unpublishNews(n.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs hover:bg-stone-200"
                    >
                      <Icon name="EyeOff" size={13} />
                      Снять
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(n)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 text-xs hover:bg-black/10"
                  >
                    <Icon name="Pencil" size={13} />
                    Редактировать
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Удалить новость?")) deleteNews(n.id)
                    }}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-red-500 text-xs hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={13} />
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && user && (
        <NewsForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={(data, publish) => {
            if (editing) {
              updateNews(editing.id, {
                ...data,
                status: publish ? "published" : editing.status,
                publishedAt:
                  publish && editing.status !== "published"
                    ? new Date().toISOString()
                    : editing.publishedAt,
              })
              toast.success("Сохранено")
            } else {
              createNews({
                ...data,
                authorEmail: user.email,
                authorName: `${user.firstName} ${user.lastName}`.trim(),
                status: publish ? "published" : "draft",
              })
              toast.success(publish ? "Опубликовано" : "Сохранено как черновик")
            }
            setEditing(null)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}

function NewsForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: NewsPost | null
  onCancel: () => void
  onSave: (
    data: { title: string; excerpt: string; content: string; cover?: string },
    publish: boolean
  ) => void
}) {
  const [title, setTitle] = useState(initial?.title || "")
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "")
  const [content, setContent] = useState(initial?.content || "")
  const [cover, setCover] = useState<string | undefined>(initial?.cover)
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (f: File | undefined) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setCover(reader.result as string)
    reader.readAsDataURL(f)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Редактировать новость" : "Новая новость"}</DialogTitle>
          <DialogDescription>Анонсы, новости и важные объявления клуба</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Заголовок*</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Краткое описание</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Текст*</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Обложка</Label>
            {cover && (
              <div className="relative aspect-[16/6] rounded-xl overflow-hidden mb-2">
                <img src={cover} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setCover(undefined)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-black/15 text-xs hover:bg-black/5"
            >
              <Icon name="ImagePlus" size={14} />
              {cover ? "Заменить обложку" : "Загрузить обложку"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                if (!title || !content) {
                  toast.error("Заполни заголовок и текст")
                  return
                }
                onSave({ title, excerpt, content, cover }, false)
              }}
              className="flex-1 px-4 py-2.5 rounded-full bg-black/5 text-xs uppercase tracking-[0.2em] hover:bg-black/10"
            >
              В черновик
            </button>
            <button
              onClick={() => {
                if (!title || !content) {
                  toast.error("Заполни заголовок и текст")
                  return
                }
                onSave({ title, excerpt, content, cover }, true)
              }}
              className="flex-1 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
            >
              Опубликовать
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ───────── Broadcasts ───────── */

function BroadcastsTab() {
  const { broadcastToAll, broadcasts } = useNotifications()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget] = useState<"all" | "member" | "team">("all")

  const send = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Заполни заголовок и текст")
      return
    }
    const count = broadcastToAll(title.trim(), description.trim(), target)
    toast.success(`Отправлено: ${count} получателям`)
    setTitle("")
    setDescription("")
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="Send" size={18} className="text-pink-600" />
          <h2
            className="text-xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Новая рассылка
          </h2>
        </div>
        <div className="space-y-1">
          <Label>Заголовок</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Новый круг поддержки"
          />
        </div>
        <div className="space-y-1">
          <Label>Сообщение</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Что хочешь сообщить участницам?"
            rows={3}
          />
        </div>
        <div className="space-y-1">
          <Label>Кому</Label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as "all" | "member" | "team")}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Всем</option>
            <option value="member">Только участницам</option>
            <option value="team">Только команде</option>
          </select>
        </div>
        <button
          onClick={send}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-fuchsia-600 text-white text-xs uppercase tracking-[0.2em] hover:opacity-95"
        >
          <Icon name="Send" size={14} />
          Отправить
        </button>
      </div>

      <Panel title="История рассылок" icon="Clock">
        {broadcasts.length === 0 ? (
          <Empty text="Пока ничего не отправляли" />
        ) : (
          <ul className="divide-y divide-black/5">
            {broadcasts.map((b) => (
              <li key={b.id} className="py-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-50 text-pink-600">
                    <Icon name="Send" size={12} />
                  </span>
                  <div className="text-sm font-medium flex-1 min-w-0 truncate">{b.title}</div>
                  <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-black/5 text-black/65">
                    {b.targetRole === "all"
                      ? "Всем"
                      : b.targetRole === "team"
                      ? "Команде"
                      : "Участницам"}
                  </span>
                  <span className="text-[11px] text-black/45">{formatDateTime(b.createdAt)}</span>
                </div>
                <p className="text-xs text-black/65">{b.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

/* ───────── Chat ───────── */

function ChatTab() {
  const { user } = useAuth()
  const { messages, sendMessage, deleteMessage } = useTeamChat()
  const [text, setText] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  if (!user) return null
  const myEmail = user.email

  const send = () => {
    const t = text.trim()
    if (!t) return
    sendMessage(
      {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        position: user.teamPosition,
      },
      t
    )
    setText("")
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 flex flex-col h-[70vh] overflow-hidden">
      <div className="px-4 py-3 border-b border-black/5 flex items-center gap-2">
        <Icon name="Lock" size={16} className="text-pink-600" />
        <div>
          <div className="text-sm font-medium">Закрытый чат команды</div>
          <div className="text-[11px] text-black/55">Только для участниц команды клуба</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
        {messages.length === 0 && (
          <div className="text-center text-sm text-black/45 py-12">
            Пока пусто. Скажи что-нибудь!
          </div>
        )}
        {messages.map((m) => {
          const own = m.authorEmail.toLowerCase() === myEmail.toLowerCase()
          return (
            <div key={m.id} className={`flex gap-2 ${own ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar name={m.authorName} team />
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  own
                    ? "bg-gradient-to-br from-amber-100 via-pink-100 to-fuchsia-100"
                    : "bg-white border border-black/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-medium">{m.authorName}</span>
                  {m.authorPosition && (
                    <span className="text-[10px] text-pink-600">{m.authorPosition}</span>
                  )}
                  <span className="text-[10px] text-black/40">{formatDateTime(m.createdAt)}</span>
                  {own && (
                    <button
                      onClick={() => deleteMessage(m.id, myEmail)}
                      className="text-black/30 hover:text-red-500 ml-auto"
                      title="Удалить"
                    >
                      <Icon name="X" size={11} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-black/85 whitespace-pre-wrap break-words">{m.text}</p>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-black/5 flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Написать сообщение..."
          rows={1}
          className="resize-none min-h-[40px]"
        />
        <button
          onClick={send}
          className="inline-flex items-center gap-2 px-4 rounded-2xl bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
        >
          <Icon name="Send" size={14} />
        </button>
      </div>
    </div>
  )
}

/* ───────── Shared UI ───────── */

function MetricCard({
  icon,
  value,
  label,
  sublabel,
}: {
  icon: string
  value: string | number
  label: string
  sublabel?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4">
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white">
          <Icon name={icon} size={14} />
        </span>
      </div>
      <div className="text-2xl font-medium mt-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-black/55 mt-0.5">{label}</div>
      {sublabel && <div className="text-[10px] text-pink-600 mt-0.5">{sublabel}</div>}
    </div>
  )
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon} size={16} className="text-pink-600" />
        <h3 className="text-sm font-medium uppercase tracking-[0.18em]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="text-center text-sm text-black/45 py-8">{text}</div>
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function Avatar({ name, team }: { name: string; team?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-medium flex-shrink-0 ${
        team
          ? "bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600"
          : "bg-gradient-to-br from-pink-400 to-rose-500"
      }`}
    >
      {initials(name) || "?"}
    </span>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-[0.2em] text-black/50">{label}</Label>
      <div className="text-sm mt-0.5 break-words">{value || "—"}</div>
    </div>
  )
}

/* ───────── Categories Manager ───────── */

function CategoriesManager({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { categories, addCategory, updateCategory, deleteCategory, resetAll } =
    useCategories()
  const [editing, setEditing] = useState<CategoryItem | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = (cat: CategoryItem) => {
    if (!window.confirm(`Удалить категорию «${cat.name}»?`)) return
    if (deleteCategory(cat.name)) toast.success("Категория удалена")
    else toast.error("Не удалось удалить")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Tag" size={18} className="text-pink-600" />
              Категории мероприятий
            </DialogTitle>
            <DialogDescription>
              Переименовывай, меняй иконку и цвет, добавляй новые направления
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center gap-2 flex-wrap pt-1">
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.2em]"
            >
              <Icon name="Plus" size={14} />
              Новая категория
            </button>
            <button
              onClick={() => {
                if (window.confirm("Сбросить все изменения категорий к исходному состоянию?"))
                  resetAll()
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 text-xs uppercase tracking-[0.2em] text-black/60"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить
            </button>
          </div>

          <ul className="mt-3 divide-y divide-black/5 rounded-2xl border border-black/5 overflow-hidden">
            {categories.map((c) => (
              <li
                key={c.name}
                className="px-4 py-3 flex items-center gap-3 bg-white"
              >
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br ${c.color} text-white flex-shrink-0`}
                >
                  <Icon name={c.icon} size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-2 flex-wrap">
                    {c.name}
                    {!c.builtIn && (
                      <span className="text-[9px] uppercase tracking-[0.18em] text-pink-700 bg-pink-50 rounded-full px-2 py-0.5">
                        Своя
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-black/45">{c.icon}</div>
                </div>
                <button
                  onClick={() => setEditing(c)}
                  className="p-2 rounded-full hover:bg-black/5"
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-500"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </li>
            ))}
          </ul>

          <p className="text-[11px] text-black/45 mt-2">
            Базовые мероприятия из календаря привязаны к исходным названиям категорий и могут
            не отобразиться, если категория удалена.
          </p>
        </DialogContent>
      </Dialog>

      {creating && (
        <CategoryForm
          initial={null}
          onCancel={() => setCreating(false)}
          onSave={(data) => {
            const ok = addCategory(data)
            if (ok) {
              toast.success("Категория добавлена")
              setCreating(false)
            } else {
              toast.error("Такая категория уже есть")
            }
          }}
        />
      )}
      {editing && (
        <CategoryForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(data) => {
            const ok = updateCategory(editing.name, {
              newName: data.name,
              icon: data.icon,
              color: data.color,
            })
            if (ok) {
              toast.success("Сохранено")
              setEditing(null)
            } else {
              toast.error("Категория с таким названием уже существует")
            }
          }}
        />
      )}
    </>
  )
}

function CategoryForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: CategoryItem | null
  onCancel: () => void
  onSave: (data: { name: string; icon: string; color: string }) => void
}) {
  const [name, setName] = useState(initial?.name || "")
  const [icon, setIcon] = useState(initial?.icon || CATEGORY_PRESETS.icons[0])
  const [color, setColor] = useState(initial?.color || CATEGORY_PRESETS.colors[0])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Введи название")
      return
    }
    onSave({ name: name.trim(), icon, color })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Редактировать категорию" : "Новая категория"}
          </DialogTitle>
          <DialogDescription>
            Название, иконка и градиент — как будет выглядеть направление
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-2xl bg-stone-50 p-4 flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white`}
            >
              <Icon name={icon} size={18} />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">
                Превью
              </div>
              <div
                className="text-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {name || "Название"}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Название*</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <Label>Иконка</Label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {CATEGORY_PRESETS.icons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? "bg-pink-600 text-white shadow"
                      : "bg-stone-100 text-black/65 hover:bg-pink-50"
                  }`}
                  title={ic}
                >
                  <Icon name={ic} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Цвет</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {CATEGORY_PRESETS.colors.map((cl) => (
                <button
                  key={cl}
                  type="button"
                  onClick={() => setColor(cl)}
                  className={`h-10 rounded-xl bg-gradient-to-br ${cl} ring-2 ring-offset-2 transition-all ${
                    color === cl ? "ring-pink-600" : "ring-transparent"
                  }`}
                  title={cl}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ───────── Section menu (dropdown) ───────── */

function SectionMenu({
  activeTab,
  onChange,
}: {
  activeTab: Tab
  onChange: (t: Tab) => void
}) {
  const [open, setOpen] = useState(false)
  const active = TABS.find((t) => t.id === activeTab)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white rounded-2xl border border-black/5 shadow-sm px-5 py-4 flex items-center gap-3 hover:bg-pink-50/50 transition-colors"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 text-white flex-shrink-0">
          <Icon name={active?.icon || "LayoutGrid"} size={16} />
        </span>
        <div className="flex-1 text-left min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-pink-600">
            Раздел панели
          </div>
          <div className="text-base font-medium truncate">{active?.label || "Меню"}</div>
          {active?.description && (
            <div className="text-xs text-black/50 truncate">{active.description}</div>
          )}
        </div>
        <Icon
          name={open ? "ChevronUp" : "ChevronDown"}
          size={18}
          className="text-black/40 flex-shrink-0"
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute z-40 mt-2 left-0 right-0 bg-white rounded-2xl border border-black/10 shadow-xl overflow-hidden">
            <ul className="max-h-[70vh] overflow-y-auto">
              {TABS.map((t) => {
                const isActive = t.id === activeTab
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => {
                        onChange(t.id)
                        setOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-amber-50 via-pink-50 to-fuchsia-50"
                          : "hover:bg-black/[0.03]"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${
                          isActive
                            ? "bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 text-white"
                            : "bg-stone-100 text-black/65"
                        }`}
                      >
                        <Icon name={t.icon} size={14} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm ${
                            isActive ? "font-medium text-pink-700" : "text-black/85"
                          }`}
                        >
                          {t.label}
                        </div>
                        {t.description && (
                          <div className="text-[11px] text-black/50 truncate">
                            {t.description}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <Icon name="Check" size={14} className="text-pink-600" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

/* ───────── Directory tab (Speakers / Residents / Partners) ───────── */

type DirSub = "speakers" | "residents" | "partners"

function DirectoryTab() {
  const [sub, setSub] = useState<DirSub>("speakers")
  const {
    speakers,
    residents,
    partners,
    resetSpeakers,
    resetResidents,
    resetPartners,
  } = useDirectory()

  const counts = {
    speakers: speakers.length,
    residents: residents.length,
    partners: partners.length,
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-2 flex gap-1 overflow-x-auto">
        {(
          [
            { id: "speakers", label: "Спикеры", icon: "Mic" },
            { id: "residents", label: "Резиденты", icon: "Heart" },
            { id: "partners", label: "Партнёры", icon: "Handshake" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            onClick={() => setSub(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
              sub === s.id ? "bg-black text-white" : "text-black/65 hover:bg-black/[0.04]"
            }`}
          >
            <Icon name={s.icon} size={14} />
            {s.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                sub === s.id ? "bg-white text-black" : "bg-black/[0.05] text-black/55"
              }`}
            >
              {counts[s.id]}
            </span>
          </button>
        ))}
      </div>

      {sub === "speakers" && <SpeakersManager onReset={resetSpeakers} />}
      {sub === "residents" && <ResidentsManager onReset={resetResidents} />}
      {sub === "partners" && <PartnersManager onReset={resetPartners} />}
    </div>
  )
}

function ManagerToolbar({
  title,
  subtitle,
  onAdd,
  onReset,
}: {
  title: string
  subtitle: string
  onAdd: () => void
  onReset: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2
          className="text-xl"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {title}
        </h2>
        <p className="text-xs text-black/55 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            if (window.confirm("Сбросить к исходному списку?")) onReset()
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 text-xs uppercase tracking-[0.2em] text-black/60"
        >
          <Icon name="RotateCcw" size={14} />
          Сбросить
        </button>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.2em]"
        >
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>
    </div>
  )
}

function SpeakersManager({ onReset }: { onReset: () => void }) {
  const { speakers, addSpeaker, updateSpeaker, deleteSpeaker } = useDirectory()
  const [editing, setEditing] = useState<Speaker | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = (s: Speaker) => {
    if (!window.confirm(`Удалить спикера «${s.name}»?`)) return
    deleteSpeaker(s.id)
    toast.success("Удалено")
  }

  return (
    <div className="space-y-3">
      <ManagerToolbar
        title="Спикеры клуба"
        subtitle="Эксперты и приглашённые гости — отображаются на странице «Спикеры»"
        onAdd={() => setCreating(true)}
        onReset={onReset}
      />

      {speakers.length === 0 ? (
        <Empty text="Пока нет спикеров" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {speakers.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-black/5 p-4 flex gap-3"
            >
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                {s.photo ? (
                  <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/30">
                    <Icon name="Image" size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-pink-600 mt-0.5 truncate">
                  {s.role}
                </div>
                <p className="text-xs text-black/65 mt-1.5 line-clamp-2">{s.bio}</p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => setEditing(s)}
                    className="p-1.5 rounded-full hover:bg-black/5"
                    title="Редактировать"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <SpeakerForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={(data) => {
            if (editing) {
              updateSpeaker(editing.id, data)
              toast.success("Спикер обновлён")
            } else {
              addSpeaker(data)
              toast.success("Спикер добавлен")
            }
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function SpeakerForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Speaker | null
  onCancel: () => void
  onSave: (data: Omit<Speaker, "id">) => void
}) {
  const [name, setName] = useState(initial?.name || "")
  const [role, setRole] = useState(initial?.role || "")
  const [bio, setBio] = useState(initial?.bio || "")
  const [photo, setPhoto] = useState(initial?.photo || "")
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (f?: File) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(f)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim()) {
      toast.error("Заполни имя и роль")
      return
    }
    onSave({ name: name.trim(), role: role.trim(), bio: bio.trim(), photo })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Редактировать спикера" : "Новый спикер"}</DialogTitle>
          <DialogDescription>Карточка эксперта на странице «Спикеры»</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <PhotoField photo={photo} onChange={setPhoto} fileRef={fileRef} onFile={onFile} />
          <div className="space-y-1">
            <Label>Имя*</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Роль / специальность*</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Биография</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <FormButtons onCancel={onCancel} />
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResidentsManager({ onReset }: { onReset: () => void }) {
  const { residents, addResident, updateResident, deleteResident } = useDirectory()
  const [editing, setEditing] = useState<Resident | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = (r: Resident) => {
    if (!window.confirm(`Удалить резидентку «${r.name}»?`)) return
    deleteResident(r.id)
    toast.success("Удалено")
  }

  return (
    <div className="space-y-3">
      <ManagerToolbar
        title="Резидентки клуба"
        subtitle="Карусель действующих резиденток на странице «Резидентство»"
        onAdd={() => setCreating(true)}
        onReset={onReset}
      />

      {residents.length === 0 ? (
        <Empty text="Пока нет резиденток" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {residents.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-black/5 p-4 flex gap-3"
            >
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                {r.photo ? (
                  <img src={r.photo} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/30">
                    <Icon name="Image" size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-[11px] text-black/55 truncate">{r.role}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-pink-600 mt-0.5">
                  {r.since}
                </div>
                <p className="text-xs text-black/65 mt-1.5 line-clamp-2 italic">«{r.quote}»</p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => setEditing(r)}
                    className="p-1.5 rounded-full hover:bg-black/5"
                    title="Редактировать"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ResidentForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={(data) => {
            if (editing) {
              updateResident(editing.id, data)
              toast.success("Резидентка обновлена")
            } else {
              addResident(data)
              toast.success("Резидентка добавлена")
            }
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function ResidentForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Resident | null
  onCancel: () => void
  onSave: (data: Omit<Resident, "id">) => void
}) {
  const [name, setName] = useState(initial?.name || "")
  const [role, setRole] = useState(initial?.role || "")
  const [since, setSince] = useState(initial?.since || "")
  const [quote, setQuote] = useState(initial?.quote || "")
  const [photo, setPhoto] = useState(initial?.photo || "")
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (f?: File) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(f)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Введи имя")
      return
    }
    onSave({
      name: name.trim(),
      role: role.trim(),
      since: since.trim() || "С нами недавно",
      quote: quote.trim(),
      photo,
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Редактировать резидентку" : "Новая резидентка"}
          </DialogTitle>
          <DialogDescription>Карточка для карусели резидентства</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <PhotoField photo={photo} onChange={setPhoto} fileRef={fileRef} onFile={onFile} />
          <div className="space-y-1">
            <Label>Имя*</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Роль / профессия</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>В клубе с</Label>
            <Input
              value={since}
              onChange={(e) => setSince(e.target.value)}
              placeholder="С нами 2 года"
            />
          </div>
          <div className="space-y-1">
            <Label>Цитата</Label>
            <Textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} />
          </div>
          <FormButtons onCancel={onCancel} />
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PartnersManager({ onReset }: { onReset: () => void }) {
  const { partners, addPartner, updatePartner, deletePartner } = useDirectory()
  const [editing, setEditing] = useState<Partner | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = (p: Partner) => {
    if (!window.confirm(`Удалить партнёра «${p.name}»?`)) return
    deletePartner(p.id)
    toast.success("Удалено")
  }

  return (
    <div className="space-y-3">
      <ManagerToolbar
        title="Партнёры клуба"
        subtitle="Бренды на странице «Партнёрство»"
        onAdd={() => setCreating(true)}
        onReset={onReset}
      />

      {partners.length === 0 ? (
        <Empty text="Пока нет партнёров" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {partners.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-black/5 p-4 flex gap-3"
            >
              <span
                className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} text-white flex-shrink-0`}
              >
                <Icon name={p.icon} size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-pink-600">
                  {p.category}
                </div>
                <div className="text-sm font-medium truncate">{p.name}</div>
                <p className="text-xs text-black/65 mt-1 line-clamp-2">{p.description}</p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => setEditing(p)}
                    className="p-1.5 rounded-full hover:bg-black/5"
                    title="Редактировать"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <PartnerForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={(data) => {
            if (editing) {
              updatePartner(editing.id, data)
              toast.success("Партнёр обновлён")
            } else {
              addPartner(data)
              toast.success("Партнёр добавлен")
            }
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function PartnerForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Partner | null
  onCancel: () => void
  onSave: (data: Omit<Partner, "id">) => void
}) {
  const [name, setName] = useState(initial?.name || "")
  const [category, setCategory] = useState(initial?.category || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [icon, setIcon] = useState(initial?.icon || PARTNER_ICONS[0])
  const [accent, setAccent] = useState(initial?.accent || PARTNER_ACCENTS[0])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category.trim()) {
      toast.error("Заполни название и категорию")
      return
    }
    onSave({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      icon,
      accent,
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Редактировать партнёра" : "Новый партнёр"}</DialogTitle>
          <DialogDescription>Карточка бренда на странице «Партнёрство»</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="rounded-2xl bg-stone-50 p-4 flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} text-white`}
            >
              <Icon name={icon} size={18} />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-pink-600">
                {category || "Категория"}
              </div>
              <div
                className="text-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {name || "Название"}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Название*</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Категория*</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Спа, ресторан, фитнес..."
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1">
            <Label>Иконка</Label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {PARTNER_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? "bg-pink-600 text-white shadow"
                      : "bg-stone-100 text-black/65 hover:bg-pink-50"
                  }`}
                  title={ic}
                >
                  <Icon name={ic} size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Цвет</Label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {PARTNER_ACCENTS.map((cl) => (
                <button
                  key={cl}
                  type="button"
                  onClick={() => setAccent(cl)}
                  className={`h-10 rounded-xl bg-gradient-to-br ${cl} ring-2 ring-offset-2 transition-all ${
                    accent === cl ? "ring-pink-600" : "ring-transparent"
                  }`}
                  title={cl}
                />
              ))}
            </div>
          </div>
          <FormButtons onCancel={onCancel} />
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PhotoField({
  photo,
  onChange,
  fileRef,
  onFile,
}: {
  photo: string
  onChange: (v: string) => void
  fileRef: React.RefObject<HTMLInputElement>
  onFile: (f?: File) => void
}) {
  return (
    <div className="space-y-1">
      <Label>Фото</Label>
      {photo && (
        <div className="relative w-32 aspect-[4/5] rounded-xl overflow-hidden mb-2">
          <img src={photo} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-black/15 text-xs hover:bg-black/5"
        >
          <Icon name="ImagePlus" size={14} />
          {photo ? "Заменить" : "Загрузить"}
        </button>
        <Input
          value={photo.startsWith("data:") ? "" : photo}
          onChange={(e) => onChange(e.target.value)}
          placeholder="или вставь URL"
          className="flex-1 min-w-[200px]"
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  )
}

function FormButtons({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
      >
        Отмена
      </button>
      <button
        type="submit"
        className="flex-1 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
      >
        Сохранить
      </button>
    </div>
  )
}