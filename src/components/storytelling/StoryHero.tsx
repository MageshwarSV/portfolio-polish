import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown, Sparkles, Cpu, Zap } from "lucide-react";

const StoryHero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const floatingIcons = [
    { icon: Sparkles, delay: 0, x: "10%", y: "20%" },
    { icon: Cpu, delay: 0.2, x: "85%", y: "30%" },
    { icon: Zap, delay: 0.4, x: "15%", y: "70%" },
    { icon: Sparkles, delay: 0.6, x: "80%", y: "75%" },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }} />
      </div>

      {/* Floating AI Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-primary/30"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: item.delay + 0.5, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
          >
            <item.icon className="w-8 h-8 md:w-12 md:h-12" />
          </motion.div>
        </motion.div>
      ))}

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] opacity-30"
        style={{ background: "var(--gradient-primary)", y }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[128px] opacity-20"
        style={{ background: "var(--gradient-accent)", y }}
      />

      <motion.div style={{ opacity, scale }} className="container-custom text-center relative z-10">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-primary text-sm font-medium">AI Automation Expert @ WorkBooster AI</span>
        </motion.div>

        {/* Name with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Hi, I'm </span>
            <span className="text-gradient">Mageshwar</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Software Engineer crafting{" "}
          <span className="text-primary font-medium">AI-powered automation</span>,{" "}
          <span className="text-accent font-medium">IoT solutions</span>, and{" "}
          <span className="text-foreground font-medium">intelligent workflows</span>{" "}
          that transform how businesses operate.
        </motion.p>

        {/* Tech Stack Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {["n8n", "Flowise", "Python", "IoT", "AI/ML"].map((tech, index) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-medium text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors cursor-default"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default StoryHero;
