import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type NewsStatus = "draft" | "published"

export interface NewsPost {
  id: string
  title: string
  excerpt: string
  content: string
  cover?: string
  authorEmail: string
  authorName: string
  status: NewsStatus
  createdAt: string
  publishedAt?: string
}

const KEY = "mojno_news"

const genId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const readAll = (): NewsPost[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface NewsContextType {
  news: NewsPost[]
  createNews: (
    data: Omit<NewsPost, "id" | "createdAt" | "status" | "publishedAt"> & {
      status?: NewsStatus
    }
  ) => NewsPost
  updateNews: (id: string, patch: Partial<NewsPost>) => void
  publishNews: (id: string) => void
  unpublishNews: (id: string) => void
  deleteNews: (id: string) => void
}

const NewsContext = createContext<NewsContextType | null>(null)

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsPost[]>([])

  useEffect(() => {
    setNews(readAll())
  }, [])

  const persist = useCallback((next: NewsPost[]) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setNews(next)
  }, [])

  const createNews: NewsContextType["createNews"] = (data) => {
    const status: NewsStatus = data.status || "draft"
    const now = new Date().toISOString()
    const item: NewsPost = {
      id: genId(),
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      cover: data.cover,
      authorEmail: data.authorEmail,
      authorName: data.authorName,
      status,
      createdAt: now,
      publishedAt: status === "published" ? now : undefined,
    }
    persist([item, ...news])
    return item
  }

  const updateNews: NewsContextType["updateNews"] = (id, patch) => {
    persist(news.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }

  const publishNews: NewsContextType["publishNews"] = (id) => {
    persist(
      news.map((n) =>
        n.id === id ? { ...n, status: "published", publishedAt: new Date().toISOString() } : n
      )
    )
  }

  const unpublishNews: NewsContextType["unpublishNews"] = (id) => {
    persist(
      news.map((n) =>
        n.id === id ? { ...n, status: "draft", publishedAt: undefined } : n
      )
    )
  }

  const deleteNews: NewsContextType["deleteNews"] = (id) => {
    persist(news.filter((n) => n.id !== id))
  }

  return (
    <NewsContext.Provider
      value={{ news, createNews, updateNews, publishNews, unpublishNews, deleteNews }}
    >
      {children}
    </NewsContext.Provider>
  )
}

export const useNews = () => {
  const ctx = useContext(NewsContext)
  if (!ctx) throw new Error("useNews must be used inside NewsProvider")
  return ctx
}
