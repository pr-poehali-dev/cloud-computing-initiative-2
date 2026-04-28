import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function HeroContent() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
    interests: "",
    expectations: "",
    source: "",
  })

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Заявка отправлена! Мы свяжемся с тобой в ближайшее время.")
    setOpen(false)
    setForm({ firstName: "", lastName: "", age: "", phone: "", interests: "", expectations: "", source: "" })
  }

  return (
    <>
      <main className="absolute inset-0 z-20 flex flex-col items-center text-center px-6 pb-[6vh]" style={{ paddingTop: "22vh" }}>
        {/* Tagline plate */}
        <div className="mb-3 px-7 py-2.5 rounded-full border border-white/30 bg-black/45 backdrop-blur-md fade-in-up">
          <span
            className="text-white uppercase block"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 200,
              fontSize: "clamp(0.7rem, 1.1vw, 0.95rem)",
              letterSpacing: "0.4em",
            }}
          >
            Каждой женщине всё
          </span>
        </div>

        {/* Logo / Club Name — placed right under the tagline */}
        <div className="fade-in-up-delay w-full flex justify-center overflow-hidden">
          <h1
            className="leading-none uppercase shine-text inline-block"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "clamp(3rem, 16vw, 99vw)",
              letterSpacing: "0.25em",
              paddingLeft: "0.25em",
              filter: "drop-shadow(0 2px 40px rgba(0,0,0,0.18))",
              whiteSpace: "nowrap",
            }}
          >
            МОЖНО
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-5 flex-wrap justify-center mt-auto">
          <div className="relative inline-flex items-center justify-center">
            <div aria-hidden className="absolute -inset-3 rounded-full pointer-events-none join-soft-glow" />
            <div aria-hidden className="absolute -inset-[3px] rounded-full pointer-events-none pink-shimmer-border" />
            <button className="relative z-10 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase">
              Мероприятия
            </button>
          </div>

          <div className="relative inline-flex items-center justify-center">
            <div aria-hidden className="absolute -inset-3 rounded-full pointer-events-none join-soft-glow" />
            <div aria-hidden className="absolute -inset-[3px] rounded-full pointer-events-none pink-shimmer-border" />
            <button
              onClick={() => setOpen(true)}
              className="relative z-10 px-12 py-5 rounded-full bg-white/95 backdrop-blur-sm text-black font-normal text-sm transition-all duration-200 hover:bg-white cursor-pointer tracking-[0.25em] uppercase"
            >
              Вступить в клуб
            </button>
          </div>
        </div>
      </main>

      {/* Application form modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl uppercase tracking-[0.2em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              Анкета участницы
            </DialogTitle>
            <DialogDescription>
              Расскажи немного о себе — мы свяжемся с тобой в ближайшее время.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Имя</Label>
                <Input id="firstName" required value={form.firstName} onChange={update("firstName")} placeholder="Анна" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input id="lastName" required value={form.lastName} onChange={update("lastName")} placeholder="Иванова" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="age">Возраст</Label>
                <Input id="age" type="number" min={16} max={99} required value={form.age} onChange={update("age")} placeholder="28" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={update("phone")} placeholder="+7 (___) ___-__-__" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interests">Интересы</Label>
              <Textarea id="interests" required value={form.interests} onChange={update("interests")} placeholder="Бизнес, искусство, психология, путешествия…" rows={2} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expectations">Что хотите получить от клуба?</Label>
              <Textarea id="expectations" required value={form.expectations} onChange={update("expectations")} placeholder="Окружение, новые знакомства, развитие…" rows={2} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="source">Откуда узнали о клубе?</Label>
              <Input id="source" required value={form.source} onChange={update("source")} placeholder="Instagram, подруга, мероприятие…" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full uppercase tracking-[0.2em] rounded-full py-6 bg-black hover:bg-black/85 text-white">
                Отправить заявку
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
