import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type PlannerKind = "task" | "reminder" | "event"
export type PlannerStatus = "open" | "done" | "cancelled"
export type ConfirmStatus = "pending" | "accepted" | "declined"

export interface PlannerConfirmation {
  email: string
  name?: string
  position?: string
  status: ConfirmStatus
  respondedAt?: string
  comment?: string
}

export interface PlannerItem {
  id: string
  kind: PlannerKind
  title: string
  description?: string
  dueAt?: string // ISO datetime
  remindAt?: string // ISO datetime
  createdByEmail: string
  createdByName: string
  createdAt: string
  status: PlannerStatus
  assignees: PlannerConfirmation[]
  relatedEventId?: string
}

const KEY = "mojno_team_planner_v1"

const genId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const readAll = (): PlannerItem[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface TeamPlannerContextType {
  items: PlannerItem[]
  addItem: (
    data: Omit<
      PlannerItem,
      "id" | "createdAt" | "status" | "assignees"
    > & {
      assignees: Array<Omit<PlannerConfirmation, "status" | "respondedAt">>
    }
  ) => PlannerItem
  updateItem: (id: string, patch: Partial<PlannerItem>) => void
  removeItem: (id: string, currentEmail: string) => void
  setStatus: (id: string, status: PlannerStatus) => void
  respond: (
    id: string,
    email: string,
    status: ConfirmStatus,
    comment?: string
  ) => void
}

const TeamPlannerContext = createContext<TeamPlannerContextType | null>(null)

export function TeamPlannerProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PlannerItem[]>([])

  useEffect(() => {
    setItems(readAll())
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(readAll())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const persist = useCallback((next: PlannerItem[]) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setItems(next)
  }, [])

  const addItem: TeamPlannerContextType["addItem"] = (data) => {
    const item: PlannerItem = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      status: "open",
      assignees: data.assignees.map((a) => ({
        ...a,
        status: "pending",
      })),
    }
    persist([item, ...items])
    return item
  }

  const updateItem: TeamPlannerContextType["updateItem"] = (id, patch) => {
    persist(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  const removeItem: TeamPlannerContextType["removeItem"] = (id, currentEmail) => {
    persist(
      items.filter(
        (i) =>
          !(
            i.id === id &&
            i.createdByEmail.toLowerCase() === currentEmail.toLowerCase()
          )
      )
    )
  }

  const setStatus: TeamPlannerContextType["setStatus"] = (id, status) => {
    persist(items.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  const respond: TeamPlannerContextType["respond"] = (
    id,
    email,
    status,
    comment
  ) => {
    persist(
      items.map((i) => {
        if (i.id !== id) return i
        return {
          ...i,
          assignees: i.assignees.map((a) =>
            a.email.toLowerCase() === email.toLowerCase()
              ? {
                  ...a,
                  status,
                  comment,
                  respondedAt: new Date().toISOString(),
                }
              : a
          ),
        }
      })
    )
  }

  return (
    <TeamPlannerContext.Provider
      value={{ items, addItem, updateItem, removeItem, setStatus, respond }}
    >
      {children}
    </TeamPlannerContext.Provider>
  )
}

export const useTeamPlanner = () => {
  const ctx = useContext(TeamPlannerContext)
  if (!ctx) throw new Error("useTeamPlanner must be used inside TeamPlannerProvider")
  return ctx
}
