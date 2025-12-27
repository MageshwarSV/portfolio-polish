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
  const { data: portfolioData, loading: dataLoading } = usePortfolio();
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

  // Pre-calculate if content is ready for background rendering
  const isDataAvailable = portfolioData !== null;

  // Pre-load assets (like profile image) while the loading animation plays
  useEffect(() => {
    if (isDataAvailable && portfolioData.personal?.profileImage) {
      const img = new Image();
      img.src = portfolioData.personal.profileImage;
    }
  }, [isDataAvailable, portfolioData?.personal?.profileImage]);

  return (
    <>
      {/* Poetic Loading Screen - High Z-index ensures it stays on top */}
      <AnimatePresence>
        {shouldShowLoading && (
          <PoeticLoading
            onComplete={handleLoadingComplete}
            isDataReady={!dataLoading}
          />
        )}
      </AnimatePresence>

      {/* Main Content - Rendered early to "pre-read" but kept invisible until ready */}
      <motion.div
        className="relative w-full overflow-x-hidden"
        initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
        animate={{
          opacity: (shouldShowLoading || !isDataAvailable) ? 0 : 1,
          scale: (shouldShowLoading || !isDataAvailable) ? 1.02 : 1,
          filter: (shouldShowLoading || !isDataAvailable) ? "blur(10px)" : "blur(0px)"
        }}
        transition={{
          duration: 1.2 * animationConfig.animationDuration,
          ease: [0.22, 1, 0.36, 1], // Gentle "out" expo ease
          delay: 0.1
        }}
        style={{
          // Stop pointer events during loading to prevent accidental clicks
          pointerEvents: shouldShowLoading ? 'none' : 'auto',
          visibility: isDataAvailable ? 'visible' : 'hidden'
        }}
      >
        {animationConfig.enableSmoothScroll ? (
          <SmoothScrollProvider>
            <PageContent
              key={shouldShowLoading ? 'pre-reading' : 'active-reveal'}
              animationConfig={animationConfig}
            />
          </SmoothScrollProvider>
        ) : (
          <PageContent
            key={shouldShowLoading ? 'pre-reading' : 'active-reveal'}
            animationConfig={animationConfig}
          />
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
