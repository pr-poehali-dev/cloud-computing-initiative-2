import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export interface TeamMessage {
  id: string
  authorEmail: string
  authorName: string
  authorPosition?: string
  text: string
  createdAt: string
}

const KEY = "mojno_team_chat"

const genId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const readAll = (): TeamMessage[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface AuthorInfo {
  email: string
  name: string
  position?: string
}

interface TeamChatContextType {
  messages: TeamMessage[]
  sendMessage: (author: AuthorInfo, text: string) => void
  deleteMessage: (id: string, currentEmail: string) => void
}

const TeamChatContext = createContext<TeamChatContextType | null>(null)

export function TeamChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<TeamMessage[]>([])

  useEffect(() => {
    setMessages(readAll())
  }, [])

  // Sync across tabs / between page open sessions
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) setMessages(readAll())
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const persist = useCallback((next: TeamMessage[]) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setMessages(next)
  }, [])

  const sendMessage: TeamChatContextType["sendMessage"] = (author, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const item: TeamMessage = {
      id: genId(),
      authorEmail: author.email,
      authorName: author.name,
      authorPosition: author.position,
      text: trimmed,
      createdAt: new Date().toISOString(),
    }
    persist([...messages, item])
  }

  const deleteMessage: TeamChatContextType["deleteMessage"] = (id, currentEmail) => {
    persist(
      messages.filter(
        (m) => !(m.id === id && m.authorEmail.toLowerCase() === currentEmail.toLowerCase())
      )
    )
  }

  return (
    <TeamChatContext.Provider value={{ messages, sendMessage, deleteMessage }}>
      {children}
    </TeamChatContext.Provider>
  )
}

export const useTeamChat = () => {
  const ctx = useContext(TeamChatContext)
  if (!ctx) throw new Error("useTeamChat must be used inside TeamChatProvider")
  return ctx
}
