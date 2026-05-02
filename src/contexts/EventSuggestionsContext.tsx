import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type SuggestionStatus = "new" | "in_progress" | "approved" | "rejected"

export interface EventSuggestion {
  id: string
  authorEmail?: string
  authorName: string
  contact: string
  category: string
  title: string
  description: string
  format?: string
  preferredDate?: string
  willAttend: boolean
  createdAt: string
  status: SuggestionStatus
  votes: string[]
  teamComment?: string
}

const KEY = "mojno_event_suggestions"

const genId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const readAll = (): EventSuggestion[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((p: Partial<EventSuggestion>) => ({
      id: p.id || genId(),
      authorEmail: p.authorEmail,
      authorName: p.authorName || "Аноним",
      contact: p.contact || "",
      category: p.category || "",
      title: p.title || "",
      description: p.description || "",
      format: p.format,
      preferredDate: p.preferredDate,
      willAttend: !!p.willAttend,
      createdAt: p.createdAt || new Date().toISOString(),
      status: (p.status as SuggestionStatus) || "new",
      votes: Array.isArray(p.votes) ? p.votes : [],
      teamComment: p.teamComment,
    }))
  } catch {
    return []
  }
}

interface SuggestionsContextType {
  suggestions: EventSuggestion[]
  addSuggestion: (
    data: Omit<EventSuggestion, "id" | "createdAt" | "status" | "votes">
  ) => EventSuggestion
  updateSuggestion: (id: string, patch: Partial<EventSuggestion>) => void
  deleteSuggestion: (id: string) => void
  toggleVote: (id: string, voterKey: string) => void
}

const SuggestionsContext = createContext<SuggestionsContextType | null>(null)

export function EventSuggestionsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([])

  useEffect(() => {
    setSuggestions(readAll())
  }, [])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) setSuggestions(readAll())
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const persist = useCallback((next: EventSuggestion[]) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setSuggestions(next)
  }, [])

  const addSuggestion: SuggestionsContextType["addSuggestion"] = (data) => {
    const item: EventSuggestion = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      status: "new",
      votes: [],
    }
    persist([item, ...suggestions])
    return item
  }

  const updateSuggestion: SuggestionsContextType["updateSuggestion"] = (id, patch) => {
    persist(suggestions.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const deleteSuggestion: SuggestionsContextType["deleteSuggestion"] = (id) => {
    persist(suggestions.filter((s) => s.id !== id))
  }

  const toggleVote: SuggestionsContextType["toggleVote"] = (id, voterKey) => {
    persist(
      suggestions.map((s) => {
        if (s.id !== id) return s
        const has = s.votes.includes(voterKey)
        return {
          ...s,
          votes: has ? s.votes.filter((v) => v !== voterKey) : [...s.votes, voterKey],
        }
      })
    )
  }

  return (
    <SuggestionsContext.Provider
      value={{ suggestions, addSuggestion, updateSuggestion, deleteSuggestion, toggleVote }}
    >
      {children}
    </SuggestionsContext.Provider>
  )
}

export const useEventSuggestions = () => {
  const ctx = useContext(SuggestionsContext)
  if (!ctx)
    throw new Error("useEventSuggestions must be used inside EventSuggestionsProvider")
  return ctx
}
