import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Briefcase, Rocket, Globe, Award } from "lucide-react";

const experiences = [
  {
    id: 1,
    title: "Software & Automation Engineer",
    company: "WorkBooster AI",
    period: "2025 – Present",
    type: "current",
    icon: Rocket,
    description: "Leading AI automation initiatives and building intelligent workflow systems.",
    highlights: [
      "Architecting n8n automation workflows for enterprise clients",
      "Designing AI-based automation pipelines with 90% efficiency gains",
      "Building the Booster Entry document automation system",
      "Integrating APIs, AI models, and databases for seamless operations",
    ],
  },
  {
    id: 2,
    title: "Web Development Intern",
    company: "Branups",
    period: "2025 – Ongoing",
    type: "ongoing",
    icon: Globe,
    description: "Developing responsive, modern websites for diverse clients.",
    highlights: [
      "Creating responsive WordPress sites",
      "Implementing modern UI components with JavaScript",
      "Optimizing for performance and SEO",
    ],
  },
  {
    id: 3,
    title: "Web Development Intern",
    company: "Tecvesten Consulting LLP",
    period: "2025",
    type: "completed",
    icon: Briefcase,
    description: "Built professional business websites using Zoho Sites.",
    highlights: [
      "Custom scripts and layouts",
      "Mobile-optimized designs",
      "Client requirement analysis",
    ],
  },
  {
    id: 4,
    title: "Team Lead — Smart India Hackathon",
    company: "SIH 2022-2024",
    period: "2022 – 2024",
    type: "achievement",
    icon: Award,
    description: "Led teams for two major national-level hackathon projects.",
    highlights: [
      "Smart Pipeline Leakage Detection (IoT)",
      "Women Safety Analytics (AI + Mobile)",
      "Designed sensor architecture & threat detection systems",
    ],
  },
];

const StoryExperience = () => {
  const ref = useRef(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <div className="container-custom">
        {/* Chapter Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-20"
        >
          <span className="text-primary font-display text-6xl font-bold opacity-20">02</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter Two</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">My Journey</h2>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Animated Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border">
            <motion.div
              className="w-full bg-gradient-to-b from-primary via-accent to-primary"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Experience Cards */}
          <div className="space-y-16">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline Node */}
                <motion.div
                  className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10"
                  whileHover={{ scale: 1.2 }}
                >
                  <div className={`w-4 h-4 rounded-full border-4 border-background ${
                    exp.type === "current" ? "bg-primary" : "bg-secondary"
                  }`} />
                </motion.div>

                {/* Card */}
                <motion.div
                  className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${
                    index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                  }`}
                  onMouseEnter={() => setActiveId(exp.id)}
                  onMouseLeave={() => setActiveId(null)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`glass-card p-6 md:p-8 transition-all duration-300 ${
                    activeId === exp.id ? "border-primary/50" : ""
                  }`}>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        exp.type === "current" ? "bg-primary/20" : "bg-secondary"
                      }`}>
                        <exp.icon className={`w-6 h-6 ${
                          exp.type === "current" ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-foreground">{exp.title}</h3>
                        <p className="text-primary font-medium">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">{exp.period}</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{exp.description}</p>

                    {/* Highlights */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: activeId === exp.id ? "auto" : 0,
                        opacity: activeId === exp.id ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-2 pt-4 border-t border-border">
                        {exp.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryExperience;
