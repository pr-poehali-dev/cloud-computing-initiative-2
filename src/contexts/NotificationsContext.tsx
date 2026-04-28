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
}

const STORAGE_PREFS = "mojno_notif_prefs"
const STORAGE_NOTIFS = "mojno_notif_items"

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

const NotificationsContext = createContext<NotificationsContextType | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<SubscriptionPrefs>({ categories: [], keywords: [] })
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    setPrefs(readPrefs())
    setNotifications(readNotifs())
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
