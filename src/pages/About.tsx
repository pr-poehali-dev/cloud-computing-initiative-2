import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import AboutHero from "@/components/about/AboutHero"
import AboutSpeakersAndEvents from "@/components/about/AboutSpeakersAndEvents"
import AboutResidency from "@/components/about/AboutResidency"
import AboutPartnership from "@/components/about/AboutPartnership"
import AboutGalleryAndCta from "@/components/about/AboutGalleryAndCta"

export default function About() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "")
      // Wait one frame so all sections render before scrolling
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [location.pathname, location.hash])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 text-black">
      <AboutHero />
      <AboutSpeakersAndEvents />
      <AboutResidency />
      <AboutPartnership />
      <AboutGalleryAndCta />
    </div>
  )
}