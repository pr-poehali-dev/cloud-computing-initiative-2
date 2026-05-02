export const PROGRAM_PERKS = [
  {
    icon: "Users",
    title: "Доступ к женской аудитории",
    text: "Более 500 платежеспособных резиденток клуба — твои потенциальные клиентки.",
  },
  {
    icon: "Megaphone",
    title: "PR и продвижение",
    text: "Анонсы в соцсетях клуба, упоминания в рассылках и публикации в подборках партнёров.",
  },
  {
    icon: "CalendarHeart",
    title: "Совместные события",
    text: "Проводим коллаборации, мастер-классы и закрытые вечера на твоей площадке.",
  },
  {
    icon: "Sparkles",
    title: "Размещение на сайте",
    text: "Постоянное место в разделе «Партнёры» с логотипом, описанием и ссылкой.",
  },
  {
    icon: "Gift",
    title: "Спецпредложения резиденткам",
    text: "Оформляем твою персональную скидку или подарок участницам клуба.",
  },
  {
    icon: "Crown",
    title: "Личный менеджер",
    text: "Сопровождение на всех этапах: от подписания до отчёта по результатам.",
  },
]

export const TIERS = [
  {
    name: "Базовый",
    price: "от 50 000 ₽",
    period: "разово",
    perks: [
      "Размещение на странице «Партнёры»",
      "1 совместная активность",
      "Анонс в соцсетях клуба",
    ],
    highlight: false,
    accent: "from-pink-200 to-rose-200",
  },
  {
    name: "Премиум",
    price: "от 150 000 ₽",
    period: "за квартал",
    perks: [
      "Всё из Базового",
      "3 совместных мероприятия",
      "Закрытое представление резиденткам",
      "Спецпредложение и промокод",
      "PR-публикации в рассылке",
    ],
    highlight: true,
    accent: "from-pink-500 via-rose-500 to-fuchsia-600",
  },
  {
    name: "Стратегический",
    price: "индивидуально",
    period: "годовой контракт",
    perks: [
      "Всё из Премиума",
      "Эксклюзив в категории",
      "Брендирование клубных событий",
      "Личный менеджер 24/7",
      "Совместная медийная кампания",
    ],
    highlight: false,
    accent: "from-purple-500 to-fuchsia-600",
  },
]

export interface PartnerFormState {
  company: string
  contactName: string
  phone: string
  email: string
  category: string
  budget: string
  message: string
}

export const EMPTY_PARTNER_FORM: PartnerFormState = {
  company: "",
  contactName: "",
  phone: "",
  email: "",
  category: "",
  budget: "",
  message: "",
}
