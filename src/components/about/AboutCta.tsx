import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"

export default function AboutCta() {
  return (
    <section id="cta" className="max-w-3xl mx-auto px-6 pb-24 text-center scroll-mt-24">
      <h2
        className="mb-4"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 400,
        }}
      >
        Готова стать частью клуба?
      </h2>
      <p className="text-black/70 mb-8">
        Подай заявку на вступление — мы свяжемся с тобой и пригласим на ближайшую встречу.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-black text-white text-sm uppercase tracking-[0.25em] hover:bg-black/85 transition-colors"
      >
        <Icon name="Sparkles" size={16} />
        Вступить в клуб
      </Link>
    </section>
  )
}
