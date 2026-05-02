import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useEventSuggestions } from "@/contexts/EventSuggestionsContext"
import { CATEGORIES } from "@/data/events"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const FORMATS = [
  "Лекция",
  "Мастер-класс",
  "Воркшоп",
  "Круг поддержки",
  "Вечеринка",
  "Игра",
  "Прогулка / выезд",
  "Ужин",
  "Другое",
]

export default function SuggestEventModal({ open, onOpenChange }: Props) {
  const { user } = useAuth()
  const { addSuggestion } = useEventSuggestions()

  const [authorName, setAuthorName] = useState("")
  const [contact, setContact] = useState("")
  const [category, setCategory] = useState<string>(CATEGORIES[0]?.name || "")
  const [format, setFormat] = useState<string>(FORMATS[0])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [willAttend, setWillAttend] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (user) {
      setAuthorName(`${user.firstName} ${user.lastName}`.trim())
      setContact(user.email || user.phone || "")
    }
  }, [open, user])

  const reset = () => {
    setTitle("")
    setDescription("")
    setPreferredDate("")
    setFormat(FORMATS[0])
    setCategory(CATEGORIES[0]?.name || "")
    setWillAttend(true)
    if (!user) {
      setAuthorName("")
      setContact("")
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !contact.trim() || !title.trim() || !description.trim()) {
      toast.error("Заполни все обязательные поля")
      return
    }
    setSubmitting(true)
    addSuggestion({
      authorEmail: user?.email,
      authorName: authorName.trim(),
      contact: contact.trim(),
      category,
      title: title.trim(),
      description: description.trim(),
      format,
      preferredDate: preferredDate || undefined,
      willAttend,
    })
    setSubmitting(false)
    toast.success("Спасибо! Команда клуба рассмотрит твою идею.", {
      description: "Если она наберёт голоса — мы обязательно её проведём.",
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white items-center justify-center">
              <Icon name="Lightbulb" size={18} />
            </span>
            <DialogTitle
              className="text-2xl"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Предложить мероприятие
            </DialogTitle>
          </div>
          <DialogDescription>
            Поделись идеей встречи, на которую хотела бы попасть. Лучшие предложения мы
            проводим вместе.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sgName">Имя*</Label>
              <Input
                id="sgName"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Анна"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sgContact">Контакт*</Label>
              <Input
                id="sgContact"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email или телефон"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sgTitle">Идея / тема*</Label>
            <Input
              id="sgTitle"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: вечер винной дегустации"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Направление</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="Другое">Другое</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Формат</Label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sgDesc">Опиши идею*</Label>
            <Textarea
              id="sgDesc"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Что хочешь увидеть, что сделать, кого пригласить, какая атмосфера..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sgDate">Желаемая дата (необязательно)</Label>
            <Input
              id="sgDate"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={willAttend}
              onChange={(e) => setWillAttend(e.target.checked)}
              className="mt-1 accent-pink-600"
            />
            <span className="text-sm text-black/70">
              Я готова прийти, если эту встречу проведут
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-sm uppercase tracking-[0.2em] hover:opacity-95 transition-opacity disabled:opacity-60"
          >
            <Icon name="Send" size={16} />
            Отправить идею
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
