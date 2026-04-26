export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-11 p-6">
      <div className="flex justify-between items-center">
        <div className="text-white text-sm uppercase tracking-widest font-light">МОЖНО</div>
        <nav className="flex gap-8">
          <a
            href="#events"
            className="text-white hover:text-pink-300 transition-colors duration-300 uppercase text-sm"
          >
            Мероприятия
          </a>
          <a
            href="#about"
            className="text-white hover:text-pink-300 transition-colors duration-300 uppercase text-sm"
          >
            О клубе
          </a>
          <a
            href="#join"
            className="text-white hover:text-pink-300 transition-colors duration-300 uppercase text-sm"
          >
            Вступить
          </a>
        </nav>
      </div>
    </header>
  )
}