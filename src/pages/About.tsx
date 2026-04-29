import AboutPageLayout from "@/components/about/AboutPageLayout"
import AboutClub from "@/components/about/AboutClub"
import AboutFounder from "@/components/about/AboutFounder"

export default function About() {
  return (
    <AboutPageLayout>
      <AboutClub />
      <AboutFounder />
    </AboutPageLayout>
  )
}
