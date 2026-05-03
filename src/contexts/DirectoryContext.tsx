import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export interface Speaker {
  id: string
  name: string
  role: string
  bio: string
  photo: string
}

export interface Resident {
  id: string
  name: string
  role: string
  since: string
  quote: string
  photo: string
}

export interface Partner {
  id: string
  name: string
  category: string
  description: string
  icon: string
  accent: string
}

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  role: string
  photo: string
  accent: string
}

const KEY_SPEAKERS = "mojno_directory_speakers"
const KEY_RESIDENTS = "mojno_directory_residents"
const KEY_PARTNERS = "mojno_directory_partners"
const KEY_TEAM = "mojno_directory_team"

const DEFAULT_SPEAKERS: Speaker[] = [
  {
    id: "speaker-1",
    name: "Екатерина Лаврова",
    role: "Психолог, гештальт-терапевт",
    bio: "10 лет частной практики, ведущая кругов поддержки и расстановок.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/08af00b7-f487-4913-bfcb-18209d8986fb.jpg",
  },
  {
    id: "speaker-2",
    name: "Алина Светлова",
    role: "Тренер по йоге и пилатесу",
    bio: "Сертифицированный преподаватель, авторские утренние практики у воды.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e70a851-f500-4868-9a3f-6d1f5a1df032.jpg",
  },
  {
    id: "speaker-3",
    name: "Марина Корн",
    role: "Бизнес-наставник, инвестор",
    bio: "Основательница венчурного фонда, ментор женского предпринимательства.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6e0dbeba-9b07-40a5-a5a1-6f912e4f8ab8.jpg",
  },
]

const DEFAULT_RESIDENTS: Resident[] = [
  {
    id: "resident-1",
    name: "Анастасия К.",
    role: "Основательница студии",
    since: "С нами 2 года",
    quote: "Здесь я нашла подруг, партнёров и саму себя.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/5c4bf05c-35f8-4749-b418-c0e1cca8c492.jpg",
  },
  {
    id: "resident-2",
    name: "Вероника М.",
    role: "Маркетолог, наставница",
    since: "С нами 1 год",
    quote: "Клуб «можно» — про право быть собой без оправданий.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/199c539f-65ae-45ff-9dce-788c75bc8605.jpg",
  },
  {
    id: "resident-3",
    name: "Ольга С.",
    role: "Психолог, коуч",
    since: "С нами 3 года",
    quote: "Каждая встреча — глоток воздуха в плотном графике.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/7eaa2546-85bc-4980-81be-59714b94eb87.jpg",
  },
  {
    id: "resident-4",
    name: "Дарья Л.",
    role: "Креативный продюсер",
    since: "С нами 1.5 года",
    quote: "Тёплый круг, в котором вырастают идеи и смелость.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/ccceea76-3131-4851-bbed-0df24fd39011.jpg",
  },
  {
    id: "resident-5",
    name: "Мария Р.",
    role: "Основательница бренда",
    since: "С нами 2 года",
    quote: "Здесь поддерживают так, как умеют только женщины.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/bf4dcd2b-9578-4647-bad3-7521b953678f.jpg",
  },
  {
    id: "resident-6",
    name: "Елизавета Н.",
    role: "Юрист, мама",
    since: "С нами 8 месяцев",
    quote: "Наконец нашла место, где можно просто быть.",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/2539cd88-42a8-4b5f-a8e8-eaece27e4dc7.jpg",
  },
]

const DEFAULT_PARTNERS: Partner[] = [
  {
    id: "partner-1",
    name: "White SPA",
    category: "Спа и красота",
    description: "Премиальный спа-комплекс с хаммамом, массажами и закрытым бассейном.",
    icon: "Flower",
    accent: "from-rose-300 to-pink-400",
  },
  {
    id: "partner-2",
    name: "Wine Room",
    category: "Винотека",
    description: "Авторские винные дегустации и закрытые ужины для клубных вечеров.",
    icon: "Wine",
    accent: "from-fuchsia-400 to-purple-500",
  },
  {
    id: "partner-3",
    name: "Padel Club",
    category: "Спорт",
    description: "Корты падела и теннисные тренировки с персональным тренером.",
    icon: "Trophy",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    id: "partner-4",
    name: "Cycle Studio",
    category: "Фитнес",
    description: "Сайкл-вечеринки с диджеем — фирменный формат тренировок клуба.",
    icon: "Bike",
    accent: "from-amber-400 to-pink-500",
  },
  {
    id: "partner-5",
    name: "Café Pushkin",
    category: "Гастрономия",
    description: "Завтраки и бранчи для бизнес-нетворкингов клуба.",
    icon: "Coffee",
    accent: "from-stone-500 to-stone-700",
  },
  {
    id: "partner-6",
    name: "Studio «Свет»",
    category: "Фотопродакшен",
    description: "Профессиональная съёмка для резиденток и личных брендов.",
    icon: "Camera",
    accent: "from-pink-400 to-rose-500",
  },
]

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "team-1",
    firstName: "Юлия",
    lastName: "Мустафина",
    role: "Основательница клуба",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/bucket/6b4fd03e-9b33-4641-88db-89b6c7ee19aa.jpg",
    accent: "from-pink-400 to-rose-500",
  },
  {
    id: "team-2",
    firstName: "Алина",
    lastName: "Соколова",
    role: "Менеджер клуба",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/420bdc95-1e68-4ae1-b41c-1f06a1b19f62.jpg",
    accent: "from-rose-400 to-fuchsia-500",
  },
  {
    id: "team-3",
    firstName: "Дарья",
    lastName: "Иванова",
    role: "Контент-мейкер",
    photo:
      "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/9e2b86d4-a088-4d67-8dcd-56fe34d392fc.jpg",
    accent: "from-fuchsia-400 to-pink-500",
  },
]

export const TEAM_ACCENTS = [
  "from-pink-400 to-rose-500",
  "from-rose-400 to-fuchsia-500",
  "from-fuchsia-400 to-pink-500",
  "from-amber-400 to-rose-500",
  "from-purple-500 to-fuchsia-600",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-indigo-500",
  "from-orange-400 to-pink-500",
]

export const PARTNER_ACCENTS = [
  "from-rose-300 to-pink-400",
  "from-fuchsia-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-pink-500",
  "from-stone-500 to-stone-700",
  "from-pink-400 to-rose-500",
  "from-sky-400 to-indigo-500",
  "from-violet-500 to-fuchsia-600",
  "from-orange-400 to-red-500",
  "from-lime-400 to-emerald-500",
]

export const PARTNER_ICONS = [
  "Flower",
  "Wine",
  "Trophy",
  "Bike",
  "Coffee",
  "Camera",
  "Sparkles",
  "Heart",
  "Leaf",
  "Music",
  "Briefcase",
  "Gem",
  "Gift",
  "Star",
  "Crown",
  "Palette",
]

const genId = (prefix: string) => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
    }
  } catch {
    /* ignore */
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed as T
  } catch {
    return fallback
  }
}

const safeWrite = (key: string, data: unknown) =>
  localStorage.setItem(key, JSON.stringify(data))

interface DirectoryContextType {
  speakers: Speaker[]
  residents: Resident[]
  partners: Partner[]
  team: TeamMember[]
  addSpeaker: (data: Omit<Speaker, "id">) => Speaker
  updateSpeaker: (id: string, patch: Partial<Speaker>) => void
  deleteSpeaker: (id: string) => void
  resetSpeakers: () => void
  addResident: (data: Omit<Resident, "id">) => Resident
  updateResident: (id: string, patch: Partial<Resident>) => void
  deleteResident: (id: string) => void
  resetResidents: () => void
  addPartner: (data: Omit<Partner, "id">) => Partner
  updatePartner: (id: string, patch: Partial<Partner>) => void
  deletePartner: (id: string) => void
  resetPartners: () => void
  addTeamMember: (data: Omit<TeamMember, "id">) => TeamMember
  updateTeamMember: (id: string, patch: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void
  reorderTeam: (id: string, direction: "up" | "down") => void
  resetTeam: () => void
}

const DirectoryContext = createContext<DirectoryContextType | null>(null)

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [speakers, setSpeakers] = useState<Speaker[]>(
    () => safeRead<Speaker[] | null>(KEY_SPEAKERS, null) || DEFAULT_SPEAKERS
  )
  const [residents, setResidents] = useState<Resident[]>(
    () => safeRead<Resident[] | null>(KEY_RESIDENTS, null) || DEFAULT_RESIDENTS
  )
  const [partners, setPartners] = useState<Partner[]>(
    () => safeRead<Partner[] | null>(KEY_PARTNERS, null) || DEFAULT_PARTNERS
  )
  const [team, setTeam] = useState<TeamMember[]>(
    () => safeRead<TeamMember[] | null>(KEY_TEAM, null) || DEFAULT_TEAM
  )

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY_SPEAKERS)
        setSpeakers(safeRead<Speaker[] | null>(KEY_SPEAKERS, null) || DEFAULT_SPEAKERS)
      if (e.key === KEY_RESIDENTS)
        setResidents(safeRead<Resident[] | null>(KEY_RESIDENTS, null) || DEFAULT_RESIDENTS)
      if (e.key === KEY_PARTNERS)
        setPartners(safeRead<Partner[] | null>(KEY_PARTNERS, null) || DEFAULT_PARTNERS)
      if (e.key === KEY_TEAM)
        setTeam(safeRead<TeamMember[] | null>(KEY_TEAM, null) || DEFAULT_TEAM)
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const persistSpeakers = useCallback((next: Speaker[]) => {
    safeWrite(KEY_SPEAKERS, next)
    setSpeakers(next)
  }, [])
  const persistResidents = useCallback((next: Resident[]) => {
    safeWrite(KEY_RESIDENTS, next)
    setResidents(next)
  }, [])
  const persistPartners = useCallback((next: Partner[]) => {
    safeWrite(KEY_PARTNERS, next)
    setPartners(next)
  }, [])
  const persistTeam = useCallback((next: TeamMember[]) => {
    safeWrite(KEY_TEAM, next)
    setTeam(next)
  }, [])

  const value = useMemo<DirectoryContextType>(
    () => ({
      speakers,
      residents,
      partners,
      addSpeaker: (data) => {
        const item: Speaker = { ...data, id: genId("speaker") }
        persistSpeakers([item, ...speakers])
        return item
      },
      updateSpeaker: (id, patch) => {
        persistSpeakers(speakers.map((s) => (s.id === id ? { ...s, ...patch } : s)))
      },
      deleteSpeaker: (id) => {
        persistSpeakers(speakers.filter((s) => s.id !== id))
      },
      resetSpeakers: () => persistSpeakers(DEFAULT_SPEAKERS),

      addResident: (data) => {
        const item: Resident = { ...data, id: genId("resident") }
        persistResidents([item, ...residents])
        return item
      },
      updateResident: (id, patch) => {
        persistResidents(residents.map((r) => (r.id === id ? { ...r, ...patch } : r)))
      },
      deleteResident: (id) => {
        persistResidents(residents.filter((r) => r.id !== id))
      },
      resetResidents: () => persistResidents(DEFAULT_RESIDENTS),

      addPartner: (data) => {
        const item: Partner = { ...data, id: genId("partner") }
        persistPartners([item, ...partners])
        return item
      },
      updatePartner: (id, patch) => {
        persistPartners(partners.map((p) => (p.id === id ? { ...p, ...patch } : p)))
      },
      deletePartner: (id) => {
        persistPartners(partners.filter((p) => p.id !== id))
      },
      resetPartners: () => persistPartners(DEFAULT_PARTNERS),

      team,
      addTeamMember: (data) => {
        const item: TeamMember = { ...data, id: genId("team") }
        persistTeam([...team, item])
        return item
      },
      updateTeamMember: (id, patch) => {
        persistTeam(team.map((m) => (m.id === id ? { ...m, ...patch } : m)))
      },
      deleteTeamMember: (id) => {
        persistTeam(team.filter((m) => m.id !== id))
      },
      reorderTeam: (id, direction) => {
        const idx = team.findIndex((m) => m.id === id)
        if (idx < 0) return
        const target = direction === "up" ? idx - 1 : idx + 1
        if (target < 0 || target >= team.length) return
        const next = [...team]
        ;[next[idx], next[target]] = [next[target], next[idx]]
        persistTeam(next)
      },
      resetTeam: () => persistTeam(DEFAULT_TEAM),
    }),
    [
      speakers,
      residents,
      partners,
      team,
      persistSpeakers,
      persistResidents,
      persistPartners,
      persistTeam,
    ]
  )

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>
}

export const useDirectory = () => {
  const ctx = useContext(DirectoryContext)
  if (!ctx) throw new Error("useDirectory must be used inside DirectoryProvider")
  return ctx
}