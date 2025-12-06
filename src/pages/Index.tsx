import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAnimationConfig } from "@/contexts/PerformanceContext";
import StoryNavigation from "@/components/storytelling/StoryNavigation";
import StoryHero from "@/components/storytelling/StoryHero";
import StoryAbout from "@/components/storytelling/StoryAbout";
import StoryExperience from "@/components/storytelling/StoryExperience";
import StorySkills from "@/components/storytelling/StorySkills";
import StoryProjects from "@/components/storytelling/StoryProjects";
import StoryContact from "@/components/storytelling/StoryContact";
import StoryFooter from "@/components/storytelling/StoryFooter";
import AIParticles from "@/components/storytelling/AIParticles";
import PoeticLoading from "@/components/storytelling/PoeticLoading";
import SmoothScrollProvider from "@/components/storytelling/SmoothScrollProvider";
import CustomCursor from "@/components/storytelling/CustomCursor";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const animationConfig = useAnimationConfig();

  // Adjust initial loading state based on performance
  const shouldShowLoading = animationConfig.enableLoadingScreen && isLoading;

  return (
    <>
      {/* Poetic Loading Screen with Quotes - Only on high-performance devices */}
      <AnimatePresence>
        {shouldShowLoading && (
          <PoeticLoading onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* Main Content with Conditional Smooth Scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: (shouldShowLoading ? 0 : 1) }}
        transition={{ 
          duration: 0.8 * animationConfig.animationDuration, 
          delay: 0.2 * animationConfig.animationDuration 
        }}
      >
        {!shouldShowLoading && (
          <>
            {animationConfig.enableSmoothScroll ? (
              <SmoothScrollProvider>
                <PageContent animationConfig={animationConfig} />
              </SmoothScrollProvider>
            ) : (
              <PageContent animationConfig={animationConfig} />
            )}
          </>
        )}
      </motion.div>
    </>
  );
};

// Extracted page content component to avoid duplication
const PageContent = ({ animationConfig }: { animationConfig: any }) => (
  <div className="relative">
    {/* AI-inspired floating particles background - Only on capable devices */}
    {animationConfig.enableParticles && <AIParticles />}

    {/* Custom cursor effect - Only on desktop */}
    {animationConfig.enableCustomCursor && <CustomCursor />}

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

export default Index;
