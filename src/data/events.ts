export type EventCategory = "Психология" | "Спорт" | "Развлечения" | "Бизнес" | "Отдых"

export interface ClubEvent {
  date: string
  title: string
  category: EventCategory
  time: string
  location: string
  description: string
  price: number
  speaker?: string
}

export const CATEGORIES: { name: EventCategory; icon: string; color: string }[] = [
  { name: "Психология", icon: "Brain", color: "from-purple-400 to-pink-400" },
  { name: "Спорт", icon: "Dumbbell", color: "from-emerald-400 to-teal-400" },
  { name: "Развлечения", icon: "Sparkles", color: "from-amber-400 to-pink-400" },
  { name: "Бизнес", icon: "Briefcase", color: "from-slate-500 to-slate-700" },
  { name: "Отдых", icon: "Palmtree", color: "from-sky-400 to-cyan-400" },
]

export const today = new Date()
export const ymd = (d: Date) => d.toISOString().slice(0, 10)
export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const EVENTS: ClubEvent[] = [
  { date: ymd(addDays(today, 0)), title: "Круг поддержки: я и мои границы", category: "Психология", time: "19:00", location: "Лофт «Резиденция»", description: "Открытый разговор с психологом о личных границах и умении говорить нет.", price: 3500, speaker: "Екатерина Лаврова" },
  { date: ymd(addDays(today, 1)), title: "Утренняя йога у воды", category: "Спорт", time: "08:30", location: "Парк Горького, набережная", description: "Лёгкая практика для пробуждения тела и спокойного начала дня.", price: 1500, speaker: "Алина Светлова" },
  { date: ymd(addDays(today, 2)), title: "Вечер виноделия", category: "Развлечения", time: "20:00", location: "Wine Room, Патриаршие", description: "Дегустация авторских вин и неформальные знакомства.", price: 4900 },
  { date: ymd(addDays(today, 3)), title: "Мастер-класс: личный бренд", category: "Бизнес", time: "18:00", location: "Коворкинг SOK", description: "Как женщине строить узнаваемость и монетизировать экспертизу.", price: 5500, speaker: "Марина Корн" },
  { date: ymd(addDays(today, 4)), title: "Спа-ретрит на весь день", category: "Отдых", time: "11:00", location: "White SPA, Москва-Сити", description: "Хаммам, бассейн, массажи и ужин в кругу клуба.", price: 12000 },
  { date: ymd(addDays(today, 5)), title: "Расстановки по Хеллингеру", category: "Психология", time: "17:00", location: "Студия «Тишина»", description: "Системные расстановки на запросы участниц.", price: 4500, speaker: "Екатерина Лаврова" },
  { date: ymd(addDays(today, 7)), title: "Танцевальный вечер", category: "Развлечения", time: "21:00", location: "Bar 8 Marta", description: "Латина, бачата и живая музыка.", price: 2500 },
  { date: ymd(addDays(today, 8)), title: "Пилатес для осанки", category: "Спорт", time: "10:00", location: "Studio Pilates", description: "Глубокая работа с мышцами кора и спиной.", price: 2000, speaker: "Алина Светлова" },
  { date: ymd(addDays(today, 10)), title: "Завтрак с инвестором", category: "Бизнес", time: "09:00", location: "Café Pushkin", description: "Камерный завтрак с приглашённой гостьей — основательницей фонда.", price: 6500, speaker: "Марина Корн" },
  { date: ymd(addDays(today, 12)), title: "Чайная церемония", category: "Отдых", time: "16:00", location: "Чайный клуб «Тэ»", description: "Медитативная церемония и беседа о внутреннем покое.", price: 1800 },
  { date: ymd(addDays(today, 14)), title: "Арт-терапия: рисуем эмоции", category: "Психология", time: "18:30", location: "Студия «Цвет»", description: "Без навыков рисования — только чувства и краски.", price: 3200, speaker: "Екатерина Лаврова" },
  { date: ymd(addDays(today, 16)), title: "Кинопоказ под открытым небом", category: "Развлечения", time: "21:30", location: "Крыша клуба", description: "Авторское кино, плед, глинтвейн.", price: 1500 },
]

export const categoryMeta = (c: EventCategory) =>
  CATEGORIES.find((x) => x.name === c)!