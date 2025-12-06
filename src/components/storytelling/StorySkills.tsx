import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { skillCategories, certifications, achievements } from "@/data/storytellingData";
import { Zap, Star, Trophy, Shield, Award } from "lucide-react";
import { useAnimationConfig } from "@/contexts/PerformanceContext";

// RPG/Gaming Stats Style Skills Section
const StorySkills = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const animationConfig = useAnimationConfig();

  // Calculate total XP
  const totalXP = skillCategories.reduce((acc, cat) =>
    acc + cat.skills.reduce((a, s) => a + s.level, 0), 0
  );

  // Calculate age based on birthdate (15-12-2003)
  const birthDate = new Date(2003, 11, 15); // Month is 0-indexed, so 11 = December
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  const level = age; // Age = Level!

  return (
    <section ref={ref} id="skills" className="relative py-24 overflow-hidden">
      <div className="container-custom">
        {/* Chapter header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-primary font-display text-5xl md:text-6xl font-bold opacity-20">03</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter Three</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">My Arsenal</h2>
          </div>
        </motion.div>

        {/* RPG Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {/* Character Stats Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Character Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-background">
                  {level}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Software Engineer</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Level {level} • {totalXP} XP Total</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="w-4 h-4" />
                    <span className="font-bold">{skillCategories.length}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Skill Trees</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-accent">
                    <Shield className="w-4 h-4" />
                    <span className="font-bold">{skillCategories.reduce((a, c) => a + c.skills.length, 0)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Abilities</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{certifications.length}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Achievements</span>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Level Progress</span>
                <span>{totalXP % 100}/100 XP to next level</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${totalXP % 100}%` }}
                  viewport={{ once: false }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Skill Tree Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {skillCategories.map((category, index) => (
              <button
                key={category.title}
                onClick={() => setSelectedCategory(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${selectedCategory === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
              >
                <span className="text-lg">{category.skills[0]?.icon}</span>
                {category.title}
              </button>
            ))}
          </div>

          {/* Selected Skill Tree */}
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${skillCategories[selectedCategory].color === "primary"
                ? "bg-primary/20"
                : "bg-accent/20"
                }`}>
                <span className="text-xl">{skillCategories[selectedCategory].skills[0]?.icon}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {skillCategories[selectedCategory].title}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {skillCategories[selectedCategory].skills.length} abilities unlocked
                </span>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid gap-4">
              {skillCategories[selectedCategory].skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className="group"
                >
                  <div className="flex items-center gap-4">
                    {/* Skill Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${hoveredSkill === skill.name
                      ? "bg-primary/30 scale-110"
                      : "bg-secondary/50"
                      }`}>
                      {skill.icon}
                    </div>

                    {/* Skill Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Skill Level Stars */}
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(skill.level / 20)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted-foreground/30"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className={`text-sm font-bold ${skillCategories[selectedCategory].color === "primary"
                            ? "text-primary"
                            : "text-accent"
                            }`}>
                            {skill.level}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: skillCategories[selectedCategory].color === "primary"
                              ? "var(--gradient-primary)"
                              : "var(--gradient-accent)"
                          }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
              <Award className="w-5 h-5 text-primary" />
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-primary/10 border border-primary/30 text-xs md:text-sm"
                >
                  <Award className="w-3 h-3 md:w-4 md:h-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{cert.title}</span>
                  <span className="text-muted-foreground text-xs hidden sm:inline">• {cert.issuer}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements Unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Achievements Unlocked
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs md:text-sm"
                >
                  <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 shrink-0" />
                  <span className="text-foreground font-medium">{achievement.title}</span>
                  <span className="text-muted-foreground text-xs hidden sm:inline">• {achievement.issuer}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorySkills;
