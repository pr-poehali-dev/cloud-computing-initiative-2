import { Dialog, DialogContent } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PartnerFormState } from "./partnershipData"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  form: PartnerFormState
  onChange: <K extends keyof PartnerFormState>(key: K, value: PartnerFormState[K]) => void
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
}

export default function PartnershipFormDialog({
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  submitting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white px-7 py-6">
          <div className="text-[11px] uppercase tracking-[0.28em] opacity-90 mb-2">
            Анкета партнёра
          </div>
          <h3
            className="text-2xl md:text-3xl leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Расскажи о партнёрском предложении
          </h3>
          <p className="text-sm opacity-90 mt-2">
            Заявка попадёт администратору клуба. Мы свяжемся в течение 1–2 рабочих дней.
          </p>
        </div>

        <form onSubmit={onSubmit} className="overflow-y-auto flex-1 px-7 py-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
              Компания / бренд *
            </label>
            <Input
              value={form.company}
              onChange={(e) => onChange("company", e.target.value)}
              placeholder="Название"
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Контактное лицо *
              </label>
              <Input
                value={form.contactName}
                onChange={(e) => onChange("contactName", e.target.value)}
                placeholder="Имя и фамилия"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Телефон *
              </label>
              <Input
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="+7 ..."
                required
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="company@mail.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
                Сфера / категория
              </label>
              <Input
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                placeholder="Спа, ресторан, бренд..."
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
              Желаемый формат / бюджет
            </label>
            <Input
              value={form.budget}
              onChange={(e) => onChange("budget", e.target.value)}
              placeholder="Базовый / Премиум / индивидуально"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.22em] text-black/60 mb-1.5">
              Партнёрское предложение
            </label>
            <Textarea
              value={form.message}
              onChange={(e) => onChange("message", e.target.value)}
              rows={5}
              placeholder="Опиши, что вы готовы предложить клубу и резиденткам, какие коллаборации интересны."
            />
          </div>

          <div className="text-[11px] text-black/50 leading-relaxed">
            Нажимая кнопку, ты соглашаешься на обработку контактных данных для связи по
            партнёрскому предложению.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:opacity-95 disabled:opacity-60 text-white px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-opacity"
          >
            {submitting ? (
              <>
                <Icon name="Loader2" size={14} className="animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                <Icon name="Send" size={14} />
                Отправить заявку администратору
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
