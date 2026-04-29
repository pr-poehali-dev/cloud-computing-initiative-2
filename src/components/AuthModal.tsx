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
import { useAuth, isTeamInviteCode } from "@/contexts/AuthContext"

export type AuthMode = "login" | "register"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialMode?: AuthMode
  onSuccess?: () => void
}

export default function AuthModal({ open, onOpenChange, initialMode = "login", onSuccess }: Props) {
  const { login, register, findInviterName } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [submitting, setSubmitting] = useState(false)
  const [refCode, setRefCode] = useState<string>("")
  const [inviterName, setInviterName] = useState<string | null>(null)
  const [teamCode, setTeamCode] = useState<string>("")
  const isTeamCode = isTeamInviteCode(teamCode)

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Register state
  const [reg, setReg] = useState({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
    email: "",
    password: "",
    interests: "",
    expectations: "",
    source: "",
  })

  useEffect(() => {
    if (open) setMode(initialMode)
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
    setReg({ firstName: "", lastName: "", age: "", phone: "", email: "", password: "", interests: "", expectations: "", source: "" })
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
    setSubmitting(true)
    const codeToSend = teamCode.trim() || refCode || undefined
    const res = await register({ ...reg, referralCode: codeToSend })
    setSubmitting(false)
    if (res.ok) {
      if (isTeamCode) {
        toast.success("Добро пожаловать в команду клуба «МОЖНО»!", {
          description: "Расширенный функционал уже доступен в личном кабинете.",
        })
      } else if (inviterName) {
        toast.success(`Добро пожаловать! Подруге ${inviterName} начислены бонусы.`)
      } else {
        toast.success("Анкета принята! Добро пожаловать в клуб.")
      }
      localStorage.removeItem("mojno_pending_ref")
      setRefCode("")
      setTeamCode("")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase tracking-[0.2em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            {mode === "login" ? "Вход в клуб" : "Анкета участницы"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" ? "Войди, чтобы попасть в личный кабинет." : "Расскажи о себе — и стань частью клуба."}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-full bg-black/5 mt-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full text-sm uppercase tracking-[0.2em] transition-all ${mode === "login" ? "bg-black text-white" : "text-black/60"}`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-full text-sm uppercase tracking-[0.2em] transition-all ${mode === "register" ? "bg-black text-white" : "text-black/60"}`}
          >
            Регистрация
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="loginEmail">Email</Label>
              <Input id="loginEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loginPassword">Пароль</Label>
              <Input id="loginPassword" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-black text-white text-sm uppercase tracking-[0.2em] hover:bg-black/85 transition-colors disabled:opacity-60">
              <Icon name="LogIn" size={16} />
              Войти
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 pt-3">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rFirst">Имя</Label>
                <Input id="rFirst" required value={reg.firstName} onChange={upd("firstName")} placeholder="Анна" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rLast">Фамилия</Label>
                <Input id="rLast" required value={reg.lastName} onChange={upd("lastName")} placeholder="Иванова" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rAge">Возраст</Label>
                <Input id="rAge" type="number" min={16} max={99} required value={reg.age} onChange={upd("age")} placeholder="28" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rPhone">Телефон</Label>
                <Input id="rPhone" type="tel" required value={reg.phone} onChange={upd("phone")} placeholder="+7 (___) ___-__-__" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rEmail">Email</Label>
              <Input id="rEmail" type="email" required value={reg.email} onChange={upd("email")} placeholder="you@example.com" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rPassword">Пароль</Label>
              <Input id="rPassword" type="password" required minLength={6} value={reg.password} onChange={upd("password")} placeholder="Минимум 6 символов" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rInterests">Интересы</Label>
              <Textarea id="rInterests" required rows={2} value={reg.interests} onChange={upd("interests")} placeholder="Бизнес, искусство, психология…" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rExpect">Что хотите получить от клуба?</Label>
              <Textarea id="rExpect" required rows={2} value={reg.expectations} onChange={upd("expectations")} placeholder="Окружение, новые знакомства, развитие…" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rSource">Откуда узнали о клубе?</Label>
              <Input id="rSource" required value={reg.source} onChange={upd("source")} placeholder="Instagram, подруга, мероприятие…" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rTeam" className="flex items-center gap-1.5">
                <Icon name="Crown" size={13} className="text-amber-500" />
                Код приглашения команды
                <span className="text-black/40 text-[11px] font-normal">— если есть</span>
              </Label>
              <Input
                id="rTeam"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="MOZHNO-…"
                className={isTeamCode ? "border-amber-400 focus-visible:ring-amber-300" : ""}
              />
              {isTeamCode && (
                <div className="rounded-xl bg-gradient-to-r from-amber-50 via-pink-50 to-fuchsia-50 border border-amber-200 px-3 py-2 flex items-center gap-2 text-xs text-black/75">
                  <Icon name="Crown" size={14} className="text-amber-500 flex-shrink-0" />
                  Код подтверждён — после регистрации ты попадёшь в команду клуба с расширенным доступом.
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting} className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm uppercase tracking-[0.2em] transition-colors disabled:opacity-60 ${isTeamCode ? "bg-gradient-to-r from-amber-500 via-pink-500 to-fuchsia-600 text-white hover:opacity-95" : "bg-black text-white hover:bg-black/85"}`}>
              <Icon name={isTeamCode ? "Crown" : "Sparkles"} size={16} />
              {isTeamCode ? "Войти в команду клуба" : "Стать участницей"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}