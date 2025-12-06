import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Code2, Bot, Cpu, Workflow } from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "Full-Stack Development",
    description: "Building responsive web apps with modern frameworks",
  },
  {
    icon: Bot,
    title: "AI Automation",
    description: "Creating intelligent workflows with n8n & Flowise",
  },
  {
    icon: Cpu,
    title: "IoT Solutions",
    description: "Hardware meets software for smart systems",
  },
  {
    icon: Workflow,
    title: "Process Optimization",
    description: "Reducing manual work by 90% through automation",
  },
];

const StoryAbout = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Animated Background Line */}
      <motion.div
        className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent"
        style={{ y }}
      />

      <div className="container-custom">
        {/* Chapter Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="text-primary font-display text-6xl font-bold opacity-20">01</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter One</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">About Me</h2>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm a <span className="text-primary font-medium">B.Tech IT student</span> with a passion for turning complex problems into elegant digital solutions. My journey began with curiosity about how things work, leading me deep into the worlds of{" "}
              <span className="text-foreground font-medium">software development, AI, and embedded systems</span>.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Currently at <span className="text-primary font-medium">WorkBooster AI</span>, I architect automation pipelines that save businesses countless hours. I believe in writing code that's not just functional, but{" "}
              <span className="text-accent font-medium">elegant and maintainable</span>.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              From <span className="text-foreground font-medium">smart agriculture systems</span> to{" "}
              <span className="text-foreground font-medium">AI-powered security solutions</span>, I love building technology that makes a real-world impact.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {[
                { value: "5+", label: "Projects Shipped" },
                { value: "3+", label: "Years Coding" },
                { value: "90%", label: "Automation Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Highlight Cards */}
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-6 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryAbout;
