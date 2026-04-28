import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const PRESETS = [1000, 3000, 5000, 10000]

type Tab = "self" | "gift"

export default function TopUpModal({ open, onOpenChange }: Props) {
  const { user, topUpBalance, topUpBalanceForCode } = useAuth()
  const [tab, setTab] = useState<Tab>("self")
  const [amount, setAmount] = useState<string>("3000")
  const [giftCode, setGiftCode] = useState("")

  // Pre-fill from pending gift (when user came via ?gift=... link)
  useEffect(() => {
    if (!open) return
    try {
      const params = new URLSearchParams(window.location.search)
      const fromUrl = params.get("gift")
      const stored = localStorage.getItem("mojno_pending_gift")
      const code = fromUrl || stored
      if (code) {
        setGiftCode(code)
        setTab("gift")
        if (fromUrl) localStorage.setItem("mojno_pending_gift", fromUrl)
      }
    } catch {
      /* ignore */
    }
  }, [open])

  if (!user) return null

  const giftLink = `${window.location.origin}/?gift=${user.referralCode}`

  const copyGiftLink = async () => {
    try {
      await navigator.clipboard.writeText(giftLink)
      toast.success("Ссылка для подарка скопирована!")
    } catch {
      toast.error("Не удалось скопировать")
    }
  }

  const shareGiftLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Подари баланс в клубе «МОЖНО»",
          text: "Можешь пополнить мой баланс в клубе по ссылке",
          url: giftLink,
        })
      } catch {
        /* cancelled */
      }
    } else {
      copyGiftLink()
    }
  }

  const handleTopUpSelf = () => {
    const num = Number(amount)
    if (!num || num <= 0) {
      toast.error("Введи сумму")
      return
    }
    topUpBalance(num)
    toast.success(`Баланс пополнен на ${num.toLocaleString("ru-RU")} ₽`)
    onOpenChange(false)
  }

  const handleSendGift = () => {
    const num = Number(amount)
    if (!num || num <= 0) {
      toast.error("Введи сумму")
      return
    }
    if (!giftCode.trim()) {
      toast.error("Вставь ссылку или код подруги")
      return
    }
    // Extract code from full URL or use as is
    let code = giftCode.trim()
    const giftMatch = code.match(/[?&]gift=([^&]+)/)
    const refMatch = code.match(/[?&]ref=([^&]+)/)
    if (giftMatch) code = decodeURIComponent(giftMatch[1])
    else if (refMatch) code = decodeURIComponent(refMatch[1])

    const res = topUpBalanceForCode(code, num)
    if (!res.ok) {
      toast.error(res.error || "Не удалось пополнить")
      return
    }
    toast.success(`${res.recipientName} получит +${num.toLocaleString("ru-RU")} ₽`)
    localStorage.removeItem("mojno_pending_gift")
    setGiftCode("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle
            className="text-2xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Пополнить баланс
          </DialogTitle>
          <DialogDescription>
            Себе — для записи на мероприятия. Или подари баланс подруге.
          </DialogDescription>
        </DialogHeader>

        {/* Current balance */}
        <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-pink-700">
              Твой баланс
            </div>
            <div className="text-2xl font-semibold text-black mt-0.5">
              {(user.balance || 0).toLocaleString("ru-RU")} ₽
            </div>
          </div>
          <Icon name="Wallet" size={28} className="text-pink-600" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-full bg-black/5">
          <button
            type="button"
            onClick={() => setTab("self")}
            className={`flex-1 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all ${
              tab === "self" ? "bg-black text-white" : "text-black/60"
            }`}
          >
            Себе
          </button>
          <button
            type="button"
            onClick={() => setTab("gift")}
            className={`flex-1 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all ${
              tab === "gift" ? "bg-black text-white" : "text-black/60"
            }`}
          >
            Подарок подруге
          </button>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className={`py-2.5 rounded-xl text-sm transition-colors ${
                Number(amount) === p
                  ? "bg-pink-600 text-white"
                  : "bg-black/5 text-black/70 hover:bg-black/10"
              }`}
            >
              {p.toLocaleString("ru-RU")} ₽
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Сумма, ₽</Label>
          <Input
            id="amount"
            type="number"
            min={100}
            step={100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {tab === "self" ? (
          <>
            <button
              onClick={handleTopUpSelf}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-sm uppercase tracking-[0.2em] transition-colors"
            >
              <Icon name="CreditCard" size={16} />
              Пополнить
            </button>

            <div className="rounded-2xl border border-dashed border-pink-300 p-4 bg-pink-50/40">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Gift" size={14} className="text-pink-600" />
                <div className="text-[11px] uppercase tracking-[0.18em] text-pink-700">
                  Хочешь, чтобы кто-то пополнил твой баланс?
                </div>
              </div>
              <p className="text-xs text-black/65 mb-3 leading-relaxed">
                Отправь подруге ссылку — она сможет пополнить твой баланс в подарок.
              </p>
              <div className="flex items-center gap-2 bg-white rounded-full border border-pink-200 px-4 py-2 mb-2">
                <Icon name="Link" size={12} className="text-pink-600 flex-shrink-0" />
                <input
                  readOnly
                  value={giftLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 bg-transparent text-xs text-black/80 outline-none truncate min-w-0"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyGiftLink}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] uppercase tracking-[0.18em]"
                >
                  <Icon name="Copy" size={12} />
                  Скопировать
                </button>
                <button
                  onClick={shareGiftLink}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-pink-300 text-pink-700 hover:bg-pink-100 text-[11px] uppercase tracking-[0.18em]"
                >
                  <Icon name="Share2" size={12} />
                  Поделиться
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="giftCode">Ссылка или код подруги</Label>
              <Input
                id="giftCode"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                placeholder="https://...?gift=код или сам код"
              />
              <p className="text-[11px] text-black/55">
                Попроси подругу прислать тебе её ссылку из личного кабинета.
              </p>
            </div>
            <button
              onClick={handleSendGift}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-sm uppercase tracking-[0.2em] transition-colors"
            >
              <Icon name="Gift" size={16} />
              Подарить
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}