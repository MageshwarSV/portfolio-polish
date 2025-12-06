import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative">
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      <Navigation />
      
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
