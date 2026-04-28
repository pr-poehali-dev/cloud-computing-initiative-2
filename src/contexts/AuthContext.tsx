import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export interface User {
  firstName: string
  lastName: string
  email: string
  phone: string
  age?: string
  interests?: string
  expectations?: string
  source?: string
  joinedAt: string
  referralCode: string
  referredBy?: string
  invitedCount: number
  points: number
}

export const REFERRAL_BONUS = 100

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (
    data: Omit<User, "joinedAt" | "referralCode" | "invitedCount" | "points" | "referredBy"> & {
      password: string
      referralCode?: string
    }
  ) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
  findInviterName: (code: string) => string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_USERS = "mojno_users"
const STORAGE_SESSION = "mojno_session"

interface StoredUser extends User {
  password: string
}

const readUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]")
  } catch {
    return []
  }
}

const writeUsers = (users: StoredUser[]) => {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users))
}

const generateReferralCode = (firstName: string) => {
  const base = (firstName || "club")
    .toLowerCase()
    .replace(/[^a-zа-я0-9]/gi, "")
    .slice(0, 6) || "club"
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}-${suffix}`
}

const ensureUserDefaults = (u: StoredUser): StoredUser => ({
  ...u,
  referralCode: u.referralCode || generateReferralCode(u.firstName),
  invitedCount: typeof u.invitedCount === "number" ? u.invitedCount : 0,
  points: typeof u.points === "number" ? u.points : 0,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Migrate stored users (ensure all have referralCode, invitedCount, points)
    const stored = readUsers()
    if (stored.length > 0) {
      const migrated = stored.map(ensureUserDefaults)
      writeUsers(migrated)
    }
    const session = localStorage.getItem(STORAGE_SESSION)
    if (session) {
      try {
        const parsed = JSON.parse(session)
        const users = readUsers()
        const fresh = users.find((u) => u.email === parsed.email)
        if (fresh) {
          const { password: _pw, ...safe } = ensureUserDefaults(fresh)
          setUser(safe)
          localStorage.setItem(STORAGE_SESSION, JSON.stringify(safe))
        } else {
          setUser(parsed)
        }
      } catch {
        localStorage.removeItem(STORAGE_SESSION)
      }
    }
  }, [])

  const login: AuthContextType["login"] = async (email, password) => {
    const users = readUsers()
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) return { ok: false, error: "Неверный email или пароль" }
    const ensured = ensureUserDefaults(found)
    const { password: _pw, ...safe } = ensured
    setUser(safe)
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(safe))
    return { ok: true }
  }

  const register: AuthContextType["register"] = async (data) => {
    const users = readUsers()
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "Пользователь с таким email уже существует" }
    }

    // Find inviter by referral code
    const refCode = data.referralCode?.trim()
    let inviterEmail: string | undefined
    if (refCode) {
      const inviter = users.find(
        (u) => (u.referralCode || "").toLowerCase() === refCode.toLowerCase()
      )
      if (inviter) inviterEmail = inviter.email
    }

    const { password, referralCode: _rc, ...rest } = data
    const newUser: StoredUser = {
      ...rest,
      password,
      joinedAt: new Date().toISOString(),
      referralCode: generateReferralCode(rest.firstName),
      referredBy: inviterEmail,
      invitedCount: 0,
      points: 0,
    }

    const next = [...users, newUser]

    // Award bonus to inviter
    if (inviterEmail) {
      const idx = next.findIndex((u) => u.email === inviterEmail)
      if (idx >= 0) {
        const inv = ensureUserDefaults(next[idx])
        next[idx] = {
          ...inv,
          invitedCount: (inv.invitedCount || 0) + 1,
          points: (inv.points || 0) + REFERRAL_BONUS,
        }
      }
    }

    writeUsers(next)
    const { password: _pw, ...safe } = newUser
    setUser(safe)
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(safe))
    return { ok: true }
  }

  const findInviterName: AuthContextType["findInviterName"] = (code) => {
    const trimmed = code.trim()
    if (!trimmed) return null
    const users = readUsers()
    const inv = users.find(
      (u) => (u.referralCode || "").toLowerCase() === trimmed.toLowerCase()
    )
    return inv ? `${inv.firstName} ${inv.lastName}`.trim() : null
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_SESSION)
  }

  const updateProfile = (patch: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...patch }
    setUser(updated)
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(updated))
    const users = readUsers()
    const idx = users.findIndex((u) => u.email === user.email)
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...patch }
      writeUsers(users)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile, findInviterName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}