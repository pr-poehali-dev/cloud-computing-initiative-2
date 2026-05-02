import { Dialog, DialogContent } from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"
import { PROGRAM_PERKS, TIERS } from "./partnershipData"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onApply: () => void
}

export default function PartnershipPerksDialog({ open, onOpenChange, onApply }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white px-7 py-7">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] mb-3">
            <Icon name="Handshake" size={12} />
            Партнёрская программа
          </div>
          <h3
            className="text-3xl md:text-4xl leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Что получает партнёр клуба «можно»
          </h3>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {PROGRAM_PERKS.map((p) => (
              <div
                key={p.title}
                className="flex gap-3 p-4 rounded-2xl bg-pink-50/60 border border-pink-100"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-pink-600 flex items-center justify-center flex-shrink-0">
                  <Icon name={p.icon} size={16} />
                </div>
                <div>
                  <div className="font-medium text-sm text-black/85 mb-1">{p.title}</div>
                  <p className="text-[13px] text-black/65 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Icon name="BadgeDollarSign" size={14} className="text-pink-600" />
            <div className="text-[11px] uppercase tracking-[0.22em] text-pink-700 font-medium">
              Форматы и стоимость
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-2">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl p-5 border ${
                  t.highlight
                    ? "border-transparent text-white shadow-lg"
                    : "bg-white border-black/10"
                }`}
                style={
                  t.highlight
                    ? {
                        backgroundImage:
                          "linear-gradient(135deg, rgb(236 72 153), rgb(244 63 94), rgb(192 38 211))",
                      }
                    : undefined
                }
              >
                {t.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-pink-700 text-[10px] uppercase tracking-[0.2em] px-3 py-0.5 rounded-full font-medium shadow">
                    Хит
                  </span>
                )}
                <div
                  className={`text-[10px] uppercase tracking-[0.22em] mb-2 ${
                    t.highlight ? "opacity-90" : "text-pink-600"
                  }`}
                >
                  {t.name}
                </div>
                <div
                  className="text-2xl mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}
                >
                  {t.price}
                </div>
                <div
                  className={`text-[11px] mb-4 ${
                    t.highlight ? "opacity-80" : "text-black/50"
                  }`}
                >
                  {t.period}
                </div>
                <ul className="space-y-2">
                  {t.perks.map((perk) => (
                    <li
                      key={perk}
                      className={`flex items-start gap-2 text-[13px] leading-snug ${
                        t.highlight ? "text-white/95" : "text-black/75"
                      }`}
                    >
                      <Icon
                        name="Check"
                        size={13}
                        className={`mt-0.5 flex-shrink-0 ${
                          t.highlight ? "text-white" : "text-pink-600"
                        }`}
                      />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="px-7 py-5 border-t border-black/5 bg-white">
          <button
            onClick={onApply}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:opacity-95 text-white px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-opacity"
          >
            <Icon name="Send" size={14} />
            Стать партнёром — оставить заявку
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
