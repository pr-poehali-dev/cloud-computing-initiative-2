import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type PromotionKind = "residency_week" | "discount" | "bonus" | "custom"

export interface Promotion {
  id: string
  kind: PromotionKind
  title: string
  description?: string
  badge?: string
  price: number
  oldPrice?: number
  days: number
  startsAt?: string
  endsAt?: string
  active: boolean
  createdAt: string
}

const STORAGE = "mojno_promotions_v1"

const DEFAULT_PROMO: Promotion = {
  id: "promo-residency-default",
  kind: "residency_week",
  title: "Стань резидентом на 7 дней",
  description:
    "Открой все привилегии резидента всего за 3 500 ₽ — без подписки и обязательств.",
  badge: "Только эту неделю",
  price: 3500,
  oldPrice: 10000,
  days: 7,
  active: true,
  createdAt: new Date().toISOString(),
}

const readPromotions = (): Promotion[] => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return [DEFAULT_PROMO]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_PROMO]
  } catch {
    return [DEFAULT_PROMO]
  }
}

const writePromotions = (list: Promotion[]) => {
  localStorage.setItem(STORAGE, JSON.stringify(list))
}

interface PromotionsContextType {
  promotions: Promotion[]
  activeResidencyPromo: Promotion | null
  addPromotion: (
    data: Omit<Promotion, "id" | "createdAt">
  ) => Promotion
  updatePromotion: (id: string, patch: Partial<Promotion>) => void
  deletePromotion: (id: string) => void
  togglePromotion: (id: string) => void
  reload: () => void
}

const PromotionsContext = createContext<PromotionsContextType | null>(null)

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([])

  const reload = useCallback(() => {
    setPromotions(readPromotions())
  }, [])

  useEffect(() => {
    reload()
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE) reload()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [reload])

  const isWithinWindow = useCallback((p: Promotion) => {
    const now = Date.now()
    if (p.startsAt && new Date(p.startsAt).getTime() > now) return false
    if (p.endsAt && new Date(p.endsAt).getTime() < now) return false
    return true
  }, [])

  const activeResidencyPromo = useMemo<Promotion | null>(() => {
    return (
      promotions.find(
        (p) => p.kind === "residency_week" && p.active && isWithinWindow(p)
      ) || null
    )
  }, [promotions, isWithinWindow])

  const addPromotion: PromotionsContextType["addPromotion"] = (data) => {
    const item: Promotion = {
      ...data,
      id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    const next = [item, ...promotions]
    writePromotions(next)
    setPromotions(next)
    return item
  }

  const updatePromotion: PromotionsContextType["updatePromotion"] = (id, patch) => {
    const next = promotions.map((p) => (p.id === id ? { ...p, ...patch } : p))
    writePromotions(next)
    setPromotions(next)
  }

  const deletePromotion: PromotionsContextType["deletePromotion"] = (id) => {
    const next = promotions.filter((p) => p.id !== id)
    writePromotions(next)
    setPromotions(next)
  }

  const togglePromotion: PromotionsContextType["togglePromotion"] = (id) => {
    const next = promotions.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p
    )
    writePromotions(next)
    setPromotions(next)
  }

  return (
    <PromotionsContext.Provider
      value={{
        promotions,
        activeResidencyPromo,
        addPromotion,
        updatePromotion,
        deletePromotion,
        togglePromotion,
        reload,
      }}
    >
      {children}
    </PromotionsContext.Provider>
  )
}

export const usePromotions = () => {
  const ctx = useContext(PromotionsContext)
  if (!ctx) throw new Error("usePromotions must be used inside PromotionsProvider")
  return ctx
}
