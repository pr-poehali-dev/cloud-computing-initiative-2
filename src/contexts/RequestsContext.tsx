import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type RequestStatus = "new" | "in_progress" | "approved" | "rejected"

export interface SpeakerRequest {
  id: string
  name: string
  phone: string
  email: string
  expertise: string
  topic: string
  experience: string
  socials: string
  message: string
  createdAt: string
  status: RequestStatus
  teamComment?: string
}

export interface PartnerRequest {
  id: string
  company: string
  contactName: string
  phone: string
  email: string
  category: string
  budget: string
  message: string
  createdAt: string
  status: RequestStatus
  teamComment?: string
}

export interface ResidencyRequest {
  id: string
  email: string
  userName: string
  planTitle: string
  amount: number
  createdAt: string
  status: RequestStatus
  teamComment?: string
}

export interface EventOrderRequest {
  id: string
  contactName: string
  phone: string
  email: string
  format: string
  date: string
  guests: string
  budget: string
  message: string
  createdAt: string
  status: RequestStatus
  teamComment?: string
}

const KEY_SPEAKERS = "mojno_speaker_requests_v2"
const KEY_PARTNERS = "mojno_partner_requests_v2"
const KEY_RESIDENCY = "mojno_residency_requests"
const KEY_EVENT_ORDERS = "mojno_event_orders"

const LEGACY_SPEAKERS = "speaker_requests"
const LEGACY_PARTNERS = "partnership_requests"

const genId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const safeRead = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface LegacySpeaker {
  name?: string
  phone?: string
  email?: string
  expertise?: string
  topic?: string
  experience?: string
  socials?: string
  message?: string
  createdAt?: string
}

interface LegacyPartner {
  company?: string
  contactName?: string
  phone?: string
  email?: string
  category?: string
  budget?: string
  message?: string
  createdAt?: string
}

const migrateSpeakers = (): SpeakerRequest[] => {
  const v2 = safeRead<SpeakerRequest>(KEY_SPEAKERS)
  if (v2.length > 0) return v2
  const legacy = safeRead<LegacySpeaker>(LEGACY_SPEAKERS)
  if (legacy.length === 0) return []
  const migrated: SpeakerRequest[] = legacy.map((r) => ({
    id: genId(),
    name: r.name || "",
    phone: r.phone || "",
    email: r.email || "",
    expertise: r.expertise || "",
    topic: r.topic || "",
    experience: r.experience || "",
    socials: r.socials || "",
    message: r.message || "",
    createdAt: r.createdAt || new Date().toISOString(),
    status: "new",
  }))
  localStorage.setItem(KEY_SPEAKERS, JSON.stringify(migrated))
  return migrated
}

const migratePartners = (): PartnerRequest[] => {
  const v2 = safeRead<PartnerRequest>(KEY_PARTNERS)
  if (v2.length > 0) return v2
  const legacy = safeRead<LegacyPartner>(LEGACY_PARTNERS)
  if (legacy.length === 0) return []
  const migrated: PartnerRequest[] = legacy.map((r) => ({
    id: genId(),
    company: r.company || "",
    contactName: r.contactName || "",
    phone: r.phone || "",
    email: r.email || "",
    category: r.category || "",
    budget: r.budget || "",
    message: r.message || "",
    createdAt: r.createdAt || new Date().toISOString(),
    status: "new",
  }))
  localStorage.setItem(KEY_PARTNERS, JSON.stringify(migrated))
  return migrated
}

interface RequestsContextType {
  speakerRequests: SpeakerRequest[]
  partnerRequests: PartnerRequest[]
  residencyRequests: ResidencyRequest[]
  eventOrders: EventOrderRequest[]
  addSpeakerRequest: (data: Omit<SpeakerRequest, "id" | "createdAt" | "status">) => void
  addPartnerRequest: (data: Omit<PartnerRequest, "id" | "createdAt" | "status">) => void
  addResidencyRequest: (
    data: Omit<ResidencyRequest, "id"> & { id?: string }
  ) => void
  addEventOrder: (data: Omit<EventOrderRequest, "id" | "createdAt" | "status">) => void
  updateSpeakerRequest: (id: string, patch: Partial<SpeakerRequest>) => void
  updatePartnerRequest: (id: string, patch: Partial<PartnerRequest>) => void
  updateResidencyRequest: (id: string, patch: Partial<ResidencyRequest>) => void
  updateEventOrder: (id: string, patch: Partial<EventOrderRequest>) => void
  deleteSpeakerRequest: (id: string) => void
  deletePartnerRequest: (id: string) => void
  deleteResidencyRequest: (id: string) => void
  deleteEventOrder: (id: string) => void
}

const RequestsContext = createContext<RequestsContextType | null>(null)

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [speakerRequests, setSpeakerRequests] = useState<SpeakerRequest[]>([])
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([])
  const [residencyRequests, setResidencyRequests] = useState<ResidencyRequest[]>([])
  const [eventOrders, setEventOrders] = useState<EventOrderRequest[]>([])

  useEffect(() => {
    setSpeakerRequests(migrateSpeakers())
    setPartnerRequests(migratePartners())
    setResidencyRequests(safeRead<ResidencyRequest>(KEY_RESIDENCY))
    setEventOrders(safeRead<EventOrderRequest>(KEY_EVENT_ORDERS))
  }, [])

  const persistSpeakers = useCallback((next: SpeakerRequest[]) => {
    localStorage.setItem(KEY_SPEAKERS, JSON.stringify(next))
    setSpeakerRequests(next)
  }, [])

  const persistPartners = useCallback((next: PartnerRequest[]) => {
    localStorage.setItem(KEY_PARTNERS, JSON.stringify(next))
    setPartnerRequests(next)
  }, [])

  const persistResidency = useCallback((next: ResidencyRequest[]) => {
    localStorage.setItem(KEY_RESIDENCY, JSON.stringify(next))
    setResidencyRequests(next)
  }, [])

  const persistEventOrders = useCallback((next: EventOrderRequest[]) => {
    localStorage.setItem(KEY_EVENT_ORDERS, JSON.stringify(next))
    setEventOrders(next)
  }, [])

  const addSpeakerRequest: RequestsContextType["addSpeakerRequest"] = (data) => {
    const item: SpeakerRequest = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      status: "new",
    }
    const current = safeRead<SpeakerRequest>(KEY_SPEAKERS)
    const next = [item, ...current]
    persistSpeakers(next)
  }

  const addPartnerRequest: RequestsContextType["addPartnerRequest"] = (data) => {
    const item: PartnerRequest = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      status: "new",
    }
    const current = safeRead<PartnerRequest>(KEY_PARTNERS)
    const next = [item, ...current]
    persistPartners(next)
  }

  const addResidencyRequest: RequestsContextType["addResidencyRequest"] = (data) => {
    const item: ResidencyRequest = {
      ...data,
      id: data.id || genId(),
    }
    const current = safeRead<ResidencyRequest>(KEY_RESIDENCY)
    const next = [item, ...current]
    persistResidency(next)
  }

  const addEventOrder: RequestsContextType["addEventOrder"] = (data) => {
    const item: EventOrderRequest = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      status: "new",
    }
    const current = safeRead<EventOrderRequest>(KEY_EVENT_ORDERS)
    const next = [item, ...current]
    persistEventOrders(next)
  }

  const updateSpeakerRequest: RequestsContextType["updateSpeakerRequest"] = (id, patch) => {
    persistSpeakers(speakerRequests.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const updatePartnerRequest: RequestsContextType["updatePartnerRequest"] = (id, patch) => {
    persistPartners(partnerRequests.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const updateResidencyRequest: RequestsContextType["updateResidencyRequest"] = (
    id,
    patch
  ) => {
    persistResidency(residencyRequests.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const deleteSpeakerRequest: RequestsContextType["deleteSpeakerRequest"] = (id) => {
    persistSpeakers(speakerRequests.filter((r) => r.id !== id))
  }

  const deletePartnerRequest: RequestsContextType["deletePartnerRequest"] = (id) => {
    persistPartners(partnerRequests.filter((r) => r.id !== id))
  }

  const deleteResidencyRequest: RequestsContextType["deleteResidencyRequest"] = (id) => {
    persistResidency(residencyRequests.filter((r) => r.id !== id))
  }

  const updateEventOrder: RequestsContextType["updateEventOrder"] = (id, patch) => {
    persistEventOrders(eventOrders.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const deleteEventOrder: RequestsContextType["deleteEventOrder"] = (id) => {
    persistEventOrders(eventOrders.filter((r) => r.id !== id))
  }

  return (
    <RequestsContext.Provider
      value={{
        speakerRequests,
        partnerRequests,
        residencyRequests,
        eventOrders,
        addSpeakerRequest,
        addPartnerRequest,
        addResidencyRequest,
        addEventOrder,
        updateSpeakerRequest,
        updatePartnerRequest,
        updateResidencyRequest,
        updateEventOrder,
        deleteSpeakerRequest,
        deletePartnerRequest,
        deleteResidencyRequest,
        deleteEventOrder,
      }}
    >
      {children}
    </RequestsContext.Provider>
  )
}

export const useRequests = () => {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error("useRequests must be used inside RequestsProvider")
  return ctx
}