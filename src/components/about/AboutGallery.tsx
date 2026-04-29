import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import SectionHeading from "@/components/about/SectionHeading"

const GALLERY = [
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/15422723-dc66-4444-9812-8306f234551a.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/1aa5f880-559c-4ec5-838d-659f307e9df8.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6a8cfa15-cec6-4996-9062-69db8eb29d2f.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/bb1cf627-1e95-4e23-9518-47c7799c1556.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/cc92f513-6f64-4f7a-94fc-dc94c5f64021.jpg",
  "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/7685cd55-3a4e-4846-bfad-bae8b82b24f0.jpg",
]

export default function AboutGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <section id="gallery" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
        <SectionHeading eyebrow="Галерея" title="" icon="Camera" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY.map((src, i) => (
            <button
              key={src}
              onClick={() => setLightbox(src)}
              className={`relative rounded-2xl overflow-hidden bg-white shadow-sm group ${
                i === 0
                  ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto"
                  : "aspect-square"
              }`}
            >
              <img
                src={src}
                alt={`Мероприятие ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
              />
            </button>
          ))}
        </div>
      </section>

      <Dialog open={!!lightbox} onOpenChange={(v) => !v && setLightbox(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          {lightbox && (
            <img src={lightbox} alt="" className="w-full h-auto rounded-2xl" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
