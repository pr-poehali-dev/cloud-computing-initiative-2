import ShaderBackground from "@/components/ShaderBackground"
import HeroContent from "@/components/HeroContent"
import PulsingCircle from "@/components/PulsingCircle"
import Header from "@/components/Header"
import EventsSection from "@/components/EventsSection"

const Index = () => {
  return (
    <div className="bg-black">
      <ShaderBackground>
        <Header />
        <HeroContent />
        <PulsingCircle />
      </ShaderBackground>
      <EventsSection />
    </div>
  )
}

export default Index