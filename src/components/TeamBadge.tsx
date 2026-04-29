import Icon from "@/components/ui/icon"

interface Props {
  position?: string
  size?: "xs" | "sm" | "md"
  withLabel?: boolean
  className?: string
}

export default function TeamBadge({
  position,
  size = "sm",
  withLabel = false,
  className = "",
}: Props) {
  const dims = {
    xs: { wrap: "w-3.5 h-3.5", icon: 9 },
    sm: { wrap: "w-4 h-4", icon: 10 },
    md: { wrap: "w-5 h-5", icon: 12 },
  }[size]

  const label = position || "Команда клуба"

  if (withLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-fuchsia-500 text-white text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 ${className}`}
        title={label}
      >
        <Icon name="Crown" size={9} />
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white shadow-sm ${dims.wrap} ${className}`}
      title={label}
      aria-label={label}
    >
      <Icon name="Crown" size={dims.icon} />
    </span>
  )
}
