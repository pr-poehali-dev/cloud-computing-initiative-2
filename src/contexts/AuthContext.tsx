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
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (data: Omit<User, "joinedAt"> & { password: string }) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_SESSION)
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch {
        localStorage.removeItem(STORAGE_SESSION)
      }
    }
  }, [])

  const login: AuthContextType["login"] = async (email, password) => {
    const users = readUsers()
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) return { ok: false, error: "Неверный email или пароль" }
    const { password: _pw, ...safe } = found
    setUser(safe)
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(safe))
    return { ok: true }
  }

  const register: AuthContextType["register"] = async (data) => {
    const users = readUsers()
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "Пользователь с таким email уже существует" }
    }
    const newUser: StoredUser = { ...data, joinedAt: new Date().toISOString() }
    writeUsers([...users, newUser])
    const { password: _pw, ...safe } = newUser
    setUser(safe)
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(safe))
    return { ok: true }
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
