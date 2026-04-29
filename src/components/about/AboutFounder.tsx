import Icon from "@/components/ui/icon"
import SectionHeading from "@/components/about/SectionHeading"

const FOUNDER_PHOTO =
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/bucket/349d889f-422a-4043-8672-fc7de079d848.jpeg"

const INTERVIEW = [
  {
    q: "Как появилась идея клуба «МОЖНО»?",
    a: "Я долго замечала, что вокруг много сильных, ярких женщин — но каждая в одиночку справляется со своим миром. Мне захотелось пространства, где женщине разрешено всё: расти, отдыхать, ошибаться, мечтать вслух. Так и родилось «МОЖНО» — клуб без масок и социальных ролей.",
  },
  {
    q: "Кто твои участницы?",
    a: "Это женщины 25–55 лет, очень разные по профессии и возрасту, но похожие в главном — они ищут глубину. Психологи, предприниматели, художницы, мамы. И каждой важно быть среди своих.",
  },
  {
    q: "Чем «МОЖНО» отличается от других клубов?",
    a: "Мы не про нетворкинг ради контактов и не про статус. Мы про честный разговор и тёплое окружение. Здесь не нужно ничего из себя строить — ты приходишь такая, какая есть.",
  },
]

export default function AboutFounder() {
  return (
    <section id="founder" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-24">
      <SectionHeading
        eyebrow="Владелица клуба"
        title=""
        icon="Crown"
        description="Юлия Мустафина — основательница и идеолог женского клуба «МОЖНО»."
      />
      <div className="grid md:grid-cols-[380px_1fr] gap-8 items-start">
        <div className="rounded-3xl overflow-hidden bg-white shadow-md">
          <img src={FOUNDER_PHOTO} alt="Юлия Мустафина" className="w-full h-auto block" />
        </div>
        <div>
          <div className="space-y-5">
            {INTERVIEW.map((item, i) => (
              <div key={i} className="rounded-2xl bg-white border border-black/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="text-pink-500 mt-0.5">
                    <Icon name="Quote" size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-black/90 mb-2">{item.q}</div>
                    <p className="text-black/70 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
