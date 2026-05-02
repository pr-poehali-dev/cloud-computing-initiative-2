import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type TestimonialStatus = "pending" | "approved" | "rejected"

export interface UserTestimonial {
  id: string
  authorEmail: string
  authorName: string
  text: string
  rating?: number
  status: TestimonialStatus
  createdAt: string
}

const KEY = "mojno_user_testimonials"

const genId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const readAll = (): UserTestimonial[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface TestimonialsContextType {
  testimonials: UserTestimonial[]
  submitTestimonial: (
    data: Omit<UserTestimonial, "id" | "createdAt" | "status"> & {
      status?: TestimonialStatus
    }
  ) => UserTestimonial
  updateTestimonial: (id: string, patch: Partial<UserTestimonial>) => void
  deleteTestimonial: (id: string) => void
}

const TestimonialsContext = createContext<TestimonialsContextType | null>(null)

export function TestimonialsProvider({ children }: { children: ReactNode }) {
  const [testimonials, setTestimonials] = useState<UserTestimonial[]>([])

  useEffect(() => {
    setTestimonials(readAll())
  }, [])

  const persist = useCallback((next: UserTestimonial[]) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setTestimonials(next)
  }, [])

  const submitTestimonial: TestimonialsContextType["submitTestimonial"] = (data) => {
    const item: UserTestimonial = {
      id: genId(),
      authorEmail: data.authorEmail,
      authorName: data.authorName,
      text: data.text,
      rating: data.rating,
      status: data.status || "pending",
      createdAt: new Date().toISOString(),
    }
    persist([item, ...testimonials])
    return item
  }

  const updateTestimonial: TestimonialsContextType["updateTestimonial"] = (id, patch) => {
    persist(testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const deleteTestimonial: TestimonialsContextType["deleteTestimonial"] = (id) => {
    persist(testimonials.filter((t) => t.id !== id))
  }

  return (
    <TestimonialsContext.Provider
      value={{ testimonials, submitTestimonial, updateTestimonial, deleteTestimonial }}
    >
      {children}
    </TestimonialsContext.Provider>
  )
}

export const useTestimonials = () => {
  const ctx = useContext(TestimonialsContext)
  if (!ctx) throw new Error("useTestimonials must be used inside TestimonialsProvider")
  return ctx
}
