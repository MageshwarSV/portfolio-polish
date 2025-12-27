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
  const { loading: dataLoading } = usePortfolio();
  const animationConfig = useAnimationConfig();

  // Scroll to top on page load/refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Hide scrollbar and prevent scroll during loading
  useEffect(() => {
    if (isLoading || dataLoading) {
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
  }, [isLoading, dataLoading]);

  // Listen for admin panel updates - now components update live without refresh!
  // This is just kept for backwards compatibility
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolio_refresh_trigger') {
        // Components now update live, but we can still force reload if needed
        console.log('Portfolio data updated from admin panel');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Adjust initial loading state based on performance
  const shouldShowLoading = (animationConfig.enableLoadingScreen && isLoading) || dataLoading;

  // Handle loading completion - quotes are done, now load content
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {/* Poetic Loading Screen with Quotes - Only on high-performance devices */}
      <AnimatePresence>
        {shouldShowLoading && (
          <PoeticLoading onComplete={handleLoadingComplete} />
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
