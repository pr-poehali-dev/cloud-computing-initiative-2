import Icon from "@/components/ui/icon"
import { UserRole } from "@/contexts/AuthContext"

interface Props {
  role?: UserRole
  position?: string
  size?: "xs" | "sm" | "md"
  withLabel?: boolean
  className?: string
}

const ROLE_CONFIG: Record<
  Exclude<UserRole, "member">,
  { icon: string; gradient: string; label: string }
> = {
  team: {
    icon: "Crown",
    gradient: "from-amber-400 via-pink-500 to-fuchsia-500",
    label: "Команда клуба",
  },
  blogger: {
    icon: "Camera",
    gradient: "from-amber-400 via-pink-500 to-fuchsia-500",
    label: "Блогер",
  },
  resident: {
    icon: "Gem",
    gradient: "from-fuchsia-500 to-purple-600",
    label: "Резидент",
  },
}

export default function RoleBadge({
  role,
  position,
  size = "sm",
  withLabel = false,
  className = "",
}: Props) {
  if (!role || role === "member") return null
  const config = ROLE_CONFIG[role]
  if (!config) return null

  const dims = {
    xs: { wrap: "w-3.5 h-3.5", icon: 9 },
    sm: { wrap: "w-4 h-4", icon: 10 },
    md: { wrap: "w-5 h-5", icon: 12 },
  }[size]

  const label = position || config.label

  if (withLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${config.gradient} text-white text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 ${className}`}
        title={label}
      >
        <Icon name={config.icon} size={9} />
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-white shadow-sm ${dims.wrap} ${className}`}
      title={label}
      aria-label={label}
    >
      <Icon name={config.icon} size={dims.icon} />
    </span>
  )
}
