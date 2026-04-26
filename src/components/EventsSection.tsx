const events = [
  {
    emoji: "🃏",
    title: "Женская мафия",
    description: "Тематические вечера, где роли, интриги и победы — только женские. Азарт, смех и новые знакомства.",
    tag: "Игры",
    date: "Каждую пятницу",
    color: "from-rose-500/20 to-purple-600/20",
    border: "border-rose-500/30",
  },
  {
    emoji: "🧘‍♀️",
    title: "Йога",
    description: "Практики для тела и ума в женском кругу. От утренней виньясы до восстановительной йога-нидры.",
    tag: "Здоровье",
    date: "Вт и Чт",
    color: "from-emerald-500/20 to-teal-600/20",
    border: "border-emerald-500/30",
  },
  {
    emoji: "🌸",
    title: "Встречи с психологом",
    description: "Групповые сессии и разборы в безопасном пространстве. Без осуждения, только поддержка и рост.",
    tag: "Поддержка",
    date: "Каждую среду",
    color: "from-pink-500/20 to-rose-600/20",
    border: "border-pink-500/30",
  },
  {
    emoji: "🎾",
    title: "Теннис",
    description: "Женские корты, партнёрши по игре и тренировки любого уровня — от новичка до уверенного игрока.",
    tag: "Спорт",
    date: "Сб и Вс",
    color: "from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-500/30",
  },
  {
    emoji: "🎬",
    title: "Кинотерапия",
    description: "Смотрим кино — обсуждаем жизнь. Фильмы, которые трогают, и разговоры, которые меняют.",
    tag: "Культура",
    date: "Каждое воскресенье",
    color: "from-violet-500/20 to-indigo-600/20",
    border: "border-violet-500/30",
  },
  {
    emoji: "✨",
    title: "Скоро новое",
    description: "Мы постоянно добавляем новые форматы: арт-терапия, нетворкинг-ужины, женские ретриты и многое другое.",
    tag: "Новинки",
    date: "Следите за обновлениями",
    color: "from-fuchsia-500/20 to-pink-600/20",
    border: "border-fuchsia-500/30",
  },
]

export default function EventsSection() {
  return (
    <section id="events" className="relative z-20 px-6 py-24 bg-black/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-pink-400 uppercase tracking-widest text-xs mb-3">Мероприятия клуба</p>
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            Можно <span className="italic font-medium text-pink-300">всё это</span>
          </h2>
          <p className="text-white/50 text-sm mt-4 max-w-lg leading-relaxed">
            Выбирай формат под своё настроение — у нас есть место для каждой.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.title}
              className={`relative rounded-2xl border ${event.border} bg-gradient-to-br ${event.color} backdrop-blur-md p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
            >
              <div className="absolute inset-0 rounded-2xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{event.emoji}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 border border-white/10 rounded-full px-2 py-0.5">
                  {event.tag}
                </span>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">{event.title}</h3>
              <p className="text-white/55 text-xs leading-relaxed mb-5">{event.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-[10px] uppercase tracking-wide">{event.date}</span>
                <button className="text-xs text-pink-300 hover:text-pink-200 transition-colors duration-200 border border-pink-400/30 rounded-full px-3 py-1 hover:border-pink-300/50">
                  Записаться
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
