export type EventCategory =
  | "Игры"
  | "Девичники"
  | "Бизнес"
  | "Фотография и контент"
  | "Спорт"
  | "Мода и стиль"
  | "Психология"

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
  { name: "Игры", icon: "Dices", color: "from-amber-400 to-pink-500" },
  { name: "Девичники", icon: "Flower2", color: "from-rose-400 to-fuchsia-500" },
  { name: "Бизнес", icon: "Briefcase", color: "from-slate-500 to-slate-700" },
  { name: "Фотография и контент", icon: "Camera", color: "from-pink-400 to-rose-500" },
  { name: "Спорт", icon: "Dumbbell", color: "from-emerald-400 to-teal-500" },
  { name: "Мода и стиль", icon: "Shirt", color: "from-fuchsia-400 to-purple-500" },
  { name: "Психология", icon: "Brain", color: "from-purple-400 to-pink-400" },
]

export const today = new Date()
export const ymd = (d: Date) => d.toISOString().slice(0, 10)
export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const EVENTS: ClubEvent[] = [
  // Игры
  {
    date: ymd(addDays(today, 1)),
    title: "Тематическая мафия",
    category: "Игры",
    time: "20:00",
    location: "Лофт «Резиденция»",
    description:
      "Атмосферный вечер мафии с костюмами и сюжетом. Знакомства, азарт и красивые фото.",
    price: 2500,
  },
  {
    date: ymd(addDays(today, 6)),
    title: "Игра «Бункер»",
    category: "Игры",
    time: "19:30",
    location: "Клубное пространство",
    description:
      "Психологическая игра на выживание: выбираешь стратегию, аргументируешь, торгуешься за место в бункере.",
    price: 2200,
  },
  {
    date: ymd(addDays(today, 11)),
    title: "Развлекательное шоу «GOOD NIGHT»",
    category: "Игры",
    time: "21:00",
    location: "Сцена клуба",
    description:
      "Фирменное шоу клуба «можно»: конкурсы, выступления резиденток и гости-сюрпризы.",
    price: 3500,
  },

  // Девичники
  {
    date: ymd(addDays(today, 4)),
    title: "Выездной девичник",
    category: "Девичники",
    time: "12:00",
    location: "Загородная резиденция",
    description:
      "Двухдневный выезд: уютный дом, фотосессия, спа, ужин при свечах и настоящие девичьи разговоры.",
    price: 18000,
  },
  {
    date: ymd(addDays(today, 9)),
    title: "Банный девичник",
    category: "Девичники",
    time: "16:00",
    location: "Приватная баня",
    description:
      "Парение, чайная церемония, бассейн и душевные разговоры в тёплом женском кругу.",
    price: 7500,
  },

  // Бизнес
  {
    date: ymd(addDays(today, 2)),
    title: "Нетворкинг с юристом Ярославом",
    category: "Бизнес",
    time: "19:00",
    location: "Коворкинг SOK",
    description:
      "Разбор юридических вопросов предпринимательниц: договоры, бренд, налоги. Знакомства и личные кейсы.",
    price: 3500,
    speaker: "Ярослав",
  },
  {
    date: ymd(addDays(today, 7)),
    title: "Мастермайнд «ПРОдвижение личного бренда»",
    category: "Бизнес",
    time: "11:00",
    location: "Студия клуба",
    description:
      "Камерный мастермайнд: каждая участница получает разбор её бренда и план на ближайшие 3 месяца.",
    price: 6500,
  },
  {
    date: ymd(addDays(today, 13)),
    title: "Бизнес-нетворкинг с блогером и SMM-специалистом",
    category: "Бизнес",
    time: "18:30",
    location: "Café Pushkin",
    description:
      "Вечер о продвижении в соцсетях: тренды, упаковка, тексты, сторис. Полезные знакомства гарантированы.",
    price: 4500,
  },

  // Фотография и контент
  {
    date: ymd(addDays(today, 3)),
    title: "Профессиональная съёмка с резидентом",
    category: "Фотография и контент",
    time: "13:00",
    location: "Студия «Свет»",
    description:
      "Полноценная фотосессия с фотографом-резидентом клуба: образ, локации, обработанные кадры.",
    price: 9500,
  },
  {
    date: ymd(addDays(today, 8)),
    title: "Быстрый фотопроект с проф. фотографом",
    category: "Фотография и контент",
    time: "12:00",
    location: "Лофт «Резиденция»",
    description:
      "Экспресс-съёмка: 20 минут, 10 готовых кадров для соцсетей и личного бренда.",
    price: 3500,
  },
  {
    date: ymd(addDays(today, 15)),
    title: "Фотопроект для резидентов",
    category: "Фотография и контент",
    time: "14:00",
    location: "Студия клуба",
    description:
      "Закрытый творческий фотопроект только для резиденток: концепция, стиль, продакшен под ключ.",
    price: 0,
  },

  // Спорт
  {
    date: ymd(addDays(today, 1)),
    title: "Сайкл-тренировка в формате вечеринки",
    category: "Спорт",
    time: "19:30",
    location: "Cycle Studio",
    description:
      "Энергичная сайкл-тренировка под клубный сет диджея: свет, музыка, драйв и кардио.",
    price: 1800,
  },
  {
    date: ymd(addDays(today, 5)),
    title: "Теннис",
    category: "Спорт",
    time: "10:00",
    location: "Теннисный клуб",
    description:
      "Тренировка с тренером и парные матчи: спорт, флирт ракетками и приятная компания.",
    price: 2500,
  },
  {
    date: ymd(addDays(today, 10)),
    title: "Игра в падел",
    category: "Спорт",
    time: "11:00",
    location: "Padel Club",
    description:
      "Самый модный женский спорт сезона: правила за 5 минут, дальше — только удовольствие.",
    price: 2800,
  },

  // Мода и стиль
  {
    date: ymd(addDays(today, 6)),
    title: "Мастер-класс со стилистом Анастасией Блиновой",
    category: "Мода и стиль",
    time: "17:00",
    location: "Шоурум клуба",
    description:
      "Разбор гардероба, тренды сезона и подбор образов под твой типаж от стилиста Анастасии Блиновой.",
    price: 4500,
    speaker: "Анастасия Блинова",
  },

  // Психология
  {
    date: ymd(addDays(today, 2)),
    title: "Кинотерапия",
    category: "Психология",
    time: "19:00",
    location: "Кинозал клуба",
    description:
      "Совместный просмотр фильма и глубокое обсуждение с психологом: про себя через героев на экране.",
    price: 2500,
  },
  {
    date: ymd(addDays(today, 9)),
    title: "Бранч-нетворкинг о сексуальности и проявленности",
    category: "Психология",
    time: "12:00",
    location: "Уютная веранда",
    description:
      "Откровенный женский разговор за бранчем: про чувственность, тело и право быть видимой.",
    price: 3800,
  },
  {
    date: ymd(addDays(today, 14)),
    title: "Мастер-класс «Голос лидера»",
    category: "Психология",
    time: "18:30",
    location: "Студия «Тишина»",
    description:
      "Работа с голосом, дыханием и подачей. Учимся звучать уверенно — на сцене, в переговорах и в жизни.",
    price: 4200,
  },
]

export const categoryMeta = (c: EventCategory) =>
  CATEGORIES.find((x) => x.name === c)!
