import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    title: "Programming",
    color: "primary",
    skills: [
      { name: "Python", level: 95 },
      { name: "Java", level: 85 },
      { name: "JavaScript", level: 90 },
      { name: "C", level: 80 },
      { name: "TypeScript", level: 85 },
    ],
  },
  {
    title: "Automation & AI",
    color: "accent",
    skills: [
      { name: "n8n", level: 95 },
      { name: "Flowise", level: 88 },
      { name: "API Integration", level: 92 },
      { name: "Chatbot Development", level: 85 },
      { name: "Process Automation", level: 90 },
    ],
  },
  {
    title: "IoT & Hardware",
    color: "primary",
    skills: [
      { name: "Arduino", level: 90 },
      { name: "ESP32/ESP8266", level: 88 },
      { name: "Sensor Integration", level: 85 },
      { name: "Real-time Dashboards", level: 82 },
    ],
  },
  {
    title: "Web & Tools",
    color: "accent",
    skills: [
      { name: "React", level: 85 },
      { name: "HTML/CSS", level: 95 },
      { name: "WordPress", level: 88 },
      { name: "UI/UX Design", level: 80 },
      { name: "Git", level: 85 },
    ],
  },
];

const StorySkills = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Floating Gradient */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-10"
        style={{ background: "var(--gradient-primary)", x }}
      />

      <div className="container-custom relative z-10">
        {/* Chapter Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-20"
        >
          <span className="text-primary font-display text-6xl font-bold opacity-20">03</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter Three</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">My Arsenal</h2>
          </div>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1, duration: 0.6 }}
              className="glass-card p-8"
            >
              <h3 className={`font-display text-xl font-semibold mb-8 ${
                category.color === "primary" ? "text-primary" : "text-accent"
              }`}>
                {category.title}
              </h3>

              <div className="space-y-6">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (catIndex * 0.1) + (skillIndex * 0.05) }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-foreground font-medium">{skill.name}</span>
                      <span className={`text-sm font-medium ${
                        category.color === "primary" ? "text-primary" : "text-accent"
                      }`}>
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: category.color === "primary" 
                            ? "var(--gradient-primary)" 
                            : "var(--gradient-accent)",
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 1, 
                          delay: (catIndex * 0.1) + (skillIndex * 0.05),
                          ease: "easeOut"
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <h3 className="font-display text-2xl font-semibold text-foreground mb-8 text-center">
            Certifications
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Python — GUVI",
              "IoT & AI — Pantech",
              "Ethical Hacking — Udemy",
              "Java — IIT Bombay",
            ].map((cert, index) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-6 py-3 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium text-foreground/80 hover:border-primary/50 hover:text-primary transition-all cursor-default"
              >
                {cert}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorySkills;
