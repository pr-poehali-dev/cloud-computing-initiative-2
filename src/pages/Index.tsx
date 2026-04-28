import ShaderBackground from "@/components/ShaderBackground"
import HeroContent from "@/components/HeroContent"
import EventsSection from "@/components/EventsSection"
import Header from "@/components/Header"

const Index = () => {
  return (
    <div className="bg-black">
      <ShaderBackground>
        <Header />
        <HeroContent />
      </ShaderBackground>
      <EventsSection />
    </div>
  )
}

export default Index