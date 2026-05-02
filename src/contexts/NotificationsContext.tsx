import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { EventCategory } from "@/data/events"

export interface NotificationItem {
  id: string
  title: string
  description: string
  createdAt: string
  read: boolean
  eventTitle?: string
  eventDate?: string
}

export interface SubscriptionPrefs {
  categories: EventCategory[]
  keywords: string[]
}

export interface Broadcast {
  id: string
  title: string
  description: string
  targetRole: "all" | "member" | "team"
  createdAt: string
}

interface NotificationsContextType {
  prefs: SubscriptionPrefs
  notifications: NotificationItem[]
  unreadCount: number
  toggleCategory: (c: EventCategory) => void
  addKeyword: (k: string) => void
  removeKeyword: (k: string) => void
  markAllRead: () => void
  removeNotification: (id: string) => void
  pushTestNotification: () => void
  broadcastToAll: (
    title: string,
    description: string,
    targetRole?: "all" | "member" | "team"
  ) => number
  broadcasts: Broadcast[]
}

const STORAGE_PREFS = "mojno_notif_prefs"
const STORAGE_NOTIFS = "mojno_notif_items"
const STORAGE_BROADCASTS = "mojno_broadcasts"

const readPrefs = (): SubscriptionPrefs => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS)
    if (!raw) return { categories: [], keywords: [] }
    const p = JSON.parse(raw) as SubscriptionPrefs
    return {
      categories: Array.isArray(p.categories) ? p.categories : [],
      keywords: Array.isArray(p.keywords) ? p.keywords : [],
    }
  } catch {
    return { categories: [], keywords: [] }
  }
}

const writePrefs = (p: SubscriptionPrefs) =>
  localStorage.setItem(STORAGE_PREFS, JSON.stringify(p))

const readNotifs = (): NotificationItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_NOTIFS) || "[]")
  } catch {
    return []
  }
}

const writeNotifs = (list: NotificationItem[]) =>
  localStorage.setItem(STORAGE_NOTIFS, JSON.stringify(list))

const readBroadcasts = (): Broadcast[] => {
  try {
    const raw = localStorage.getItem(STORAGE_BROADCASTS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeBroadcasts = (list: Broadcast[]) =>
  localStorage.setItem(STORAGE_BROADCASTS, JSON.stringify(list))

const NotificationsContext = createContext<NotificationsContextType | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<SubscriptionPrefs>({ categories: [], keywords: [] })
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])

  useEffect(() => {
    setPrefs(readPrefs())
    setNotifications(readNotifs())
    setBroadcasts(readBroadcasts())
  }, [])

  const persistPrefs = useCallback((next: SubscriptionPrefs) => {
    writePrefs(next)
    setPrefs(next)
  }, [])

  const persistNotifs = useCallback((next: NotificationItem[]) => {
    writeNotifs(next)
    setNotifications(next)
  }, [])

  const toggleCategory: NotificationsContextType["toggleCategory"] = (c) => {
    const has = prefs.categories.includes(c)
    persistPrefs({
      ...prefs,
      categories: has ? prefs.categories.filter((x) => x !== c) : [...prefs.categories, c],
    })
  }

  const addKeyword: NotificationsContextType["addKeyword"] = (k) => {
    const trimmed = k.trim()
    if (!trimmed) return
    if (prefs.keywords.some((x) => x.toLowerCase() === trimmed.toLowerCase())) return
    persistPrefs({ ...prefs, keywords: [...prefs.keywords, trimmed] })
  }

  const removeKeyword: NotificationsContextType["removeKeyword"] = (k) => {
    persistPrefs({ ...prefs, keywords: prefs.keywords.filter((x) => x !== k) })
  }

  const markAllRead: NotificationsContextType["markAllRead"] = () => {
    persistNotifs(notifications.map((n) => ({ ...n, read: true })))
  }

  const removeNotification: NotificationsContextType["removeNotification"] = (id) => {
    persistNotifs(notifications.filter((n) => n.id !== id))
  }

  const broadcastToAll: NotificationsContextType["broadcastToAll"] = (
    title,
    description,
    targetRole = "all"
  ) => {
    // Save broadcast record for admin history
    const item: Broadcast = {
      id: `bc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      description,
      targetRole,
      createdAt: new Date().toISOString(),
    }
    const nextBroadcasts = [item, ...broadcasts]
    writeBroadcasts(nextBroadcasts)
    setBroadcasts(nextBroadcasts)

    // Also push as a regular notification for the current user (so they immediately see it)
    const local: NotificationItem = {
      id: `bc-local-${item.id}`,
      title,
      description,
      createdAt: item.createdAt,
      read: false,
    }
    persistNotifs([local, ...notifications])

    // Count recipients by reading users
    try {
      const usersRaw = localStorage.getItem("mojno_users")
      const users: Array<{ role?: "member" | "team" }> = usersRaw ? JSON.parse(usersRaw) : []
      if (targetRole === "all") return users.length
      return users.filter((u) => (u.role || "member") === targetRole).length
    } catch {
      return 0
    }
  }

  const pushTestNotification: NotificationsContextType["pushTestNotification"] = () => {
    const sample: NotificationItem = {
      id: `n-${Date.now()}`,
      title: "Новое мероприятие в календаре",
      description:
        "По твоей подписке: «Круг поддержки» — добавлен в календарь. Запишись прямо сейчас.",
      createdAt: new Date().toISOString(),
      read: false,
      eventTitle: "Круг поддержки: я и мои границы",
      eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    }
    persistNotifs([sample, ...notifications])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        prefs,
        notifications,
        unreadCount,
        toggleCategory,
        addKeyword,
        removeKeyword,
        markAllRead,
        removeNotification,
        pushTestNotification,
        broadcastToAll,
        broadcasts,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider")
  return ctx
}