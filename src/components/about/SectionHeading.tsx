import Icon from "@/components/ui/icon"

interface Props {
  eyebrow: string
  title: string
  icon?: string
  description?: string
  align?: "left" | "center"
}

export default function SectionHeading({
  eyebrow,
  title,
  icon = "Sparkles",
  description,
  align = "left",
}: Props) {
  const isCenter = align === "center"
  return (
    <div className={`mb-10 ${isCenter ? "text-center" : ""}`}>
      <div
        className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)] mb-5 ${
          isCenter ? "" : ""
        }`}
      >
        <Icon name={icon} size={14} />
        <span className="text-[11px] uppercase tracking-[0.3em] font-medium">
          {eyebrow}
        </span>
      </div>

      <div className={`relative inline-block ${isCenter ? "mx-auto" : ""}`}>
        <div
          aria-hidden
          className="absolute -inset-x-4 -inset-y-2 rounded-3xl bg-gradient-to-r from-pink-100/70 via-rose-100/60 to-fuchsia-100/70 -z-10"
        />
        <h2
          className="relative px-1"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 500,
            lineHeight: 1.05,
          }}
        >
          {title}
        </h2>
      </div>

      {description && (
        <p
          className={`mt-4 text-sm md:text-base text-black/65 leading-relaxed ${
            isCenter ? "max-w-2xl mx-auto" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
