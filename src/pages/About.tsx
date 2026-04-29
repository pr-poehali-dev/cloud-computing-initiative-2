import AboutPageLayout from "@/components/about/AboutPageLayout"
import AboutClub from "@/components/about/AboutClub"
import AboutFounder from "@/components/about/AboutFounder"
import AboutSectionsPreview from "@/components/about/AboutSectionsPreview"

export default function About() {
  return (
    <AboutPageLayout>
      <AboutClub />
      <AboutFounder />
      <AboutSectionsPreview />
    </AboutPageLayout>
  )
}