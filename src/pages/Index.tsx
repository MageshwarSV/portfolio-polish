import StoryNavigation from "@/components/storytelling/StoryNavigation";
import StoryHero from "@/components/storytelling/StoryHero";
import StoryAbout from "@/components/storytelling/StoryAbout";
import StoryExperience from "@/components/storytelling/StoryExperience";
import StorySkills from "@/components/storytelling/StorySkills";
import StoryProjects from "@/components/storytelling/StoryProjects";
import StoryContact from "@/components/storytelling/StoryContact";
import StoryFooter from "@/components/storytelling/StoryFooter";

const Index = () => {
  return (
    <div className="relative">
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      <StoryNavigation />
      
      <main>
        <section id="hero">
          <StoryHero />
        </section>
        <section id="about">
          <StoryAbout />
        </section>
        <section id="experience">
          <StoryExperience />
        </section>
        <section id="skills">
          <StorySkills />
        </section>
        <section id="projects">
          <StoryProjects />
        </section>
        <StoryContact />
      </main>
      
      <StoryFooter />
    </div>
  );
};

export default Index;
