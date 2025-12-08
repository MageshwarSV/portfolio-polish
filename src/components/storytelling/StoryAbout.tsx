import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { aboutContent as defaultAboutContent, personalInfo as defaultPersonalInfo, certifications as defaultCertifications } from "@/data/storytellingData";
import { getCertifications, getAboutContent, getPersonalInfo, initializeData } from "@/lib/portfolioData";
import { Code2, Zap, MapPin, Briefcase, GraduationCap, Award, Sparkles, TrendingUp } from "lucide-react";
import { useAnimationConfig } from "@/contexts/PerformanceContext";

// Spotify Wrapped / Personal Dashboard Style About Section
const StoryAbout = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [aboutContent, setAboutContent] = useState(defaultAboutContent);
  const [personalInfo, setPersonalInfo] = useState(defaultPersonalInfo);
  const [certifications, setCertifications] = useState(defaultCertifications);
  const animationConfig = useAnimationConfig();

  useEffect(() => {
    let lastUpdate = localStorage.getItem('portfolio_last_update');

    const loadData = () => {
      try {
        initializeData();
        const loadedAbout = getAboutContent();
        if (loadedAbout) {
          setAboutContent(loadedAbout);
        }
        const loadedPersonalInfo = getPersonalInfo();
        if (loadedPersonalInfo) {
          setPersonalInfo(loadedPersonalInfo);
        }
        const loadedCertifications = getCertifications();
        if (loadedCertifications && loadedCertifications.length > 0) {
          setCertifications(loadedCertifications);
        }
      } catch (error) {
        console.error('Error loading about data:', error);
      }
    };

    loadData();

    const pollInterval = setInterval(() => {
      const currentUpdate = localStorage.getItem('portfolio_last_update');
      if (currentUpdate !== lastUpdate) {
        lastUpdate = currentUpdate;
        loadData();
      }
    }, 300);

    const handleUpdate = () => loadData();
    window.addEventListener('portfolio_data_updated', handleUpdate);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);

  const stats = [
    { label: "Years Building", value: "3+", icon: Code2, color: "from-green-500 to-emerald-500" },
    { label: "Projects Shipped", value: "15+", icon: Zap, color: "from-purple-500 to-pink-500" },
    { label: "Hours Automated", value: "10K+", icon: TrendingUp, color: "from-orange-500 to-red-500" },
    { label: "Coffee Consumed", value: "∞", icon: Sparkles, color: "from-yellow-500 to-orange-500" },
  ];

  const topSkills = [
    { name: "AI Automation", percentage: 95, color: "#00d9ff" },
    { name: "Full-Stack Dev", percentage: 90, color: "#a855f7" },
    { name: "IoT Solutions", percentage: 88, color: "#22c55e" },
  ];

  return (
    <section ref={ref} id="about" className="relative py-24 overflow-hidden">
      <div className="container-custom">
        {/* Chapter header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-primary font-display text-5xl md:text-6xl font-bold opacity-20">01</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter One</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">About Me</h2>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* Main Profile Card - Spotify Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-border/50 p-8"
          >
            {/* Decorative gradient blob - Only on desktop */}
            {animationConfig.enableComplexAnimations && (
              <>
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-accent/30 blur-3xl" />
              </>
            )}

            <div className="relative z-10">
              {/* Profile Header */}
              <div className="flex items-center gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent p-1"
                >
                  <div className="w-full h-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                    <img
                      src={personalInfo.profileImage}
                      alt={personalInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </motion.div>
                <div>
                  <motion.h3
                    className="font-display text-3xl font-bold text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.2 }}
                  >
                    {personalInfo.name}
                  </motion.h3>
                  <p className="text-primary font-medium">{personalInfo.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {personalInfo.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {personalInfo.currentCompany}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <motion.p
                className="text-muted-foreground mb-6 text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3 }}
              >
                {aboutContent.intro}
              </motion.p>

              {/* Top Skills - Spotify style bars */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Skills</h4>
                {topSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-foreground font-medium">{index + 1}. {skill.name}</span>
                      <span className="text-xs text-muted-foreground">{skill.percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: skill.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percentage}%` }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards - Right Column */}
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative overflow-hidden rounded-2xl p-5 bg-secondary/30 border border-border/50 group cursor-pointer"
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <motion.span
                      className="text-2xl font-bold text-foreground"
                      animate={{ scale: hoveredCard === index ? 1.1 : 1 }}
                    >
                      {stat.value}
                    </motion.span>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Highlights Cards */}
          <div className="md:col-span-3 grid md:grid-cols-4 gap-4">
            {aboutContent.highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="glass-card p-5 text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                <span className="text-primary font-bold">{item.stat}</span>
              </motion.div>
            ))}
          </div>

          {/* Education & Certifications Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-3 grid md:grid-cols-2 gap-6"
          >
            {/* Education */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-display font-semibold text-foreground">Education</h4>
              </div>
              <p className="text-foreground font-medium">{personalInfo.education}</p>
              <p className="text-sm text-muted-foreground">Information Technology</p>
            </div>

            {/* Certifications */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <h4 className="font-display font-semibold text-foreground">Certifications</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <span
                    key={cert.title}
                    className="px-3 py-1 text-xs rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                  >
                    {cert.title}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StoryAbout;
