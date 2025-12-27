import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { personalInfo as defaultPersonalInfo } from "@/data/storytellingData";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAdaptiveAnimation } from "@/hooks/useAdaptiveAnimation";

const StoryHero = () => {
  const { data: portfolioData } = usePortfolio();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  // Use data from portfolio context
  const personalInfo = portfolioData?.personal || defaultPersonalInfo;
  const { config, adjustTransition } = useAdaptiveAnimation();

  // Reset image error when profileImage changes
  useEffect(() => {
    setImageError(false);
  }, [personalInfo.profileImage]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms - Disabled on low-performance devices
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Full name for animation
  const fullName = personalInfo.name || defaultPersonalInfo.name;
  const firstName = personalInfo.firstName || defaultPersonalInfo.firstName || "Mageshwar";
  const nameLetters = fullName.split("");

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background orbs */}

      {/* Gradient orbs - Only show on desktop/systems */}
      {config.enableComplexAnimations && (
        <>
          <motion.div
            className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full blur-[128px] opacity-10 hidden md:block" // Reduced from 0.3
            style={{ background: "var(--gradient-primary)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }} // Drastic reduction
            transition={{ duration: 8 * config.animationDuration, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-32 w-[350px] h-[350px] rounded-full blur-[128px] opacity-10 hidden md:block" // Reduced from 0.2
            style={{ background: "var(--gradient-accent)" }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.1, 0.03] }} // Drastic reduction
            transition={{ duration: 10 * config.animationDuration, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Main content */}
      <motion.div style={{ opacity, scale }} className="container-custom relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Text content - 3 columns */}
          <div className="lg:col-span-3 text-center lg:text-left">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: config.enableComplexAnimations ? 20 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={adjustTransition({ duration: 0.6 })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-primary/30 mb-8 relative z-10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary text-sm font-medium">
                AI Automation Expert @ {personalInfo.currentCompany}
              </span>
            </motion.div>

            {/* Animated name with letter-by-letter reveal */}
            <motion.div
              initial={{ opacity: 0, y: config.enableComplexAnimations ? 30 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={adjustTransition({ duration: 0.8, delay: 0.2 })}
              style={{ y: textY }}
            >
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-foreground">Hi, I'm </span>
                <span className="text-gradient inline-flex flex-wrap">
                  {/* Mobile: Split name into two lines */}
                  <span className="block md:hidden w-full">
                    <span className="block">{firstName}</span>
                    <span className="block">{fullName.replace(firstName, "").trim()}</span>
                  </span>
                  {/* Desktop: Animated letter by letter */}
                  <span className="hidden md:inline-flex md:flex-wrap">
                    {nameLetters.map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={config.enableComplexAnimations ? { opacity: 0, y: 50, rotateX: -90 } : { opacity: 0 }}
                        animate={config.enableComplexAnimations ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 1 }}
                        transition={adjustTransition({
                          duration: 0.5,
                          delay: 0.5 + index * 0.05,
                          ease: [0.215, 0.61, 0.355, 1],
                        })}
                        className="inline-block"
                        style={{
                          transformOrigin: "bottom",
                          marginRight: letter === " " ? "0.3em" : "0"
                        }}
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </motion.span>
                    ))}
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: config.enableComplexAnimations ? 30 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={adjustTransition({ duration: 0.8, delay: 0.8 })}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed"
            >
              Software Engineer crafting{" "}
              <span className="text-primary font-medium">AI-powered automation</span>,{" "}
              <span className="text-accent font-medium">IoT solutions</span>, and{" "}
              <span className="text-foreground font-medium">intelligent workflows</span>{" "}
              that transform how businesses operate.
            </motion.p>

            {/* Tech pills */}
            <motion.div
              initial={{ opacity: 0, y: config.enableComplexAnimations ? 20 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={adjustTransition({ duration: 0.8, delay: 1 })}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {["n8n", "Flowise", "Python", "IoT", "AI/ML"].map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: config.enableComplexAnimations ? 0.8 : 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={adjustTransition({ delay: 1.2 + index * 0.1 })}
                  whileHover={config.enableComplexAnimations ? { scale: 1.1, y: -2 } : {}}
                  className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-medium text-foreground/80 hover:border-primary/50 hover:text-primary transition-all cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Profile image - 2 columns */}
          <motion.div
            className="lg:col-span-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: config.enableComplexAnimations ? 0.8 : 1, x: config.enableComplexAnimations ? 50 : 0 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={config.enableComplexAnimations
              ? { delay: 0.5 * config.animationDuration, duration: 1 * config.animationDuration, type: "spring", bounce: 0.3 }
              : adjustTransition({ delay: 0.5, duration: 0.8 })
            }
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Glow ring - Only animate on desktop */}
              {config.enableComplexAnimations ? (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--gradient-primary)",
                    filter: "blur(25px)",
                  }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              ) : (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--gradient-primary)",
                    filter: "blur(25px)",
                    opacity: 0.4
                  }}
                />
              )}

              {/* Profile image container */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/40">
                {imageError ? (
                  <div
                    className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {personalInfo.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                ) : (
                  <img
                    src={personalInfo.profileImage}
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>

              {/* Floating tech bubbles around profile - Only on desktop */}
              {config.enableComplexAnimations && [
                { name: "Python", top: "-12%", left: "20%", delay: 0 },
                { name: "React", top: "8%", right: "-15%", delay: 0.5 },
                { name: "IoT", bottom: "5%", right: "-8%", delay: 1 },
              ].map((tech) => (
                <motion.div
                  key={tech.name}
                  className="absolute px-3 py-1.5 rounded-full bg-secondary/80 border border-primary/30 text-xs font-medium text-primary backdrop-blur-sm"
                  style={{
                    top: tech.top,
                    bottom: tech.bottom,
                    left: tech.left,
                    right: tech.right,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { delay: 1.5 + tech.delay, duration: 0.5 },
                    scale: { delay: 1.5 + tech.delay, duration: 0.5 },
                    y: { delay: 2 + tech.delay, duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  {tech.name}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator - positioned at very bottom */}
      {config.enableComplexAnimations && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default StoryHero;
