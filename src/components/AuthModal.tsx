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
import { useAuth } from "@/contexts/AuthContext"

export type AuthMode = "login" | "register"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialMode?: AuthMode
  onSuccess?: () => void
}

export default function AuthModal({ open, onOpenChange, initialMode = "login", onSuccess }: Props) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [submitting, setSubmitting] = useState(false)

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
    const res = await register(reg)
    setSubmitting(false)
    if (res.ok) {
      toast.success("Анкета принята! Добро пожаловать в клуб.")
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

            <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-black text-white text-sm uppercase tracking-[0.2em] hover:bg-black/85 transition-colors disabled:opacity-60">
              <Icon name="Sparkles" size={16} />
              Стать участницей
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
