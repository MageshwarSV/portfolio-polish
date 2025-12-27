import { useState, useEffect } from "react";
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
import { usePortfolio } from "@/contexts/PortfolioContext";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { loading: dataLoading } = usePortfolio();
  const animationConfig = useAnimationConfig();

  // Scroll to top on page load/refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Use a more stable loading flag that doesn't flicker once initial load is done
  const shouldShowLoading = !hasLoadedOnce && (
    (animationConfig.enableLoadingScreen && isLoading) || dataLoading
  );

  // Hide scrollbar and prevent scroll during loading
  useEffect(() => {
    if (shouldShowLoading) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [shouldShowLoading]);

  // Handle loading completion - quotes are done AND data is ready
  const handleLoadingComplete = () => {
    setIsLoading(false);
    setHasLoadedOnce(true);
  };

  return (
    <>
      {/* Poetic Loading Screen with Quotes - Only on high-performance devices */}
      <AnimatePresence>
        {shouldShowLoading && (
          <PoeticLoading
            onComplete={handleLoadingComplete}
            isDataReady={!dataLoading}
          />
        )}
      </AnimatePresence>

      {/* Main Content - Hidden during loading, don't render until loading complete */}
      {!shouldShowLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8 * animationConfig.animationDuration,
            delay: 0.2 * animationConfig.animationDuration
          }}
        >
          {animationConfig.enableSmoothScroll ? (
            <SmoothScrollProvider>
              <PageContent animationConfig={animationConfig} />
            </SmoothScrollProvider>
          ) : (
            <PageContent animationConfig={animationConfig} />
          )}
        </motion.div>
      )}
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
