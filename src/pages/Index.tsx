import ShaderBackground from "@/components/ShaderBackground"
import HeroContent from "@/components/HeroContent"
import Header from "@/components/Header"

const Index = () => {
  return (
    <div className="bg-black">
      <ShaderBackground>
        <Header />
        <HeroContent />
      </ShaderBackground>
    </div>
  )
}

export default Index
