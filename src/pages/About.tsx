import AboutHero from "@/components/about/AboutHero"
import AboutSpeakersAndEvents from "@/components/about/AboutSpeakersAndEvents"
import AboutResidency from "@/components/about/AboutResidency"
import AboutGalleryAndCta from "@/components/about/AboutGalleryAndCta"

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 text-black">
      <AboutHero />
      <AboutSpeakersAndEvents />
      <AboutResidency />
      <AboutGalleryAndCta />
    </div>
  )
}
