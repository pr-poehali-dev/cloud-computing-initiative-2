import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"

export default function AboutTopBar() {
  return (
    <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 hover:text-black transition-colors"
      >
        <Icon name="ChevronLeft" size={16} />
        На главную
      </Link>
      <div className="text-sm uppercase tracking-[0.3em] font-light">МОЖНО</div>
    </header>
  )
}
