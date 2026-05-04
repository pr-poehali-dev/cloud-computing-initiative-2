import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Icon from "@/components/ui/icon"
import { toast } from "sonner"
import {
  useAuth,
  isTeamInviteCode,
  isBloggerCode,
  UserRole,
  STARTUP_BONUS,
  BLOGGER_BONUS,
} from "@/contexts/AuthContext"

export type AuthMode = "login" | "register"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialMode?: AuthMode
  onSuccess?: () => void
}

type RegRole = Exclude<UserRole, undefined>

const ROLE_CARDS: {
  id: RegRole
  title: string
  subtitle: string
  icon: string
  gradient: string
  bonus: string
  needsCode?: boolean
  badge?: string
}[] = [
  {
    id: "member",
    title: "Участница клуба",
    subtitle: "Стандартная регистрация",
    icon: "Heart",
    gradient: "from-pink-400 to-rose-500",
    bonus: `+${STARTUP_BONUS} стартовых баллов`,
  },
  {
    id: "resident",
    title: "Резидент клуба",
    subtitle: "Особый статус и значок резидента",
    icon: "Gem",
    gradient: "from-fuchsia-500 to-purple-600",
    bonus: `+${STARTUP_BONUS} баллов · значок резидента`,
    badge: "Резидент",
  },
  {
    id: "blogger",
    title: "Блогер",
    subtitle: "По коду от команды клуба",
    icon: "Camera",
    gradient: "from-amber-400 via-pink-500 to-fuchsia-500",
    bonus: `+${BLOGGER_BONUS.toLocaleString("ru-RU")} баллов · значок блогера`,
    needsCode: true,
    badge: "Блогер",
  },
  {
    id: "team",
    title: "Команда клуба",
    subtitle: "По служебному коду",
    icon: "Crown",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    bonus: `+${STARTUP_BONUS} баллов · значок команды`,
    needsCode: true,
    badge: "Команда",
  },
]

export default function AuthModal({ open, onOpenChange, initialMode = "login", onSuccess }: Props) {
  const { login, register, findInviterName } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [submitting, setSubmitting] = useState(false)
  const [refCode, setRefCode] = useState<string>("")
  const [inviterName, setInviterName] = useState<string | null>(null)

  // Selected registration role (null = выбор)
  const [selectedRole, setSelectedRole] = useState<RegRole | null>(null)

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Register state
  const [reg, setReg] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    telegram: "",
    phone: "",
    email: "",
    password: "",
    interests: "",
    expectations: "",
    source: "",
  })
  const [accessCode, setAccessCode] = useState("")

  const codeOk =
    selectedRole === "blogger"
      ? isBloggerCode(accessCode)
      : selectedRole === "team"
      ? isTeamInviteCode(accessCode)
      : true

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setSelectedRole(null)
    }
  }, [open, initialMode])

  useEffect(() => {
    if (!open) return
    const params = new URLSearchParams(window.location.search)
    const code = params.get("ref") || localStorage.getItem("mojno_pending_ref") || ""
    if (code) {
      setRefCode(code)
      localStorage.setItem("mojno_pending_ref", code)
      const name = findInviterName(code)
      setInviterName(name)
    }
  }, [open, findInviterName])

  const reset = () => {
    setEmail("")
    setPassword("")
    setReg({
      firstName: "",
      lastName: "",
      birthDate: "",
      telegram: "",
      phone: "",
      email: "",
      password: "",
      interests: "",
      expectations: "",
      source: "",
    })
    setAccessCode("")
    setSelectedRole(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await login(email, password)
    setSubmitting(false)
    if (res.ok) {
      toast.success("Добро пожаловать!")
      reset()
      onOpenChange(false)
      onSuccess?.()
    } else {
      toast.error(res.error || "Не удалось войти")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    if (selectedRole === "blogger" && !isBloggerCode(accessCode)) {
      toast.error("Неверный код блогера. Запроси код в клубе.")
      return
    }
    if (selectedRole === "team" && !isTeamInviteCode(accessCode)) {
      toast.error("Неверный код команды клуба")
      return
    }

    setSubmitting(true)
    const tg = reg.telegram.trim().replace(/^@/, "")
    const res = await register({
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      phone: reg.phone,
      password: reg.password,
      birthDate: reg.birthDate,
      telegram: tg ? `@${tg}` : "",
      interests: reg.interests,
      expectations: reg.expectations,
      source: reg.source,
      referralCode: selectedRole === "team" ? accessCode : refCode || undefined,
      bloggerCode: selectedRole === "blogger" ? accessCode : undefined,
      desiredRole: selectedRole,
    })
    setSubmitting(false)
    if (res.ok) {
      const role = res.role || selectedRole
      if (role === "team") {
        toast.success("Добро пожаловать в команду клуба «МОЖНО»!", {
          description: `Начислено ${res.bonusPoints || 0} стартовых баллов.`,
        })
      } else if (role === "blogger") {
        toast.success("Привет, блогер! Аккаунт создан.", {
          description: `Начислено ${(res.bonusPoints || 0).toLocaleString("ru-RU")} баллов.`,
        })
      } else if (role === "resident") {
        toast.success("Добро пожаловать, резидент!", {
          description: `Начислено ${res.bonusPoints || 0} стартовых баллов.`,
        })
      } else if (inviterName) {
        toast.success(`Добро пожаловать! Подруге ${inviterName} начислены бонусы.`)
      } else {
        toast.success("Анкета принята! Добро пожаловать в клуб.", {
          description: `Начислено ${res.bonusPoints || 0} стартовых баллов.`,
        })
      }
      localStorage.removeItem("mojno_pending_ref")
      setRefCode("")
      setInviterName(null)
      reset()
      onOpenChange(false)
      onSuccess?.()
    } else {
      toast.error(res.error || "Не удалось зарегистрироваться")
    }
  }

  const upd = (k: keyof typeof reg) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setReg((s) => ({ ...s, [k]: e.target.value }))

  const currentRoleCard = ROLE_CARDS.find((r) => r.id === selectedRole)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-2xl uppercase tracking-[0.2em]"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            {mode === "login"
              ? "Вход в клуб"
              : selectedRole
              ? currentRoleCard?.title
              : "Регистрация в клубе"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Войди, чтобы попасть в личный кабинет."
              : selectedRole
              ? "Заполни анкету — это займёт пару минут."
              : "Выбери, кем ты приходишь в клуб."}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-full bg-black/5 mt-2">
          <button
            type="button"
            onClick={() => {
              setMode("login")
              setSelectedRole(null)
            }}
            className={`flex-1 py-2 rounded-full text-sm uppercase tracking-[0.2em] transition-all ${
              mode === "login" ? "bg-black text-white" : "text-black/60"
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-full text-sm uppercase tracking-[0.2em] transition-all ${
              mode === "register" ? "bg-black text-white" : "text-black/60"
            }`}
          >
            Регистрация
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="loginEmail">Email</Label>
              <Input
                id="loginEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loginPassword">Пароль</Label>
              <Input
                id="loginPassword"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-black text-white text-sm uppercase tracking-[0.2em] hover:bg-black/85 transition-colors disabled:opacity-60"
            >
              <Icon name="LogIn" size={16} />
              Войти
            </button>
          </form>
        ) : !selectedRole ? (
          /* Role selector */
          <div className="space-y-3 pt-3">
            {ROLE_CARDS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className="w-full text-left rounded-2xl border border-black/10 bg-white p-4 hover:border-pink-300 hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.gradient} text-white flex items-center justify-center flex-shrink-0`}
                >
                  <Icon name={r.icon} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base text-black/85 flex items-center gap-2">
                    {r.title}
                    {r.badge && (
                      <span className="text-[9px] uppercase tracking-[0.18em] bg-black/5 text-black/60 rounded-full px-2 py-0.5">
                        {r.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-black/55 mt-0.5">{r.subtitle}</div>
                  <div className="text-[11px] text-pink-600 mt-1.5 flex items-center gap-1">
                    <Icon name="Sparkles" size={11} />
                    {r.bonus}
                  </div>
                </div>
                <Icon
                  name="ChevronRight"
                  size={18}
                  className="text-black/30 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                />
              </button>
            ))}
          </div>
        ) : (
          /* Register form */
          <form onSubmit={handleRegister} className="space-y-4 pt-3">
            {/* Selected role banner */}
            <div
              className={`rounded-2xl p-4 bg-gradient-to-r ${currentRoleCard?.gradient} text-white flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon name={currentRoleCard?.icon || "User"} size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] opacity-90">
                    Регистрация
                  </div>
                  <div className="font-medium text-sm">{currentRoleCard?.title}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-white/85 hover:text-white text-[11px] uppercase tracking-[0.18em] underline-offset-2 hover:underline"
              >
                Сменить
              </button>
            </div>

            {inviterName && (
              <div className="rounded-2xl bg-gradient-to-r from-pink-100 to-rose-50 border border-pink-200 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center flex-shrink-0">
                  <Icon name="Gift" size={16} />
                </div>
                <div className="text-sm text-black/80">
                  Тебя пригласила <span className="font-medium">{inviterName}</span>. После регистрации ей упадут бонусные баллы.
                </div>
              </div>
            )}

            {/* Access code (blogger / team) */}
            {(selectedRole === "blogger" || selectedRole === "team") && (
              <div className="space-y-1.5">
                <Label htmlFor="rCode" className="flex items-center gap-1.5">
                  <Icon
                    name={selectedRole === "blogger" ? "Camera" : "Crown"}
                    size={13}
                    className={selectedRole === "blogger" ? "text-fuchsia-500" : "text-amber-500"}
                  />
                  {selectedRole === "blogger" ? "Код блогера" : "Код команды клуба"}
                </Label>
                <Input
                  id="rCode"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Введи код"
                  className={codeOk && accessCode ? "border-pink-400 focus-visible:ring-pink-300" : ""}
                />
                {codeOk && accessCode && (
                  <div className="rounded-xl bg-gradient-to-r from-pink-50 via-fuchsia-50 to-amber-50 border border-pink-200 px-3 py-2 flex items-center gap-2 text-xs text-black/75">
                    <Icon name="CheckCircle2" size={14} className="text-pink-600 flex-shrink-0" />
                    {selectedRole === "blogger"
                      ? `Код подтверждён — после регистрации начислим ${BLOGGER_BONUS.toLocaleString("ru-RU")} баллов.`
                      : "Код подтверждён — попадёшь в команду клуба."}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rFirst">Имя</Label>
                <Input
                  id="rFirst"
                  required
                  value={reg.firstName}
                  onChange={upd("firstName")}
                  placeholder="Анна"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rLast">Фамилия</Label>
                <Input
                  id="rLast"
                  required
                  value={reg.lastName}
                  onChange={upd("lastName")}
                  placeholder="Иванова"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rBirth">Дата рождения</Label>
                <Input
                  id="rBirth"
                  type="date"
                  required
                  value={reg.birthDate}
                  onChange={upd("birthDate")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rPhone">Телефон</Label>
                <Input
                  id="rPhone"
                  type="tel"
                  required
                  value={reg.phone}
                  onChange={upd("phone")}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rTg" className="flex items-center gap-1.5">
                <Icon name="Send" size={13} className="text-sky-500" />
                Telegram (никнейм или ссылка)
              </Label>
              <Input
                id="rTg"
                required
                value={reg.telegram}
                onChange={upd("telegram")}
                placeholder="@username или https://t.me/username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rEmail">Email</Label>
              <Input
                id="rEmail"
                type="email"
                required
                value={reg.email}
                onChange={upd("email")}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rPassword">Пароль</Label>
              <Input
                id="rPassword"
                type="password"
                required
                minLength={6}
                value={reg.password}
                onChange={upd("password")}
                placeholder="Минимум 6 символов"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rInterests">Интересы</Label>
              <Textarea
                id="rInterests"
                rows={2}
                value={reg.interests}
                onChange={upd("interests")}
                placeholder="Бизнес, искусство, психология…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rExpect">Что хотите получить от клуба?</Label>
              <Textarea
                id="rExpect"
                rows={2}
                value={reg.expectations}
                onChange={upd("expectations")}
                placeholder="Окружение, новые знакомства, развитие…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rSource">Откуда узнали о клубе?</Label>
              <Input
                id="rSource"
                value={reg.source}
                onChange={upd("source")}
                placeholder="Instagram, подруга, мероприятие…"
              />
            </div>

            <div className="rounded-xl bg-pink-50 border border-pink-100 px-4 py-3 text-xs text-black/70 flex items-center gap-2">
              <Icon name="Sparkles" size={14} className="text-pink-500 flex-shrink-0" />
              {selectedRole === "blogger"
                ? `Начислим ${BLOGGER_BONUS.toLocaleString("ru-RU")} баллов на старт`
                : `Начислим ${STARTUP_BONUS} стартовых баллов`}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm uppercase tracking-[0.2em] transition-opacity disabled:opacity-60 text-white bg-gradient-to-r ${currentRoleCard?.gradient} hover:opacity-95`}
            >
              <Icon name={currentRoleCard?.icon || "Sparkles"} size={16} />
              {submitting ? "Создаём аккаунт..." : `Стать ${currentRoleCard?.title.toLowerCase()}`}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}