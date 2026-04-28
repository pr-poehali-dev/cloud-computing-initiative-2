import ShaderBackground from "@/components/ShaderBackground"
import HeroContent from "@/components/HeroContent"
import EventsSection from "@/components/EventsSection"

const Index = () => {
  return (
    <div className="bg-black">
      <ShaderBackground>
        <HeroContent />
      </ShaderBackground>
      <EventsSection />
    </div>
  )
}

export default Index