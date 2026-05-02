import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { CATEGORIES as BASE_CATEGORIES } from "@/data/events"

export interface CategoryItem {
  name: string
  icon: string
  color: string
  builtIn?: boolean
}

const KEY_CUSTOM = "mojno_categories_custom"
const KEY_OVERRIDES = "mojno_categories_overrides"
const KEY_DELETED = "mojno_categories_deleted"
const KEY_RENAMES = "mojno_categories_renames"

type Override = { icon?: string; color?: string }
type RenameMap = Record<string, string>

const COLOR_PRESETS = [
  "from-amber-400 to-pink-500",
  "from-rose-400 to-fuchsia-500",
  "from-slate-500 to-slate-700",
  "from-pink-400 to-rose-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-400 to-purple-500",
  "from-purple-400 to-pink-400",
  "from-sky-400 to-indigo-500",
  "from-orange-400 to-red-500",
  "from-lime-400 to-emerald-500",
  "from-violet-500 to-fuchsia-600",
  "from-stone-500 to-stone-700",
]

const ICON_PRESETS = [
  "Dices",
  "Flower2",
  "Briefcase",
  "Camera",
  "Dumbbell",
  "Shirt",
  "Brain",
  "Heart",
  "Coffee",
  "Music",
  "Mic",
  "Palette",
  "Sparkles",
  "BookOpen",
  "Wine",
  "Gift",
  "Globe",
  "Star",
  "Smile",
  "Lightbulb",
]

export const CATEGORY_PRESETS = { colors: COLOR_PRESETS, icons: ICON_PRESETS }

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const safeWrite = (key: string, data: unknown) =>
  localStorage.setItem(key, JSON.stringify(data))

interface CategoriesContextType {
  categories: CategoryItem[]
  addCategory: (data: { name: string; icon: string; color: string }) => boolean
  updateCategory: (
    name: string,
    patch: { newName?: string; icon?: string; color?: string }
  ) => boolean
  deleteCategory: (name: string) => boolean
  resetAll: () => void
  presets: typeof CATEGORY_PRESETS
}

const CategoriesContext = createContext<CategoriesContextType | null>(null)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = useState<CategoryItem[]>([])
  const [overrides, setOverrides] = useState<Record<string, Override>>({})
  const [deleted, setDeleted] = useState<string[]>([])
  const [renames, setRenames] = useState<RenameMap>({})

  useEffect(() => {
    setCustom(safeRead<CategoryItem[]>(KEY_CUSTOM, []))
    setOverrides(safeRead<Record<string, Override>>(KEY_OVERRIDES, {}))
    setDeleted(safeRead<string[]>(KEY_DELETED, []))
    setRenames(safeRead<RenameMap>(KEY_RENAMES, {}))
  }, [])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY_CUSTOM) setCustom(safeRead<CategoryItem[]>(KEY_CUSTOM, []))
      if (e.key === KEY_OVERRIDES)
        setOverrides(safeRead<Record<string, Override>>(KEY_OVERRIDES, {}))
      if (e.key === KEY_DELETED) setDeleted(safeRead<string[]>(KEY_DELETED, []))
      if (e.key === KEY_RENAMES) setRenames(safeRead<RenameMap>(KEY_RENAMES, {}))
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const categories = useMemo<CategoryItem[]>(() => {
    const built = BASE_CATEGORIES
      .filter((c) => !deleted.includes(c.name))
      .map((c) => {
        const ov = overrides[c.name]
        const newName = renames[c.name] || c.name
        return {
          name: newName,
          icon: ov?.icon || c.icon,
          color: ov?.color || c.color,
          builtIn: true,
        }
      })
    return [...built, ...custom.map((c) => ({ ...c, builtIn: false }))]
  }, [custom, overrides, deleted, renames])

  const persistCustom = useCallback((next: CategoryItem[]) => {
    safeWrite(KEY_CUSTOM, next)
    setCustom(next)
  }, [])

  const persistOverrides = useCallback((next: Record<string, Override>) => {
    safeWrite(KEY_OVERRIDES, next)
    setOverrides(next)
  }, [])

  const persistDeleted = useCallback((next: string[]) => {
    safeWrite(KEY_DELETED, next)
    setDeleted(next)
  }, [])

  const persistRenames = useCallback((next: RenameMap) => {
    safeWrite(KEY_RENAMES, next)
    setRenames(next)
  }, [])

  const addCategory: CategoriesContextType["addCategory"] = (data) => {
    const name = data.name.trim()
    if (!name) return false
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return false
    persistCustom([
      ...custom,
      { name, icon: data.icon || "Sparkles", color: data.color || COLOR_PRESETS[0] },
    ])
    return true
  }

  const updateCategory: CategoriesContextType["updateCategory"] = (name, patch) => {
    // Find which kind: custom (raw name in custom array) OR built-in (raw name in BASE_CATEGORIES, possibly under rename)
    const customIdx = custom.findIndex((c) => c.name === name)
    if (customIdx >= 0) {
      const next = [...custom]
      const newName = patch.newName?.trim() || next[customIdx].name
      if (
        newName.toLowerCase() !== next[customIdx].name.toLowerCase() &&
        categories.some((c) => c.name.toLowerCase() === newName.toLowerCase())
      )
        return false
      next[customIdx] = {
        ...next[customIdx],
        name: newName,
        icon: patch.icon || next[customIdx].icon,
        color: patch.color || next[customIdx].color,
      }
      persistCustom(next)
      return true
    }
    // Built-in: find original key
    const baseEntry = BASE_CATEGORIES.find((c) => (renames[c.name] || c.name) === name)
    if (!baseEntry) return false
    const originalKey = baseEntry.name
    if (patch.icon || patch.color) {
      const ov: Override = { ...overrides[originalKey] }
      if (patch.icon) ov.icon = patch.icon
      if (patch.color) ov.color = patch.color
      persistOverrides({ ...overrides, [originalKey]: ov })
    }
    if (patch.newName && patch.newName.trim() !== name) {
      const newName = patch.newName.trim()
      if (categories.some((c) => c.name.toLowerCase() === newName.toLowerCase()))
        return false
      persistRenames({ ...renames, [originalKey]: newName })
    }
    return true
  }

  const deleteCategory: CategoriesContextType["deleteCategory"] = (name) => {
    const customIdx = custom.findIndex((c) => c.name === name)
    if (customIdx >= 0) {
      persistCustom(custom.filter((_, i) => i !== customIdx))
      return true
    }
    const baseEntry = BASE_CATEGORIES.find((c) => (renames[c.name] || c.name) === name)
    if (!baseEntry) return false
    if (!deleted.includes(baseEntry.name)) {
      persistDeleted([...deleted, baseEntry.name])
    }
    return true
  }

  const resetAll: CategoriesContextType["resetAll"] = () => {
    persistCustom([])
    persistOverrides({})
    persistDeleted([])
    persistRenames({})
  }

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        resetAll,
        presets: CATEGORY_PRESETS,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}

export const useCategories = () => {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error("useCategories must be used inside CategoriesProvider")
  return ctx
}
