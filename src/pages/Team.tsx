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
  TEAM_ACCENTS,
  type Speaker,
  type Resident,
  type Partner,
  type TeamMember,
} from "@/contexts/DirectoryContext"
import { EVENTS, type ClubEvent } from "@/data/events"
import ImageCropper from "@/components/ImageCropper"
import {
  usePromotions,
  type Promotion,
  type PromotionKind,
} from "@/contexts/PromotionsContext"

type Tab =
  | "dashboard"
  | "members"
  | "events"
  | "registrations"
  | "directory"
  | "requests"
  | "promotions"
  | "testimonials"
  | "news"
  | "broadcasts"
  | "chat"

const TABS: { id: Tab; label: string; icon: string; description?: string }[] = [
  { id: "dashboard", label: "Дашборд", icon: "BarChart3", description: "Главные метрики и сводка" },
  { id: "members", label: "Участницы", icon: "Users", description: "База участниц клуба" },
  { id: "events", label: "Мероприятия", icon: "CalendarDays", description: "Расписание и категории" },
  { id: "registrations", label: "Все заявки на мероприятия", icon: "ClipboardList", description: "История записей с фильтрами" },
  { id: "directory", label: "Каталог клуба", icon: "BookOpen", description: "Спикеры, резиденты, партнёры" },
  { id: "requests", label: "Заявки", icon: "Inbox", description: "Спикеры, партнёры, идеи" },
  { id: "promotions", label: "Акции", icon: "Sparkles", description: "Управление акциями и журнал" },
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
const HIDDEN_BASE_EVENTS_KEY = "mojno_base_events_hidden"

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

const readHiddenBaseEvents = (): string[] => {
  try {
    const raw = localStorage.getItem(HIDDEN_BASE_EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeHiddenBaseEvents = (list: string[]) =>
  localStorage.setItem(HIDDEN_BASE_EVENTS_KEY, JSON.stringify(list))

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
          {tab === "registrations" && <RegistrationsTab />}
          {tab === "directory" && <DirectoryTab />}
          {tab === "requests" && <RequestsTab />}
          {tab === "promotions" && <PromotionsTab />}
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

type MemberRoleFilter = "all" | "member" | "resident" | "blogger" | "team"

const MEMBER_ROLE_META: Record<
  Exclude<MemberRoleFilter, "all">,
  {
    label: string
    icon: string
    chip: string
    row: string
    accent: string
    dot: string
  }
> = {
  team: {
    label: "Команда",
    icon: "Crown",
    chip: "bg-gradient-to-r from-amber-400 via-pink-500 to-fuchsia-500 text-white border-transparent",
    row: "bg-gradient-to-r from-amber-50/80 via-pink-50/70 to-fuchsia-50/80 hover:from-amber-50 hover:via-pink-50 hover:to-fuchsia-50",
    accent: "border-l-4 border-l-pink-500",
    dot: "bg-pink-500",
  },
  blogger: {
    label: "Блогер",
    icon: "Camera",
    chip: "bg-pink-100 text-pink-700 border-pink-200",
    row: "bg-pink-50/40 hover:bg-pink-50/70",
    accent: "border-l-4 border-l-pink-400",
    dot: "bg-pink-400",
  },
  resident: {
    label: "Резидент",
    icon: "Gem",
    chip: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    row: "bg-fuchsia-50/40 hover:bg-fuchsia-50/70",
    accent: "border-l-4 border-l-fuchsia-500",
    dot: "bg-fuchsia-500",
  },
  member: {
    label: "Участница",
    icon: "Heart",
    chip: "bg-rose-50 text-rose-600 border-rose-100",
    row: "bg-white hover:bg-black/[0.02]",
    accent: "border-l-4 border-l-rose-300",
    dot: "bg-rose-300",
  },
}

const MEMBER_ROLE_ORDER: Exclude<MemberRoleFilter, "all">[] = [
  "team",
  "resident",
  "blogger",
  "member",
]

function MembersTab() {
  const { getAllUsers, updateUserByEmail, importUsers } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const users = useMemo(() => getAllUsers(), [getAllUsers, refresh])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<MemberRoleFilter>("all")
  const [groupByRole, setGroupByRole] = useState(true)
  const [selected, setSelected] = useState<User | null>(null)
  const [dbOpen, setDbOpen] = useState(false)

  const counts = useMemo(() => {
    const acc: Record<Exclude<MemberRoleFilter, "all">, number> = {
      member: 0,
      resident: 0,
      blogger: 0,
      team: 0,
    }
    users.forEach((u) => {
      const r = (u.role || "member") as Exclude<MemberRoleFilter, "all">
      if (acc[r] !== undefined) acc[r] += 1
    })
    return acc
  }, [users])

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

  const grouped = useMemo(() => {
    const map: Record<Exclude<MemberRoleFilter, "all">, User[]> = {
      team: [],
      resident: [],
      blogger: [],
      member: [],
    }
    filtered.forEach((u) => {
      const r = (u.role || "member") as Exclude<MemberRoleFilter, "all">
      if (map[r]) map[r].push(u)
    })
    return map
  }, [filtered])

  const triggerRefresh = () => setRefresh((x) => x + 1)

  const FILTER_TABS: { id: MemberRoleFilter; label: string; icon: string; count: number; chip: string }[] = [
    { id: "all", label: "Все", icon: "Users", count: users.length, chip: "" },
    { id: "team", label: "Команда", icon: "Crown", count: counts.team, chip: MEMBER_ROLE_META.team.chip },
    { id: "resident", label: "Резиденты", icon: "Gem", count: counts.resident, chip: MEMBER_ROLE_META.resident.chip },
    { id: "blogger", label: "Блогеры", icon: "Camera", count: counts.blogger, chip: MEMBER_ROLE_META.blogger.chip },
    { id: "member", label: "Участницы", icon: "Heart", count: counts.member, chip: MEMBER_ROLE_META.member.chip },
  ]

  const renderUserRow = (u: User) => {
    const r = (u.role || "member") as Exclude<MemberRoleFilter, "all">
    const meta = MEMBER_ROLE_META[r]
    return (
      <li
        key={u.email}
        onClick={() => setSelected(u)}
        className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${meta.row} ${meta.accent}`}
      >
        <Avatar name={`${u.firstName} ${u.lastName}`} team={u.role === "team"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-medium truncate">
              {u.firstName} {u.lastName}
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${meta.chip}`}
            >
              <Icon name={meta.icon} size={10} />
              {u.role === "team" ? u.teamPosition || meta.label : meta.label}
            </span>
          </div>
          <div className="text-xs text-black/55 truncate">{u.email}</div>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-sm font-medium">
            {(u.balance || 0).toLocaleString("ru-RU")} ₽
          </div>
          <div className="text-[11px] text-pink-600">
            {(u.points || 0).toLocaleString("ru-RU")} баллов
          </div>
        </div>
        <Icon name="ChevronRight" size={16} className="text-black/30" />
      </li>
    )
  }

  return (
    <div className="space-y-4">
      {/* Шапка вкладки с действиями */}
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="text-xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Участницы клуба
          </h2>
          <p className="text-xs text-black/55 mt-0.5">
            {users.length} {users.length === 1 ? "запись" : "записей"} в базе
          </p>
        </div>
        <button
          onClick={() => setDbOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-black/85"
        >
          <Icon name="Database" size={14} />
          База данных
        </button>
      </div>

      {/* Метрики по ролям */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MEMBER_ROLE_ORDER.map((r) => {
          const meta = MEMBER_ROLE_META[r]
          return (
            <button
              key={r}
              type="button"
              onClick={() => setFilter(r)}
              className={`text-left bg-white rounded-2xl border p-4 transition-all hover:-translate-y-0.5 ${
                filter === r ? "border-black shadow-sm" : "border-black/5"
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${meta.chip}`}
                >
                  <Icon name={meta.icon} size={14} />
                </span>
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
              </div>
              <div className="text-2xl font-medium mt-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {counts[r]}
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-black/55 mt-0.5">
                {meta.label === "Команда" ? "Команда" : `${meta.label}ы`}
              </div>
            </button>
          )
        })}
      </div>

      {/* Поиск и фильтры */}
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
        <div className="flex gap-1 p-1 rounded-full bg-black/[0.04] flex-wrap">
          {FILTER_TABS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] transition-colors ${
                filter === f.id ? "bg-black text-white" : "text-black/60 hover:bg-white"
              }`}
            >
              <Icon name={f.icon} size={12} />
              {f.label}
              <span
                className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                  filter === f.id ? "bg-white/20" : "bg-black/[0.06] text-black/65"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setGroupByRole((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs uppercase tracking-[0.18em] transition-colors ${
            groupByRole
              ? "bg-black text-white border-black"
              : "border-black/15 text-black/65 hover:bg-black/5"
          }`}
          title="Группировать по статусам"
        >
          <Icon name="LayoutList" size={12} />
          По статусам
        </button>
        <div className="text-xs text-black/55">Найдено: {filtered.length}</div>
      </div>

      {/* Список */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <Empty text="Никого не найдено" />
        </div>
      ) : groupByRole && filter === "all" ? (
        <div className="space-y-3">
          {MEMBER_ROLE_ORDER.map((r) => {
            const list = grouped[r]
            if (list.length === 0) return null
            const meta = MEMBER_ROLE_META[r]
            return (
              <div
                key={r}
                className="bg-white rounded-2xl border border-black/5 overflow-hidden"
              >
                <div className="px-4 py-2.5 flex items-center gap-2 border-b border-black/5 bg-black/[0.015]">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${meta.chip}`}
                  >
                    <Icon name={meta.icon} size={10} />
                    {meta.label}
                  </span>
                  <span className="text-xs text-black/55">{list.length}</span>
                </div>
                <ul className="divide-y divide-black/5">
                  {list.map(renderUserRow)}
                </ul>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <ul className="divide-y divide-black/5">{filtered.map(renderUserRow)}</ul>
        </div>
      )}

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

      <UsersDatabaseDialog
        open={dbOpen}
        onClose={() => setDbOpen(false)}
        users={users}
        onImport={(rows, mode) => {
          const result = importUsers(rows, { mode })
          triggerRefresh()
          toast.success(
            `Импорт завершён · добавлено ${result.added}, обновлено ${result.updated}` +
              (result.skipped ? `, пропущено ${result.skipped}` : "")
          )
        }}
      />
    </div>
  )
}

/* ───────── Users Database (импорт/экспорт) ───────── */

const USER_EXPORT_COLUMNS: { key: keyof User; label: string }[] = [
  { key: "firstName", label: "Имя" },
  { key: "lastName", label: "Фамилия" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Телефон" },
  { key: "age", label: "Возраст" },
  { key: "birthDate", label: "Дата рождения" },
  { key: "telegram", label: "Telegram" },
  { key: "role", label: "Роль" },
  { key: "teamPosition", label: "Должность в команде" },
  { key: "joinedAt", label: "Дата вступления" },
  { key: "referralCode", label: "Реферальный код" },
  { key: "referredBy", label: "Пригласила (код)" },
  { key: "invitedCount", label: "Приглашено" },
  { key: "points", label: "Баллы" },
  { key: "balance", label: "Баланс" },
  { key: "source", label: "Источник" },
  { key: "interests", label: "Интересы" },
  { key: "expectations", label: "Ожидания" },
  { key: "notes", label: "Заметка" },
]

const csvEscape = (v: unknown): string => {
  if (v === null || v === undefined) return ""
  const s = String(v)
  if (/[";,\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const buildUsersCsv = (rows: User[]): string => {
  const header = USER_EXPORT_COLUMNS.map((c) => csvEscape(c.label)).join(";")
  const lines = rows.map((r) =>
    USER_EXPORT_COLUMNS.map((c) => csvEscape(r[c.key])).join(";")
  )
  return ["\uFEFF" + header, ...lines].join("\r\n")
}

const parseCsv = (text: string): string[][] => {
  // Удаляем BOM
  const clean = text.replace(/^\uFEFF/, "")
  // Определяем разделитель — точка с запятой в приоритете для русских Excel
  const firstLine = clean.split(/\r?\n/)[0] || ""
  const delim = firstLine.includes(";") ? ";" : ","
  const rows: string[][] = []
  let cur: string[] = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === delim) {
        cur.push(field)
        field = ""
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && clean[i + 1] === "\n") i++
        cur.push(field)
        rows.push(cur)
        cur = []
        field = ""
      } else field += ch
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field)
    rows.push(cur)
  }
  return rows.filter((r) => r.length > 1 || (r[0] && r[0].trim()))
}

const HEADER_ALIASES: Record<string, keyof User> = {
  имя: "firstName",
  firstname: "firstName",
  "first name": "firstName",
  name: "firstName",
  фамилия: "lastName",
  lastname: "lastName",
  "last name": "lastName",
  email: "email",
  почта: "email",
  "e-mail": "email",
  телефон: "phone",
  phone: "phone",
  возраст: "age",
  age: "age",
  "дата рождения": "birthDate",
  birthdate: "birthDate",
  telegram: "telegram",
  тг: "telegram",
  роль: "role",
  role: "role",
  должность: "teamPosition",
  "должность в команде": "teamPosition",
  teamposition: "teamPosition",
  "дата вступления": "joinedAt",
  joinedat: "joinedAt",
  "реферальный код": "referralCode",
  referralcode: "referralCode",
  "пригласила (код)": "referredBy",
  referredby: "referredBy",
  приглашено: "invitedCount",
  invitedcount: "invitedCount",
  баллы: "points",
  points: "points",
  баланс: "balance",
  balance: "balance",
  источник: "source",
  source: "source",
  интересы: "interests",
  interests: "interests",
  ожидания: "expectations",
  expectations: "expectations",
  заметка: "notes",
  notes: "notes",
}

const mapHeaderToKey = (h: string): keyof User | null => {
  const norm = h.trim().toLowerCase()
  return HEADER_ALIASES[norm] || null
}

const csvRowsToUsers = (rows: string[][]): Partial<User>[] => {
  if (rows.length === 0) return []
  const header = rows[0].map((h) => mapHeaderToKey(h))
  return rows.slice(1).map((r) => {
    const obj: Partial<User> = {}
    header.forEach((key, i) => {
      if (!key) return
      const raw = (r[i] || "").trim()
      if (!raw) return
      if (key === "points" || key === "balance" || key === "invitedCount") {
        const n = Number(raw.replace(/\s/g, "").replace(",", "."))
        if (!Number.isNaN(n)) (obj[key] as number) = n
      } else if (key === "role") {
        const v = raw.toLowerCase()
        if (
          v === "member" ||
          v === "resident" ||
          v === "blogger" ||
          v === "team"
        ) {
          obj.role = v as User["role"]
        } else if (v.includes("команд")) obj.role = "team"
        else if (v.includes("резидент")) obj.role = "resident"
        else if (v.includes("блог")) obj.role = "blogger"
        else obj.role = "member"
      } else {
        ;(obj[key] as string) = raw
      }
    })
    return obj
  })
}

function UsersDatabaseDialog({
  open,
  onClose,
  users,
  onImport,
}: {
  open: boolean
  onClose: () => void
  users: User[]
  onImport: (rows: Partial<User>[], mode: "merge" | "replace") => void
}) {
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge")
  const [preview, setPreview] = useState<Partial<User>[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleExport = () => {
    if (users.length === 0) {
      toast.error("Нет данных для экспорта")
      return
    }
    const csv = buildUsersCsv(users)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mojno-users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Экспортировано ${users.length} участниц`)
  }

  const handleExportTemplate = () => {
    const csv = buildUsersCsv([])
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mojno-template.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Шаблон скачан")
  }

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv") && !file.name.toLowerCase().endsWith(".txt")) {
      toast.error("Подходят файлы CSV (можно сохранить из Excel)")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      const rows = parseCsv(text)
      const parsed = csvRowsToUsers(rows)
      const valid = parsed.filter((p) => p.email && p.firstName)
      if (valid.length === 0) {
        toast.error("Не удалось распознать данные. Проверь заголовки колонок")
        return
      }
      setPreview(valid)
    }
    reader.readAsText(file, "utf-8")
  }

  const handleConfirmImport = () => {
    if (!preview) return
    onImport(preview, importMode)
    setPreview(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-black/5">
          <DialogTitle className="text-base flex items-center gap-2">
            <Icon name="Database" size={15} className="text-pink-600" />
            База данных участниц
          </DialogTitle>
          <DialogDescription className="text-xs">
            Экспортируй текущую базу в CSV или загрузи новых участниц из Excel
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Экспорт */}
          <div className="rounded-2xl border border-black/10 p-4 bg-gradient-to-br from-pink-50/40 to-white">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-pink-100 text-pink-700 flex-shrink-0">
                <Icon name="Download" size={14} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">Экспорт в Excel/CSV</div>
                <div className="text-xs text-black/55 mt-0.5">
                  Скачивается CSV с UTF-8 BOM и разделителем «;» — Excel
                  откроет его сразу, без настроек.
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] uppercase tracking-[0.18em]"
                  >
                    <Icon name="Download" size={12} />
                    Скачать базу ({users.length})
                  </button>
                  <button
                    onClick={handleExportTemplate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/15 hover:bg-black/5 text-black/70 text-[11px] uppercase tracking-[0.18em]"
                  >
                    <Icon name="FileSpreadsheet" size={12} />
                    Шаблон CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Импорт */}
          <div className="rounded-2xl border border-black/10 p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                <Icon name="Upload" size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Импорт из CSV</div>
                <div className="text-xs text-black/55 mt-0.5">
                  В Excel сохрани файл как «CSV UTF-8 (с разделителями-запятыми)
                  *.csv». Заголовки на русском или английском —
                  обязательны минимум «Имя» и «Email».
                </div>

                <div className="mt-3 flex gap-1 p-1 rounded-full bg-black/[0.04] w-fit">
                  {(["merge", "replace"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setImportMode(m)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
                        importMode === m ? "bg-black text-white" : "text-black/60"
                      }`}
                    >
                      {m === "merge" ? "Дополнить" : "Заменить"}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-black/45 mt-1.5">
                  {importMode === "merge"
                    ? "Существующие записи (по email) будут обновлены, новые — добавлены."
                    : "Внимание: все текущие участницы будут удалены и заменены загруженными."}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ""
                    if (f) handleFile(f)
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.18em]"
                >
                  <Icon name="FilePlus" size={12} />
                  Выбрать CSV
                </button>
              </div>
            </div>
          </div>

          {/* Превью импорта */}
          {preview && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Eye" size={14} className="text-emerald-700" />
                <div className="text-sm font-medium text-emerald-800">
                  Найдено записей: {preview.length}
                </div>
              </div>
              <div className="max-h-[180px] overflow-y-auto rounded-lg border border-emerald-200 bg-white">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-emerald-50">
                    <tr>
                      <th className="text-left px-2 py-1.5">Имя</th>
                      <th className="text-left px-2 py-1.5">Email</th>
                      <th className="text-left px-2 py-1.5">Телефон</th>
                      <th className="text-left px-2 py-1.5">Роль</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((p, i) => (
                      <tr key={i} className="border-t border-emerald-100">
                        <td className="px-2 py-1">
                          {p.firstName} {p.lastName || ""}
                        </td>
                        <td className="px-2 py-1 text-black/65">{p.email}</td>
                        <td className="px-2 py-1 text-black/65">{p.phone || "—"}</td>
                        <td className="px-2 py-1 text-black/65">{p.role || "member"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 50 && (
                <div className="text-[11px] text-black/45 mt-1.5">
                  Показаны первые 50 из {preview.length}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setPreview(null)}
                  className="flex-1 px-3 py-2 rounded-full border border-black/15 text-[11px] uppercase tracking-[0.18em] hover:bg-black/5"
                >
                  Отменить
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.18em]"
                >
                  <Icon name="Check" size={12} />
                  Загрузить {preview.length}
                </button>
              </div>
            </div>
          )}

          {/* Поддерживаемые колонки */}
          <details className="rounded-2xl border border-black/10 p-4">
            <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
              <Icon name="Info" size={13} className="text-pink-500" />
              Поддерживаемые колонки
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-black/65">
              {USER_EXPORT_COLUMNS.map((c) => (
                <div key={String(c.key)} className="flex justify-between">
                  <span>{c.label}</span>
                  <span className="text-black/35">{String(c.key)}</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="flex gap-2 px-6 py-3 border-t border-black/5 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
          >
            Закрыть
          </button>
        </div>
      </DialogContent>
    </Dialog>
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
  const [topUpRub, setTopUpRub] = useState("")
  const [topUpPts, setTopUpPts] = useState("")
  const isTeam = user.role === "team"

  const applyTopUpRub = () => {
    const n = Math.max(0, Math.round(Number(topUpRub) || 0))
    if (n <= 0) {
      toast.error("Введи сумму больше нуля")
      return
    }
    onUpdate({ balance: (user.balance || 0) + n })
    setTopUpRub("")
    toast.success(
      `Баланс пополнен на ${n.toLocaleString("ru-RU")} ₽ (тест)`,
      { description: "Это тестовое начисление без подключения платёжной системы." }
    )
    try {
      const inboxKey = `mojno_user_inbox_${user.email}`
      const inboxRaw = localStorage.getItem(inboxKey)
      const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
      const note = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: `Баланс пополнен · +${n.toLocaleString("ru-RU")} ₽`,
        description: "Команда клуба пополнила твой баланс (тестовое начисление).",
        createdAt: new Date().toISOString(),
        read: false,
      }
      localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
    } catch {
      /* ignore */
    }
  }

  const applyTopUpPts = () => {
    const n = Math.max(0, Math.round(Number(topUpPts) || 0))
    if (n <= 0) {
      toast.error("Введи количество баллов больше нуля")
      return
    }
    onUpdate({ points: (user.points || 0) + n })
    setTopUpPts("")
    toast.success(`Начислено ${n.toLocaleString("ru-RU")} баллов (тест)`)
    try {
      const inboxKey = `mojno_user_inbox_${user.email}`
      const inboxRaw = localStorage.getItem(inboxKey)
      const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
      const note = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: `Бонусные баллы · +${n.toLocaleString("ru-RU")}`,
        description: "Команда клуба начислила тебе бонусные баллы.",
        createdAt: new Date().toISOString(),
        read: false,
      }
      localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
    } catch {
      /* ignore */
    }
  }

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

        {/* Тестовое пополнение баланса и баллов */}
        <div className="mt-4 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50/70 via-rose-50/40 to-fuchsia-50/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="FlaskConical" size={14} className="text-pink-600" />
            <div className="text-[11px] uppercase tracking-[0.2em] text-pink-700 font-medium">
              Тестовое пополнение
            </div>
          </div>
          <div className="text-[11px] text-black/55 mb-3">
            Без подключения платёжной системы — для проверки сценариев. Сейчас:{" "}
            <b>{(user.balance || 0).toLocaleString("ru-RU")} ₽</b> ·{" "}
            <b>{(user.points || 0).toLocaleString("ru-RU")} баллов</b>.
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={topUpRub}
                onChange={(e) => setTopUpRub(e.target.value)}
                placeholder="Сумма ₽"
                className="flex-1 px-3 py-2 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="flex gap-1">
                {[500, 1000, 5000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTopUpRub(String(v))}
                    className="px-2.5 py-1 rounded-full border border-black/10 text-[11px] hover:bg-black/5"
                  >
                    +{v}
                  </button>
                ))}
              </div>
              <button
                onClick={applyTopUpRub}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-[0.18em]"
              >
                <Icon name="Wallet" size={12} />
                Пополнить
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={topUpPts}
                onChange={(e) => setTopUpPts(e.target.value)}
                placeholder="Кол-во баллов"
                className="flex-1 px-3 py-2 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="flex gap-1">
                {[100, 500, 1000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTopUpPts(String(v))}
                    className="px-2.5 py-1 rounded-full border border-black/10 text-[11px] hover:bg-black/5"
                  >
                    +{v}
                  </button>
                ))}
              </div>
              <button
                onClick={applyTopUpPts}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.18em]"
              >
                <Icon name="Sparkles" size={12} />
                Начислить
              </button>
            </div>
          </div>
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

interface RegistrationRow {
  email: string
  eventTitle: string
  category: string
  date: string
  registeredAt: string
  status?: "paid" | "pending_admin" | "deposit" | "cancel_pending" | "cancelled"
  role?: string
  amount?: number
  pointsUsed?: number
  cashPaid?: number
  surcharge?: number
  telegram?: string
  cancelReason?: string
  cancelRequestedAt?: string
}

function ResidentRequestRow({
  reg,
  onConfirm,
  onReject,
}: {
  reg: RegistrationRow
  onConfirm: (amount: number) => void
  onReject: () => void
}) {
  const [surcharge, setSurcharge] = useState<string>("")
  const [showInput, setShowInput] = useState(false)

  return (
    <li className="py-3 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white">
          <Icon name="Gem" size={14} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{reg.eventTitle}</div>
          <div className="text-xs text-black/55">
            {reg.email} · {formatDate(reg.date)} · {reg.category}
          </div>
          {reg.telegram && (
            <a
              href={`https://t.me/${reg.telegram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 mt-0.5"
            >
              <Icon name="Send" size={11} />
              {reg.telegram}
            </a>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-1">
          Ожидает
        </span>
        <button
          onClick={onReject}
          className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
          title="Отклонить"
        >
          <Icon name="X" size={14} />
        </button>
      </div>

      {!showInput ? (
        <div className="flex flex-wrap gap-2 pl-12">
          <button
            onClick={() => onConfirm(0)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.18em]"
          >
            <Icon name="Check" size={12} />
            Подтвердить бесплатно
          </button>
          <button
            onClick={() => setShowInput(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-pink-300 text-pink-700 hover:bg-pink-50 text-[11px] uppercase tracking-[0.18em]"
          >
            <Icon name="Wallet" size={12} />
            С доплатой
          </button>
        </div>
      ) : (
        <div className="pl-12 flex flex-wrap items-center gap-2 bg-pink-50/50 border border-pink-100 rounded-xl p-3">
          <div className="flex-1 min-w-[160px]">
            <div className="text-[10px] uppercase tracking-[0.18em] text-pink-700 mb-1">
              Сумма доплаты
            </div>
            <Input
              type="number"
              min={0}
              value={surcharge}
              onChange={(e) => setSurcharge(e.target.value)}
              placeholder="например, 1500"
              className="h-9"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              const amount = Number(surcharge) || 0
              if (amount <= 0) {
                toast.error("Укажи сумму доплаты или подтверди бесплатно")
                return
              }
              onConfirm(amount)
            }}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.18em] mt-4"
          >
            <Icon name="Send" size={12} />
            Отправить
          </button>
          <button
            onClick={() => {
              setShowInput(false)
              setSurcharge("")
            }}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-black/10 text-black/60 hover:bg-black/5 text-[11px] uppercase tracking-[0.18em] mt-4"
          >
            Отмена
          </button>
        </div>
      )}
    </li>
  )
}

function EventsTab() {
  const { categories } = useCategories()
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([])
  const [editing, setEditing] = useState<CustomEvent | null>(null)
  const [creating, setCreating] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [allRegs, setAllRegs] = useState<RegistrationRow[]>([])
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [hiddenBase, setHiddenBase] = useState<string[]>([])
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())

  const categoryMeta = (name: string) =>
    categories.find((c) => c.name === name) || {
      name,
      icon: "CalendarDays",
      color: "from-pink-400 to-rose-500",
    }

  const toggleCategory = (name: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const reloadRegs = () => {
    try {
      const raw = localStorage.getItem("mojno_event_registrations")
      const arr = raw ? JSON.parse(raw) : []
      setAllRegs(Array.isArray(arr) ? arr : [])
    } catch {
      setAllRegs([])
    }
  }

  useEffect(() => {
    setCustomEvents(readCustomEvents())
    setHiddenBase(readHiddenBaseEvents())
    reloadRegs()
  }, [])

  const visibleBaseEvents = useMemo(
    () => EVENTS.filter((e) => !hiddenBase.includes(e.title)),
    [hiddenBase]
  )

  // Объединяем все мероприятия (без деления на «базовые» и «команда добавила»)
  // Кастомные — приоритет (это отредактированные / новые версии)
  const allEvents = useMemo(() => {
    const titles = new Set(customEvents.map((c) => c.title))
    const baseAsCustom: (CustomEvent & { __isBase?: boolean })[] =
      visibleBaseEvents
        .filter((b) => !titles.has(b.title))
        .map((b) => ({ ...b, id: `base:${b.title}`, __isBase: true }))
    const merged: (CustomEvent & { __isBase?: boolean })[] = [
      ...customEvents,
      ...baseAsCustom,
    ]
    merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return merged
  }, [customEvents, visibleBaseEvents])

  // Группировка по категориям
  const eventsByCategory = useMemo(() => {
    const map = new Map<string, (CustomEvent & { __isBase?: boolean })[]>()
    allEvents.forEach((e) => {
      const arr = map.get(e.category) || []
      arr.push(e)
      map.set(e.category, arr)
    })
    return map
  }, [allEvents])

  const registrationsByTitle = useMemo(() => {
    const map = new Map<string, number>()
    allRegs.forEach((r) => {
      if (r.eventTitle) map.set(r.eventTitle, (map.get(r.eventTitle) || 0) + 1)
    })
    return map
  }, [allRegs])

  const registrationsListByTitle = useMemo(() => {
    const map = new Map<string, RegistrationRow[]>()
    allRegs.forEach((r) => {
      if (!r.eventTitle) return
      const arr = map.get(r.eventTitle) || []
      arr.push(r)
      map.set(r.eventTitle, arr)
    })
    return map
  }, [allRegs])

  const roleVisual = (role?: string) => {
    const r = role || "member"
    if (r === "team")
      return {
        icon: "Crown",
        label: "Команда",
        chip: "bg-gradient-to-r from-amber-400 via-pink-500 to-fuchsia-500 text-white border-transparent",
        row: "bg-gradient-to-r from-amber-50 via-pink-50 to-fuchsia-50 border-pink-200",
      }
    if (r === "blogger")
      return {
        icon: "Camera",
        label: "Блогер",
        chip: "bg-pink-100 text-pink-700 border-pink-200",
        row: "bg-pink-50/60 border-pink-100",
      }
    if (r === "resident")
      return {
        icon: "Gem",
        label: "Резидент",
        chip: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
        row: "bg-fuchsia-50/60 border-fuchsia-100",
      }
    return {
      icon: "Heart",
      label: "Участница",
      chip: "bg-rose-50 text-rose-600 border-rose-100",
      row: "bg-white border-black/5",
    }
  }

  const statusVisual = (s?: string) => {
    if (s === "paid")
      return { label: "Оплачено", className: "bg-emerald-100 text-emerald-700 border-emerald-200" }
    if (s === "pending_admin")
      return { label: "Ждёт админа", className: "bg-amber-100 text-amber-700 border-amber-200" }
    if (s === "deposit")
      return { label: "С депозита", className: "bg-pink-100 text-pink-700 border-pink-200" }
    if (s === "cancel_pending")
      return { label: "Отмена в обработке", className: "bg-orange-100 text-orange-700 border-orange-200" }
    if (s === "cancelled")
      return { label: "Отменено", className: "bg-stone-100 text-stone-600 border-stone-200" }
    return { label: "—", className: "bg-stone-100 text-stone-600 border-stone-200" }
  }

  const renderParticipants = (eventTitle: string) => {
    const list = (registrationsListByTitle.get(eventTitle) || []).slice().sort(
      (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
    )
    if (list.length === 0) {
      return (
        <div className="rounded-xl bg-black/[0.02] border border-dashed border-black/10 px-4 py-6 text-center text-xs text-black/45">
          На это мероприятие ещё никто не записался
        </div>
      )
    }
    return (
      <ul className="space-y-1.5">
        {list.map((r, i) => {
          const rv = roleVisual(r.role)
          const sv = statusVisual(r.status)
          return (
            <li
              key={`${r.email}-${r.registeredAt}-${i}`}
              className={`flex items-center gap-2.5 flex-wrap rounded-xl border px-3 py-2 ${rv.row}`}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/70 border border-white text-black/70 flex-shrink-0">
                <Icon name={rv.icon} size={12} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{r.email}</div>
                <div className="text-[10px] text-black/55 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>записалась {formatDateTime(r.registeredAt)}</span>
                  {r.telegram && (
                    <span className="inline-flex items-center gap-0.5">
                      <Icon name="Send" size={10} />
                      {r.telegram}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-[9px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 border ${rv.chip}`}
              >
                {rv.label}
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 border ${sv.className}`}
              >
                {sv.label}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  const pendingResident = useMemo(
    () => allRegs.filter((r) => r.status === "pending_admin"),
    [allRegs]
  )

  const confirmResident = (idx: number, surcharge: number) => {
    const next = [...allRegs]
    const reg = next[idx]
    next[idx] = { ...reg, status: "paid", surcharge: surcharge > 0 ? surcharge : 0 }
    setAllRegs(next)
    localStorage.setItem("mojno_event_registrations", JSON.stringify(next))

    // Персональное уведомление резиденту
    try {
      const inboxKey = `mojno_user_inbox_${reg.email}`
      const inboxRaw = localStorage.getItem(inboxKey)
      const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
      const note = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title:
          surcharge > 0
            ? `Запись подтверждена · доплата ${surcharge.toLocaleString("ru-RU")} ₽`
            : "Запись подтверждена · бесплатно",
        description:
          surcharge > 0
            ? `«${reg.eventTitle}»: администратор подтвердил твою запись. Доплата — ${surcharge.toLocaleString("ru-RU")} ₽. Реквизиты пришлём в Telegram.`
            : `«${reg.eventTitle}»: администратор подтвердил твою запись. Для тебя как резидента — бесплатно.`,
        createdAt: new Date().toISOString(),
        read: false,
        eventTitle: reg.eventTitle,
        eventDate: reg.date,
      }
      localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
    } catch {
      /* ignore */
    }

    toast.success(
      surcharge > 0
        ? `Подтверждено · резиденту отправлена доплата ${surcharge.toLocaleString("ru-RU")} ₽`
        : "Подтверждено бесплатно · уведомление отправлено резиденту"
    )
  }

  const removeReg = (idx: number) => {
    if (!window.confirm("Удалить заявку?")) return
    const next = allRegs.filter((_, i) => i !== idx)
    setAllRegs(next)
    localStorage.setItem("mojno_event_registrations", JSON.stringify(next))
    toast.success("Заявка удалена")
  }

  const sendGroupLink = (event: CustomEvent) => {
    if (!event.groupLink) {
      toast.error("Сначала добавь ссылку на Telegram-группу в карточке мероприятия")
      return
    }
    // Кому отправляем — все записанные на это мероприятие со статусом paid/deposit/pending_admin
    const recipients = allRegs.filter(
      (r) => r.eventTitle === event.title && r.status !== undefined
    )
    if (recipients.length === 0) {
      toast.error("На это мероприятие пока никто не записан")
      return
    }
    // Создаём персональное уведомление каждой записанной
    let sent = 0
    recipients.forEach((r) => {
      try {
        const inboxKey = `mojno_user_inbox_${r.email}`
        const inboxRaw = localStorage.getItem(inboxKey)
        const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
        const note = {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: `Ссылка на группу · ${event.title}`,
          description: `Закрытая Telegram-группа мероприятия «${event.title}» (${formatDate(event.date)} в ${event.time}): ${event.groupLink}`,
          createdAt: new Date().toISOString(),
          read: false,
          eventTitle: event.title,
          eventDate: event.date,
          link: event.groupLink,
        }
        localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
        sent++
      } catch {
        /* ignore */
      }
    })
    toast.success(`Ссылка отправлена · ${sent} ${sent === 1 ? "получатель" : "получателей"}`, {
      description: `Появится в их уведомлениях при следующем входе.`,
    })
  }

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
      // Если редактируем базовое — скрываем оригинал
      const wasBase = EVENTS.some((b) => b.title === editing?.title)
      if (wasBase && editing) {
        const nextHidden = hiddenBase.includes(editing.title)
          ? hiddenBase
          : [...hiddenBase, editing.title]
        writeHiddenBaseEvents(nextHidden)
        setHiddenBase(nextHidden)
      }
      persist([ev, ...customEvents])
      toast.success(
        editing && EVENTS.some((b) => b.title === editing.title)
          ? "Мероприятие обновлено"
          : "Мероприятие создано"
      )
    }
    setEditing(null)
    setCreating(false)
  }

  const remove = (id: string) => {
    if (!window.confirm("Удалить мероприятие?")) return
    persist(customEvents.filter((e) => e.id !== id))
    toast.success("Удалено")
  }

  const editBaseEvent = (e: ClubEvent) => {
    // Конвертируем базовое в редактируемое
    setEditing({
      ...e,
      id: `ce-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    })
  }

  const removeBaseEvent = (title: string) => {
    if (!window.confirm("Удалить базовое мероприятие? Оно исчезнет из календаря."))
      return
    const next = [...hiddenBase, title]
    writeHiddenBaseEvents(next)
    setHiddenBase(next)
    toast.success("Мероприятие удалено")
  }

  const restoreBaseEvent = (title: string) => {
    const next = hiddenBase.filter((t) => t !== title)
    writeHiddenBaseEvents(next)
    setHiddenBase(next)
    toast.success("Мероприятие восстановлено")
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

      {pendingResident.length > 0 && (
        <Panel title={`Заявки резидентов на подтверждение · ${pendingResident.length}`} icon="ShieldCheck">
          <ul className="divide-y divide-black/5">
            {allRegs.map((r, idx) => {
              if (r.status !== "pending_admin") return null
              return (
                <ResidentRequestRow
                  key={`${r.email}-${idx}`}
                  reg={r}
                  onConfirm={(amount) => confirmResident(idx, amount)}
                  onReject={() => removeReg(idx)}
                />
              )
            })}
          </ul>
          <div className="text-xs text-black/45 px-2 pt-2">
            Подтверждай записи резидентов и уточняй доплату при необходимости.
          </div>
        </Panel>
      )}

      <Panel title={`Все мероприятия · ${allEvents.length}`} icon="CalendarDays">
        {allEvents.length === 0 ? (
          <div className="rounded-xl bg-black/[0.02] border border-dashed border-black/10 px-4 py-8 text-center text-xs text-black/45">
            Мероприятий пока нет — нажми «Создать», чтобы добавить первое
          </div>
        ) : (
          <div className="space-y-3">
            {[...eventsByCategory.entries()]
              .sort((a, b) => a[0].localeCompare(b[0], "ru"))
              .map(([catName, list]) => {
                const meta = categoryMeta(catName)
                const isCollapsed = collapsedCats.has(catName)
                return (
                  <div
                    key={catName}
                    className="rounded-2xl border border-black/5 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(catName)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 bg-black/[0.02] hover:bg-black/[0.04] transition-colors"
                    >
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${meta.color} text-white flex-shrink-0`}
                      >
                        <Icon name={meta.icon} size={13} />
                      </span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{catName}</div>
                        <div className="text-[11px] text-black/50">
                          {list.length} {list.length === 1 ? "мероприятие" : "мероприятий"}
                        </div>
                      </div>
                      <Icon
                        name={isCollapsed ? "ChevronDown" : "ChevronUp"}
                        size={14}
                        className="text-black/40"
                      />
                    </button>
                    {!isCollapsed && (
                      <ul className="divide-y divide-black/5">
                        {list.map((e) => {
                          const isOpen = expandedEvent === e.title
                          const count = registrationsByTitle.get(e.title) || 0
                          const onEditClick = () => {
                            if (e.__isBase) {
                              const orig = EVENTS.find((b) => b.title === e.title)
                              if (orig) editBaseEvent(orig)
                            } else {
                              const ce = customEvents.find((c) => c.id === e.id)
                              if (ce) setEditing(ce)
                            }
                          }
                          const onRemoveClick = () => {
                            if (e.__isBase) removeBaseEvent(e.title)
                            else remove(e.id)
                          }
                          const sendIfCustom = () => {
                            if (e.__isBase) {
                              toast.error(
                                "Сначала добавь ссылку на Telegram-группу — нажми редактировать"
                              )
                              return
                            }
                            const ce = customEvents.find((c) => c.id === e.id)
                            if (ce) sendGroupLink(ce)
                          }
                          return (
                            <li key={e.id} className="px-4 py-2.5">
                              <div className="flex items-center gap-3 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedEvent(isOpen ? null : e.title)
                                  }
                                  className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-xl hover:bg-black/[0.03] -mx-2 px-2 py-1 transition-colors"
                                >
                                  {e.image ? (
                                    <img
                                      src={e.image}
                                      alt={e.title}
                                      className="w-10 h-10 rounded-xl object-cover border border-black/10 flex-shrink-0"
                                    />
                                  ) : (
                                    <span
                                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} text-white flex-shrink-0`}
                                    >
                                      <Icon name={meta.icon} size={14} />
                                    </span>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate flex items-center gap-1.5">
                                      {e.title}
                                      <Icon
                                        name={isOpen ? "ChevronUp" : "ChevronDown"}
                                        size={14}
                                        className="text-black/40 flex-shrink-0"
                                      />
                                    </div>
                                    <div className="text-xs text-black/55">
                                      {formatDate(e.date)} · {e.time} · {e.location}
                                    </div>
                                  </div>
                                  <div className="text-xs text-black/55 flex-shrink-0">
                                    Записано: <b className="text-black/80">{count}</b>
                                    {e.capacity && e.capacity > 0 && (
                                      <span className="text-black/40">
                                        {" "}
                                        / {e.capacity}
                                      </span>
                                    )}
                                  </div>
                                </button>
                                <button
                                  onClick={sendIfCustom}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em] transition-colors ${
                                    !e.__isBase && e.groupLink
                                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                                      : "border border-black/10 text-black/40 hover:bg-black/5"
                                  }`}
                                  title={
                                    !e.__isBase && e.groupLink
                                      ? "Отправить ссылку на Telegram-группу"
                                      : "Сначала добавь ссылку через редактирование"
                                  }
                                >
                                  <Icon name="Send" size={12} />
                                  Отправить ссылку
                                </button>
                                <button
                                  onClick={onEditClick}
                                  className="p-2 rounded-full hover:bg-black/5"
                                  title="Редактировать"
                                >
                                  <Icon name="Pencil" size={14} />
                                </button>
                                <button
                                  onClick={onRemoveClick}
                                  className="p-2 rounded-full hover:bg-red-50 text-red-500"
                                  title="Удалить"
                                >
                                  <Icon name="Trash2" size={14} />
                                </button>
                              </div>
                              {isOpen && (
                                <div className="mt-3 pl-12">
                                  {renderParticipants(e.title)}
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </Panel>

      {hiddenBase.length > 0 && (
        <Panel title={`Скрытые мероприятия · ${hiddenBase.length}`} icon="EyeOff">
          <ul className="divide-y divide-black/5">
            {hiddenBase.map((title) => {
              const orig = EVENTS.find((e) => e.title === title)
              return (
                <li
                  key={title}
                  className="py-2.5 flex items-center gap-3 flex-wrap"
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-400 flex-shrink-0">
                    <Icon name="EyeOff" size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black/65 truncate line-through">
                      {title}
                    </div>
                    {orig && (
                      <div className="text-xs text-black/45">
                        {formatDate(orig.date)} · {orig.time} · {orig.location}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => restoreBaseEvent(title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5 text-[11px] uppercase tracking-[0.18em]"
                  >
                    <Icon name="RotateCcw" size={12} />
                    Восстановить
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="text-xs text-black/45 px-2 pt-2">
            Эти мероприятия не показываются участницам в календаре. После
            редактирования оригинал скрывается, а новая версия попадает в
            общий список и доступна для дальнейших правок.
          </div>
        </Panel>
      )}

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

/* ───────── All Registrations ───────── */

type StatusFilter = "all" | "paid" | "pending_admin" | "deposit" | "cancel_pending" | "cancelled"

const STATUS_FILTERS: { id: StatusFilter; label: string; color: string; icon: string }[] = [
  { id: "all", label: "Все", color: "bg-black text-white", icon: "List" },
  { id: "pending_admin", label: "Ожидают админа", color: "bg-amber-100 text-amber-700 border border-amber-200", icon: "Clock" },
  { id: "paid", label: "Оплачено", color: "bg-emerald-100 text-emerald-700 border border-emerald-200", icon: "CheckCircle2" },
  { id: "deposit", label: "С депозита", color: "bg-pink-100 text-pink-700 border border-pink-200", icon: "Wallet" },
  { id: "cancel_pending", label: "Отмена в обработке", color: "bg-orange-100 text-orange-700 border border-orange-200", icon: "X" },
  { id: "cancelled", label: "Отменено", color: "bg-stone-100 text-stone-600 border border-stone-200", icon: "XCircle" },
]

const ROLE_FILTERS: { id: "all" | "member" | "resident" | "blogger" | "team"; label: string; icon: string }[] = [
  { id: "all", label: "Все статусы", icon: "Users" },
  { id: "member", label: "Участницы", icon: "Heart" },
  { id: "resident", label: "Резиденты", icon: "Gem" },
  { id: "blogger", label: "Блогеры", icon: "Camera" },
  { id: "team", label: "Команда", icon: "Crown" },
]

function SendGroupLinkRow({
  title,
  date,
  count,
  initialLink,
  onSend,
}: {
  title: string
  date: string
  count: number
  initialLink: string
  onSend: (link: string) => void
}) {
  const [link, setLink] = useState(initialLink)
  const [editing, setEditing] = useState(false)

  return (
    <li className="py-3 flex items-start gap-3 flex-wrap">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-sky-500 text-white flex-shrink-0">
        <Icon name="Send" size={14} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-black/55">
          {formatDate(date)} · {count} {count === 1 ? "получатель" : "получателей"}
        </div>
        {!editing && link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 mt-0.5 break-all"
          >
            <Icon name="Link" size={11} />
            {link}
          </a>
        )}
        {editing && (
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://t.me/+..."
            className="h-8 mt-1.5"
            autoFocus
          />
        )}
      </div>
      {!editing ? (
        <>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5 text-[11px] uppercase tracking-[0.18em]"
            title="Изменить ссылку"
          >
            <Icon name="Pencil" size={12} />
            {link ? "Изменить" : "Добавить"}
          </button>
          <button
            onClick={() => onSend(link)}
            disabled={!link.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] uppercase tracking-[0.18em]"
          >
            <Icon name="Send" size={12} />
            Отправить ссылку
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              onSend(link)
              setEditing(false)
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[11px] uppercase tracking-[0.18em]"
          >
            <Icon name="Send" size={12} />
            Сохранить и отправить
          </button>
          <button
            onClick={() => {
              setLink(initialLink)
              setEditing(false)
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5 text-[11px] uppercase tracking-[0.18em]"
          >
            Отмена
          </button>
        </>
      )}
    </li>
  )
}

function RegistrationsTab() {
  const [allRegs, setAllRegs] = useState<RegistrationRow[]>([])
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [roleFilter, setRoleFilter] = useState<"all" | "member" | "resident" | "blogger" | "team">("all")
  const [search, setSearch] = useState("")

  const reload = () => {
    try {
      const raw = localStorage.getItem("mojno_event_registrations")
      const arr = raw ? JSON.parse(raw) : []
      setAllRegs(Array.isArray(arr) ? arr : [])
    } catch {
      setAllRegs([])
    }
    setCustomEvents(readCustomEvents())
  }

  useEffect(() => {
    reload()
  }, [])

  // Группировка заявок по мероприятиям для быстрых действий
  const eventGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        title: string
        date: string
        groupLink?: string
        recipients: RegistrationRow[]
      }
    >()
    allRegs.forEach((r) => {
      const key = r.eventTitle
      if (!map.has(key)) {
        const ce = customEvents.find((c) => c.title === r.eventTitle)
        const ev = EVENTS.find((c) => c.title === r.eventTitle)
        map.set(key, {
          title: r.eventTitle,
          date: r.date,
          groupLink: ce?.groupLink || ev?.groupLink,
          recipients: [],
        })
      }
      map.get(key)!.recipients.push(r)
    })
    return [...map.values()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [allRegs, customEvents])

  const sendGroupLinkFor = (eventTitle: string, eventDate: string, link: string) => {
    const trimmed = link.trim()
    if (!trimmed) {
      toast.error("Укажи ссылку на Telegram-группу")
      return
    }
    const recipients = allRegs.filter((r) => r.eventTitle === eventTitle)
    if (recipients.length === 0) {
      toast.error("Нет получателей")
      return
    }
    let sent = 0
    recipients.forEach((r) => {
      try {
        const inboxKey = `mojno_user_inbox_${r.email}`
        const inboxRaw = localStorage.getItem(inboxKey)
        const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
        const note = {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: `Ссылка на группу · ${eventTitle}`,
          description: `Закрытая Telegram-группа мероприятия «${eventTitle}» (${formatDate(eventDate)}): ${trimmed}`,
          createdAt: new Date().toISOString(),
          read: false,
          eventTitle,
          eventDate,
          link: trimmed,
        }
        localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
        sent++
      } catch {
        /* ignore */
      }
    })

    // Сохраним ссылку в кастомное мероприятие, если оно наше
    const ceIdx = customEvents.findIndex((c) => c.title === eventTitle)
    if (ceIdx >= 0 && customEvents[ceIdx].groupLink !== trimmed) {
      const next = [...customEvents]
      next[ceIdx] = { ...next[ceIdx], groupLink: trimmed }
      writeCustomEvents(next)
      setCustomEvents(next)
    }

    toast.success(
      `Ссылка отправлена · ${sent} ${sent === 1 ? "получатель" : "получателей"}`,
      { description: "Появится в их уведомлениях." }
    )
  }

  const cancelRequests = useMemo(
    () => allRegs.filter((r) => r.status === "cancel_pending"),
    [allRegs]
  )

  const approveCancel = (target: RegistrationRow) => {
    const refund =
      (target.cashPaid || 0) + (target.pointsUsed || 0) || target.amount || 0
    if (refund <= 0) {
      // Просто пометим как отменённое
    }
    // Обновим запись
    const next = allRegs.map((r) =>
      r.email === target.email &&
      r.eventTitle === target.eventTitle &&
      r.registeredAt === target.registeredAt
        ? { ...r, status: "cancelled" as const }
        : r
    )
    setAllRegs(next)
    localStorage.setItem("mojno_event_registrations", JSON.stringify(next))

    // Начислим баллы пользователю в mojno_users
    if (refund > 0) {
      try {
        const usersRaw = localStorage.getItem("mojno_users")
        const users = usersRaw ? JSON.parse(usersRaw) : []
        if (Array.isArray(users)) {
          const idx = users.findIndex(
            (u: { email?: string }) => u.email === target.email
          )
          if (idx >= 0) {
            users[idx] = {
              ...users[idx],
              points: (users[idx].points || 0) + refund,
            }
            localStorage.setItem("mojno_users", JSON.stringify(users))
          }
        }
      } catch {
        /* ignore */
      }
    }

    // Уведомление пользователю
    try {
      const inboxKey = `mojno_user_inbox_${target.email}`
      const inboxRaw = localStorage.getItem(inboxKey)
      const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
      const note = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title:
          refund > 0
            ? `Отмена подтверждена · возврат ${refund.toLocaleString("ru-RU")} баллов`
            : "Отмена подтверждена",
        description:
          refund > 0
            ? `Запись на «${target.eventTitle}» отменена. На твой счёт зачислено ${refund.toLocaleString("ru-RU")} бонусных баллов — потрать их на следующие мероприятия.`
            : `Запись на «${target.eventTitle}» отменена.`,
        createdAt: new Date().toISOString(),
        read: false,
        eventTitle: target.eventTitle,
        eventDate: target.date,
      }
      localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
    } catch {
      /* ignore */
    }

    toast.success(
      refund > 0
        ? `Отмена подтверждена · участнице возвращено ${refund.toLocaleString("ru-RU")} баллов`
        : "Отмена подтверждена"
    )
  }

  const rejectCancel = (target: RegistrationRow) => {
    if (!window.confirm("Отклонить запрос на отмену? Запись останется активной.")) return
    // Возвращаем статус к paid (или прежнему — здесь упрощённо к paid)
    const prevStatus: RegistrationRow["status"] =
      target.role === "blogger" ? "deposit" : target.role === "resident" ? "paid" : "paid"
    const next = allRegs.map((r) =>
      r.email === target.email &&
      r.eventTitle === target.eventTitle &&
      r.registeredAt === target.registeredAt
        ? { ...r, status: prevStatus, cancelReason: undefined, cancelRequestedAt: undefined }
        : r
    )
    setAllRegs(next)
    localStorage.setItem("mojno_event_registrations", JSON.stringify(next))

    try {
      const inboxKey = `mojno_user_inbox_${target.email}`
      const inboxRaw = localStorage.getItem(inboxKey)
      const inbox = inboxRaw ? JSON.parse(inboxRaw) : []
      const note = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: "Запрос на отмену отклонён",
        description: `Запись на «${target.eventTitle}» осталась активной. Свяжись с администратором, если есть вопросы.`,
        createdAt: new Date().toISOString(),
        read: false,
        eventTitle: target.eventTitle,
        eventDate: target.date,
      }
      localStorage.setItem(inboxKey, JSON.stringify([note, ...inbox]))
    } catch {
      /* ignore */
    }

    toast.success("Запрос на отмену отклонён")
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...allRegs]
      .filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false
        if (roleFilter !== "all" && (r.role || "member") !== roleFilter) return false
        if (q) {
          const hay = `${r.eventTitle} ${r.email} ${r.category}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
  }, [allRegs, statusFilter, roleFilter, search])

  const counts = useMemo(() => {
    const total = allRegs.length
    const pending = allRegs.filter((r) => r.status === "pending_admin").length
    const paid = allRegs.filter((r) => r.status === "paid").length
    const deposit = allRegs.filter((r) => r.status === "deposit").length
    const cancelPending = allRegs.filter((r) => r.status === "cancel_pending").length
    const surchargeSum = allRegs.reduce((s, r) => s + (r.surcharge || 0), 0)
    return { total, pending, paid, deposit, cancelPending, surchargeSum }
  }, [allRegs])

  const removeReg = (target: RegistrationRow) => {
    if (!window.confirm("Удалить заявку?")) return
    const next = allRegs.filter(
      (r) => !(r.email === target.email && r.eventTitle === target.eventTitle && r.registeredAt === target.registeredAt)
    )
    setAllRegs(next)
    localStorage.setItem("mojno_event_registrations", JSON.stringify(next))
    toast.success("Заявка удалена")
  }

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Нет данных для экспорта")
      return
    }
    const rows = [
      ["Дата записи", "Email", "Telegram", "Роль", "Мероприятие", "Категория", "Дата мероприятия", "Статус", "Сумма", "Доплата"],
      ...filtered.map((r) => [
        new Date(r.registeredAt).toLocaleString("ru-RU"),
        r.email,
        r.telegram || "",
        r.role || "member",
        r.eventTitle,
        r.category,
        r.date,
        r.status || "",
        String(r.amount ?? ""),
        String(r.surcharge ?? ""),
      ]),
    ]
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registrations-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Файл выгружен")
  }

  const roleBadge = (role?: string) => {
    const r = role || "member"
    if (r === "team") return { icon: "Crown", color: "from-amber-400 via-pink-500 to-fuchsia-500", label: "Команда" }
    if (r === "blogger") return { icon: "Camera", color: "from-amber-400 via-pink-500 to-fuchsia-500", label: "Блогер" }
    if (r === "resident") return { icon: "Gem", color: "from-fuchsia-500 to-purple-600", label: "Резидент" }
    return { icon: "Heart", color: "from-pink-400 to-rose-500", label: "Участница" }
  }

  const statusMeta = (s?: string) => {
    if (s === "pending_admin") return { label: "Ожидает админа", className: "bg-amber-100 text-amber-700 border-amber-200" }
    if (s === "paid") return { label: "Оплачено", className: "bg-emerald-100 text-emerald-700 border-emerald-200" }
    if (s === "deposit") return { label: "С депозита", className: "bg-pink-100 text-pink-700 border-pink-200" }
    if (s === "cancel_pending") return { label: "Отмена в обработке", className: "bg-orange-100 text-orange-700 border-orange-200" }
    if (s === "cancelled") return { label: "Отменено", className: "bg-stone-100 text-stone-600 border-stone-200" }
    return { label: "—", className: "bg-stone-100 text-stone-600 border-stone-200" }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
            Все заявки на мероприятия
          </h2>
          <p className="text-xs text-black/55 mt-0.5">
            История записей участниц, резидентов, блогеров и команды
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 text-xs uppercase tracking-[0.2em]"
          >
            <Icon name="RefreshCw" size={14} />
            Обновить
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.2em]"
          >
            <Icon name="Download" size={14} />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard icon="ClipboardList" value={counts.total} label="Всего заявок" />
        <MetricCard icon="Clock" value={counts.pending} label="Ожидают админа" />
        <MetricCard icon="CheckCircle2" value={counts.paid} label="Подтверждено" />
        <MetricCard icon="X" value={counts.cancelPending} label="Запросы отмены" />
        <MetricCard
          icon="Wallet"
          value={`${counts.surchargeSum.toLocaleString("ru-RU")} ₽`}
          label="Сумма доплат"
        />
      </div>

      {/* Запросы на отмену */}
      {cancelRequests.length > 0 && (
        <Panel
          title={`Запросы на отмену · ${cancelRequests.length}`}
          icon="XCircle"
        >
          <ul className="divide-y divide-black/5">
            {cancelRequests.map((r, i) => {
              const refund =
                (r.cashPaid || 0) + (r.pointsUsed || 0) || r.amount || 0
              return (
                <li
                  key={`${r.email}-${r.registeredAt}-${i}`}
                  className="py-3 flex items-start gap-3 flex-wrap"
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 text-white flex-shrink-0">
                    <Icon name="X" size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {r.eventTitle}
                    </div>
                    <div className="text-xs text-black/55 mt-0.5">
                      {r.email} · {formatDate(r.date)} · {r.category}
                    </div>
                    <div className="text-[11px] text-black/45 mt-0.5">
                      Запрос:{" "}
                      {r.cancelRequestedAt
                        ? formatDateTime(r.cancelRequestedAt)
                        : "—"}
                      {refund > 0 && (
                        <>
                          {" · К возврату: "}
                          <b>{refund.toLocaleString("ru-RU")} баллов</b>
                        </>
                      )}
                    </div>
                    {r.cancelReason && (
                      <div className="mt-2 text-[12px] text-black/75 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 italic">
                        «{r.cancelReason}»
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => approveCancel(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.18em]"
                    >
                      <Icon name="Check" size={12} />
                      Подтвердить и вернуть баллами
                    </button>
                    <button
                      onClick={() => rejectCancel(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/15 hover:bg-black/5 text-black/65 text-[11px] uppercase tracking-[0.18em]"
                    >
                      <Icon name="RotateCcw" size={12} />
                      Отклонить
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="text-xs text-black/45 px-2 pt-2">
            При подтверждении сумма возвращается участнице бонусными баллами и
            ей приходит уведомление.
          </div>
        </Panel>
      )}

      {/* Быстрые действия — рассылка ссылки на группу */}
      {eventGroups.length > 0 && (
        <Panel title="Быстрые действия · ссылки на Telegram-группы" icon="Send">
          <ul className="divide-y divide-black/5">
            {eventGroups.map((g) => (
              <SendGroupLinkRow
                key={g.title}
                title={g.title}
                date={g.date}
                count={g.recipients.length}
                initialLink={g.groupLink || ""}
                onSend={(link) => sendGroupLinkFor(g.title, g.date, link)}
              />
            ))}
          </ul>
          <div className="text-xs text-black/45 px-2 pt-2">
            Ссылка отправляется всем записанным на мероприятие — попадает в их личные
            уведомления при следующем входе.
          </div>
        </Panel>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-black/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="Search" size={16} className="text-black/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по email, мероприятию или категории"
            className="h-9"
          />
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1.5">Статус</div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em] transition-all ${
                    active ? f.color + " shadow-sm" : "bg-white border border-black/10 text-black/65 hover:border-black/30"
                  }`}
                >
                  <Icon name={f.icon} size={12} />
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1.5">Тип пользователя</div>
          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((f) => {
              const active = roleFilter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setRoleFilter(f.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em] transition-all ${
                    active
                      ? "bg-black text-white shadow-sm"
                      : "bg-white border border-black/10 text-black/65 hover:border-black/30"
                  }`}
                >
                  <Icon name={f.icon} size={12} />
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-10 text-center text-black/55">
          <Icon name="Inbox" size={32} className="mx-auto text-black/20 mb-2" />
          <div className="text-sm">Заявок по выбранным фильтрам нет</div>
        </div>
      ) : (
        <Panel title={`Найдено: ${filtered.length}`} icon="ClipboardList">
          <ul className="divide-y divide-black/5">
            {filtered.map((r) => {
              const rb = roleBadge(r.role)
              const sm = statusMeta(r.status)
              return (
                <li
                  key={`${r.email}-${r.registeredAt}-${r.eventTitle}`}
                  className="py-3 flex items-start gap-3 flex-wrap"
                >
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${rb.color} text-white flex-shrink-0`}
                    title={rb.label}
                  >
                    <Icon name={rb.icon} size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-medium truncate">{r.eventTitle}</div>
                      <span
                        className={`text-[10px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 border ${sm.className}`}
                      >
                        {sm.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 bg-black/5 text-black/65">
                        {rb.label}
                      </span>
                    </div>
                    <div className="text-xs text-black/55 mt-0.5">
                      {r.email} · {r.category} · {formatDate(r.date)}
                    </div>
                    {r.telegram && (
                      <a
                        href={`https://t.me/${r.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 mt-0.5"
                      >
                        <Icon name="Send" size={11} />
                        {r.telegram}
                      </a>
                    )}
                    <div className="text-[11px] text-black/45 mt-0.5">
                      Записан: {formatDateTime(r.registeredAt)}
                      {typeof r.amount === "number" && r.amount > 0 && (
                        <> · Сумма: {r.amount.toLocaleString("ru-RU")} ₽</>
                      )}
                      {typeof r.surcharge === "number" && r.surcharge > 0 && (
                        <> · Доплата: {r.surcharge.toLocaleString("ru-RU")} ₽</>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeReg(r)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-500 flex-shrink-0"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </li>
              )
            })}
          </ul>
        </Panel>
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
  const [capacity, setCapacity] = useState<string>(
    initial?.capacity ? String(initial.capacity) : ""
  )
  const [speaker, setSpeaker] = useState(initial?.speaker || "")
  const [groupLink, setGroupLink] = useState(initial?.groupLink || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [image, setImage] = useState<string | undefined>(initial?.image)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Подойдёт только изображение")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Слишком большой файл — выбери изображение до 5 МБ")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const reCropImage = () => {
    if (!image) return
    setCropSrc(image)
  }

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
      capacity: Number(capacity) > 0 ? Number(capacity) : undefined,
      speaker: speaker || undefined,
      groupLink: groupLink.trim() || undefined,
      description,
      image,
    }
    onSave(item)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-black/5 flex-shrink-0">
          <DialogTitle className="text-base">
            {initial ? "Редактировать мероприятие" : "Новое мероприятие"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Заполни информацию о встрече
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={submit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Иконка-фото */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 border border-pink-200 flex-shrink-0 flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt="Иконка"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon name="ImageOff" size={20} className="text-pink-400/70" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Label className="flex items-center gap-1.5 text-[11px]">
                <Icon name="ImagePlus" size={12} className="text-pink-500" />
                Иконка мероприятия (фото)
              </Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 hover:bg-pink-100 text-pink-700 text-[10px] uppercase tracking-[0.18em] cursor-pointer">
                  <Icon name="Upload" size={11} />
                  {image ? "Заменить" : "Загрузить"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={reCropImage}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/10 hover:bg-black/5 text-black/70 text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Icon name="Crop" size={11} />
                    Кадрировать
                  </button>
                )}
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5 text-black/55 text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Icon name="X" size={11} />
                    Убрать
                  </button>
                )}
              </div>
            </div>
          </div>

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
            <Label className="flex items-center gap-1.5">
              <Icon name="Users" size={13} className="text-pink-500" />
              Максимум участниц
              <span className="text-black/40 text-[11px] font-normal">
                — оставь пустым, если без лимита
              </span>
            </Label>
            <Input
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="например, 12"
            />
          </div>

          <div className="space-y-1">
            <Label>Спикер</Label>
            <Input value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-1.5">
              <Icon name="Send" size={13} className="text-sky-500" />
              Ссылка на Telegram-группу
              <span className="text-black/40 text-[11px] font-normal">
                — отправляется участницам за день
              </span>
            </Label>
            <Input
              type="url"
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
              placeholder="https://t.me/+..."
            />
          </div>

          <div className="space-y-1">
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          </div>

          <div className="flex gap-2 px-6 py-3 border-t border-black/5 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
            >
              <Icon name={initial ? "Save" : "Plus"} size={13} />
              {initial ? "Сохранить редактирование" : "Создать мероприятие"}
            </button>
          </div>
        </form>
      </DialogContent>

      <ImageCropper
        open={!!cropSrc}
        src={cropSrc}
        onCancel={() => setCropSrc(null)}
        onCrop={(dataUrl) => {
          setImage(dataUrl)
          setCropSrc(null)
        }}
      />
    </Dialog>
  )
}

/* ───────── Promotions ───────── */

interface PromoLogEntry {
  id: string
  email: string
  userName?: string
  type: "purchase" | "renewal"
  amount: number
  days: number
  activatedAt: string
  expiresAt: string
  promotionId?: string
  promotionTitle?: string
}

const readPromoLog = (): PromoLogEntry[] => {
  try {
    const raw = localStorage.getItem("mojno_promo_residency_log")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function PromotionsTab() {
  const {
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
  } = usePromotions()
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [creating, setCreating] = useState(false)
  const [log, setLog] = useState<PromoLogEntry[]>([])
  const [logRefresh, setLogRefresh] = useState(0)

  useEffect(() => {
    setLog(readPromoLog())
  }, [logRefresh])

  const stats = useMemo(() => {
    const totalRevenue = log.reduce((s, e) => s + e.amount, 0)
    const purchases = log.filter((e) => e.type === "purchase").length
    const renewals = log.filter((e) => e.type === "renewal").length
    const activeNow = log.filter(
      (e) => new Date(e.expiresAt).getTime() > Date.now()
    ).length
    const uniqueUsers = new Set(log.map((e) => e.email)).size
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const lastWeek = log.filter(
      (e) => new Date(e.activatedAt).getTime() > weekAgo
    ).length
    return { totalRevenue, purchases, renewals, activeNow, uniqueUsers, lastWeek }
  }, [log])

  const promoStats = useMemo(() => {
    // Стат по каждой акции
    const map = new Map<
      string,
      { count: number; revenue: number; lastAt?: string }
    >()
    log.forEach((e) => {
      const key = e.promotionId || "default"
      const cur = map.get(key) || { count: 0, revenue: 0 }
      cur.count++
      cur.revenue += e.amount
      if (!cur.lastAt || cur.lastAt < e.activatedAt) cur.lastAt = e.activatedAt
      map.set(key, cur)
    })
    return map
  }, [log])

  const exportLogCsv = () => {
    if (log.length === 0) {
      toast.error("Журнал пуст")
      return
    }
    const header = [
      "Дата активации",
      "Тип",
      "Email",
      "Имя",
      "Акция",
      "Сумма ₽",
      "Дней",
      "Действует до",
    ]
    const escape = (v: unknown) => {
      const s = String(v ?? "")
      return /[";,\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = log.map((e) =>
      [
        new Date(e.activatedAt).toLocaleString("ru-RU"),
        e.type === "purchase" ? "Покупка" : "Продление",
        e.email,
        e.userName || "",
        e.promotionTitle || "—",
        e.amount,
        e.days,
        new Date(e.expiresAt).toLocaleDateString("ru-RU"),
      ]
        .map(escape)
        .join(";")
    )
    const csv = "\uFEFF" + [header.map(escape).join(";"), ...rows].join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mojno-promo-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Экспортировано ${log.length} записей`)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Акции и предложения
          </h2>
          <p className="text-xs text-black/55 mt-0.5">
            Управляй акциями и смотри журнал по каждой
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.2em]"
        >
          <Icon name="Plus" size={14} />
          Создать акцию
        </button>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          icon="Wallet"
          value={`${stats.totalRevenue.toLocaleString("ru-RU")} ₽`}
          label="Всего собрано"
        />
        <MetricCard
          icon="ShoppingBag"
          value={stats.purchases}
          label="Покупок"
          sublabel={`${stats.lastWeek} за 7 дней`}
        />
        <MetricCard icon="RotateCcw" value={stats.renewals} label="Продлений" />
        <MetricCard
          icon="Gem"
          value={stats.activeNow}
          label="Сейчас активны"
          sublabel={`${stats.uniqueUsers} участниц`}
        />
      </div>

      {/* Список акций */}
      <Panel title={`Акции · ${promotions.length}`} icon="Sparkles">
        {promotions.length === 0 ? (
          <div className="rounded-xl bg-black/[0.02] border border-dashed border-black/10 px-4 py-8 text-center text-xs text-black/45">
            Акций пока нет — нажми «Создать акцию»
          </div>
        ) : (
          <ul className="space-y-2">
            {promotions.map((p) => {
              const ps = promoStats.get(p.id) || { count: 0, revenue: 0 }
              const inWindow =
                (!p.startsAt || new Date(p.startsAt).getTime() <= Date.now()) &&
                (!p.endsAt || new Date(p.endsAt).getTime() >= Date.now())
              return (
                <li
                  key={p.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    p.active && inWindow
                      ? "border-pink-200 bg-gradient-to-br from-pink-50/60 to-white"
                      : "border-black/10 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-wrap">
                    <span
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                        p.active && inWindow
                          ? "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white"
                          : "bg-black/5 text-black/55"
                      }`}
                    >
                      <Icon name="Sparkles" size={15} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-medium">{p.title}</div>
                        <span
                          className={`text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${
                            p.active && inWindow
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : !p.active
                              ? "bg-stone-100 text-stone-600 border-stone-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          }`}
                        >
                          {!p.active
                            ? "Выключена"
                            : !inWindow
                            ? "Вне периода"
                            : "Активна"}
                        </span>
                        {p.kind === "residency_week" && (
                          <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
                            Резидентство
                          </span>
                        )}
                      </div>
                      {p.description && (
                        <div className="text-xs text-black/55 mt-1">
                          {p.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-black/55 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="Wallet" size={11} />
                          {p.price.toLocaleString("ru-RU")} ₽
                          {p.oldPrice && p.oldPrice > p.price && (
                            <span className="text-black/35 line-through">
                              {" "}
                              {p.oldPrice.toLocaleString("ru-RU")} ₽
                            </span>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="Calendar" size={11} />
                          {p.days} {p.days === 1 ? "день" : "дней"}
                        </span>
                        {p.startsAt && (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="PlayCircle" size={11} />
                            с {formatDate(p.startsAt)}
                          </span>
                        )}
                        {p.endsAt && (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="StopCircle" size={11} />
                            до {formatDate(p.endsAt)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-pink-600">
                          <Icon name="ShoppingBag" size={11} />
                          {ps.count} покупок · {ps.revenue.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => togglePromotion(p.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
                          p.active
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "border border-black/15 text-black/65 hover:bg-black/5"
                        }`}
                      >
                        <Icon name={p.active ? "ToggleRight" : "ToggleLeft"} size={11} />
                        {p.active ? "Включена" : "Включить"}
                      </button>
                      <button
                        onClick={() => setEditing(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5 text-[10px] uppercase tracking-[0.18em]"
                      >
                        <Icon name="Pencil" size={11} />
                        Изменить
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Удалить акцию?"))
                            deletePromotion(p.id)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-red-50 text-red-500 text-[10px] uppercase tracking-[0.18em]"
                      >
                        <Icon name="Trash2" size={11} />
                        Удалить
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      {/* Журнал по промо-резидентству */}
      <Panel
        title={`Журнал · промо-резидентство · ${log.length}`}
        icon="ScrollText"
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="text-xs text-black/55">
            Каждая запись — покупка или продление участницей
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLogRefresh((x) => x + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5 text-[11px] uppercase tracking-[0.18em]"
            >
              <Icon name="RefreshCw" size={11} />
              Обновить
            </button>
            <button
              onClick={exportLogCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black hover:bg-black/85 text-white text-[11px] uppercase tracking-[0.18em]"
            >
              <Icon name="Download" size={11} />
              Скачать CSV
            </button>
          </div>
        </div>
        {log.length === 0 ? (
          <div className="rounded-xl bg-black/[0.02] border border-dashed border-black/10 px-4 py-8 text-center text-xs text-black/45">
            Никто ещё не покупал акцию
          </div>
        ) : (
          <ul className="divide-y divide-black/5">
            {log.map((e) => {
              const expired = new Date(e.expiresAt).getTime() < Date.now()
              return (
                <li
                  key={e.id}
                  className="py-2.5 flex items-center gap-3 flex-wrap"
                >
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 ${
                      e.type === "renewal"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <Icon
                      name={e.type === "renewal" ? "RotateCcw" : "ShoppingBag"}
                      size={14}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {e.userName || e.email}
                      {e.userName && (
                        <span className="text-xs text-black/45 font-normal ml-1.5">
                          · {e.email}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-black/55">
                      {e.type === "renewal" ? "Продлила" : "Купила"} ·{" "}
                      {formatDateTime(e.activatedAt)} ·{" "}
                      {e.amount.toLocaleString("ru-RU")} ₽ ·{" "}
                      {e.promotionTitle || "Акция"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-[10px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 border ${
                        expired
                          ? "bg-stone-100 text-stone-600 border-stone-200"
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {expired ? "Истекло" : "Действует"}
                    </div>
                    <div className="text-[10px] text-black/45 mt-0.5">
                      до {new Date(e.expiresAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      {(creating || editing) && (
        <PromotionForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={(data) => {
            if (editing) {
              updatePromotion(editing.id, data)
              toast.success("Акция обновлена")
            } else {
              addPromotion(data)
              toast.success("Акция создана")
            }
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function PromotionForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Promotion | null
  onCancel: () => void
  onSave: (data: Omit<Promotion, "id" | "createdAt">) => void
}) {
  const [kind, setKind] = useState<PromotionKind>(
    initial?.kind || "residency_week"
  )
  const [title, setTitle] = useState(initial?.title || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [badge, setBadge] = useState(initial?.badge || "")
  const [price, setPrice] = useState(String(initial?.price ?? ""))
  const [oldPrice, setOldPrice] = useState(String(initial?.oldPrice ?? ""))
  const [days, setDays] = useState(String(initial?.days ?? "7"))
  const [startsAt, setStartsAt] = useState(initial?.startsAt?.slice(0, 10) || "")
  const [endsAt, setEndsAt] = useState(initial?.endsAt?.slice(0, 10) || "")
  const [active, setActive] = useState(initial?.active ?? true)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Укажи название акции")
      return
    }
    const numPrice = Number(price) || 0
    const numDays = Number(days) || 0
    if (numPrice <= 0) {
      toast.error("Укажи цену больше нуля")
      return
    }
    if (numDays <= 0) {
      toast.error("Укажи длительность больше нуля")
      return
    }
    onSave({
      kind,
      title: title.trim(),
      description: description.trim() || undefined,
      badge: badge.trim() || undefined,
      price: numPrice,
      oldPrice: Number(oldPrice) || undefined,
      days: numDays,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: endsAt
        ? new Date(`${endsAt}T23:59:59`).toISOString()
        : undefined,
      active,
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-black/5 flex-shrink-0">
          <DialogTitle className="text-base">
            {initial ? "Редактировать акцию" : "Новая акция"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Настройки появятся в окне акции у участниц
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={submit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            <div className="space-y-1">
              <Label>Тип акции</Label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as PromotionKind)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="residency_week">Промо-резидентство</option>
                <option value="discount">Скидка</option>
                <option value="bonus">Бонусы</option>
                <option value="custom">Другое</option>
              </select>
              {kind === "residency_week" && (
                <div className="text-[11px] text-pink-600 mt-1">
                  При покупке участница получает статус резидента на N дней.
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Название*</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Стань резидентом на 7 дней"
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Описание</Label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Открой все привилегии резидента всего за 3 500 ₽"
              />
            </div>

            <div className="space-y-1">
              <Label>Бейдж (короткий заголовок над названием)</Label>
              <Input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Только эту неделю"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Цена, ₽*</Label>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Старая цена</Label>
                <Input
                  type="number"
                  min={0}
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="—"
                />
              </div>
              <div className="space-y-1">
                <Label>Дней*</Label>
                <Input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Старт</Label>
                <Input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Окончание</Label>
                <Input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-pink-600"
              />
              <span className="text-sm">Активная</span>
              <span className="text-[11px] text-black/45">
                — участницам показывается окно акции
              </span>
            </label>
          </div>

          <div className="flex gap-2 px-6 py-3 border-t border-black/5 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
            >
              <Icon name={initial ? "Save" : "Plus"} size={13} />
              {initial ? "Сохранить" : "Создать акцию"}
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

type DirSub = "team" | "speakers" | "residents" | "partners"

function DirectoryTab() {
  const [sub, setSub] = useState<DirSub>("team")
  const {
    speakers,
    residents,
    partners,
    team,
    resetSpeakers,
    resetResidents,
    resetPartners,
    resetTeam,
  } = useDirectory()

  const counts = {
    team: team.length,
    speakers: speakers.length,
    residents: residents.length,
    partners: partners.length,
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-2 flex gap-1 overflow-x-auto">
        {(
          [
            { id: "team", label: "Команда клуба", icon: "Users" },
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

      {sub === "team" && <TeamManager onReset={resetTeam} />}
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

function TeamManager({ onReset }: { onReset: () => void }) {
  const {
    team,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    reorderTeam,
  } = useDirectory()
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = (m: TeamMember) => {
    if (!window.confirm(`Удалить «${m.firstName} ${m.lastName}» из команды?`)) return
    deleteTeamMember(m.id)
    toast.success("Удалено")
  }

  return (
    <div className="space-y-3">
      <ManagerToolbar
        title="Команда клуба"
        subtitle="Карточки команды на главной странице «О клубе» — порядок отображается слева направо"
        onAdd={() => setCreating(true)}
        onReset={onReset}
      />

      {team.length === 0 ? (
        <Empty text="Команда пока пустая" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {team.map((m, idx) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-black/5 p-4 flex gap-3"
            >
              <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/30">
                    <Icon name="Image" size={20} />
                  </div>
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${m.accent} mix-blend-multiply opacity-15`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {m.firstName} {m.lastName}
                </div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-pink-600 mt-0.5 truncate">
                  {m.role}
                </div>
                <div className="text-[10px] text-black/40 mt-1">
                  Позиция #{idx + 1}
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  <button
                    onClick={() => reorderTeam(m.id, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Выше"
                  >
                    <Icon name="ArrowUp" size={13} />
                  </button>
                  <button
                    onClick={() => reorderTeam(m.id, "down")}
                    disabled={idx === team.length - 1}
                    className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Ниже"
                  >
                    <Icon name="ArrowDown" size={13} />
                  </button>
                  <button
                    onClick={() => setEditing(m)}
                    className="p-1.5 rounded-full hover:bg-black/5"
                    title="Редактировать"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
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
        <TeamMemberForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={(data) => {
            if (editing) {
              updateTeamMember(editing.id, data)
              toast.success("Карточка обновлена")
            } else {
              addTeamMember(data)
              toast.success("Добавлено в команду")
            }
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function TeamMemberForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: TeamMember | null
  onCancel: () => void
  onSave: (data: Omit<TeamMember, "id">) => void
}) {
  const [firstName, setFirstName] = useState(initial?.firstName || "")
  const [lastName, setLastName] = useState(initial?.lastName || "")
  const [role, setRole] = useState(initial?.role || "")
  const [photo, setPhoto] = useState(initial?.photo || "")
  const [accent, setAccent] = useState(initial?.accent || TEAM_ACCENTS[0])
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (f?: File) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(f)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !role.trim()) {
      toast.error("Заполни имя и должность")
      return
    }
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role.trim(),
      photo,
      accent,
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Редактировать члена команды" : "Новый член команды"}
          </DialogTitle>
          <DialogDescription>
            Карточка отображается в блоке «Команда клуба» на странице «О клубе»
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="rounded-2xl overflow-hidden bg-stone-100 relative aspect-[3/4] max-w-[200px]">
            {photo ? (
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black/30">
                <Icon name="ImagePlus" size={32} />
              </div>
            )}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${accent} mix-blend-multiply opacity-15 pointer-events-none`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
              <div className="text-[9px] uppercase tracking-[0.2em] opacity-90 mb-0.5">
                {role || "Должность"}
              </div>
              <div
                className="text-base leading-tight"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {firstName || "Имя"} {lastName}
              </div>
            </div>
          </div>

          <PhotoField photo={photo} onChange={setPhoto} fileRef={fileRef} onFile={onFile} />

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Имя*</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Фамилия</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Должность*</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Основательница, менеджер, контент-мейкер..."
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Цветовой акцент</Label>
            <div className="grid grid-cols-4 gap-2">
              {TEAM_ACCENTS.map((cl) => (
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