import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Github, Cpu, Bot, Shield, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    id: 1,
    title: "AGRISENSE",
    subtitle: "Smart Agriculture Monitoring System",
    description: "A smart agriculture system designed to help farmers with automated irrigation and real-time farm monitoring. Prevents water wastage and supports greenhouse, open field, or terrace farms.",
    icon: Cpu,
    tags: ["IoT", "ESP8266", "Sensors", "Cloud Dashboard"],
    features: [
      "Soil moisture, temperature, humidity monitoring",
      "Automatic irrigation using threshold detection",
      "Cloud dashboard with live farm stats",
    ],
    color: "primary",
    featured: true,
  },
  {
    id: 2,
    title: "Booster Entry",
    subtitle: "AI Document Automation System",
    description: "A fully automated data-entry system for businesses that extracts data from invoices, bills, and forms using AI, reducing 90% of manual entry work.",
    icon: Bot,
    tags: ["n8n", "AI", "API Integration", "Automation"],
    features: [
      "AI-powered data extraction",
      "Auto-saves to ERP/CRM systems",
      "Error-proof with human-in-loop option",
    ],
    color: "accent",
    featured: true,
  },
  {
    id: 3,
    title: "Women Safety Analytics",
    subtitle: "AI-Powered Security System",
    description: "An AI surveillance system with YOLO-based threat detection, gesture-based SOS triggers, and Smart Response Unit integration.",
    icon: Shield,
    tags: ["Python", "YOLO", "Mobile App", "Maps"],
    features: [
      "Real-time threat detection",
      "SOS gesture recognition",
      "Hotspot monitoring & mapping",
    ],
    color: "primary",
    featured: false,
  },
  {
    id: 4,
    title: "Smart Home Automation",
    subtitle: "Complete IoT Solution",
    description: "A comprehensive IoT solution featuring smart door locks, appliance control, thief alert systems, and mobile app integration.",
    icon: Home,
    tags: ["Arduino", "ESP32", "Mobile App", "IoT"],
    features: [
      "Smart door lock with fingerprint",
      "Voice-controlled appliances",
      "Intrusion detection alerts",
    ],
    color: "accent",
    featured: false,
  },
  {
    id: 5,
    title: "Shoe E-Commerce",
    subtitle: "Responsive Web Frontend",
    description: "A fully responsive UI for an online shoe store with modern design patterns and smooth animations.",
    icon: ShoppingBag,
    tags: ["HTML", "CSS", "JavaScript", "Responsive"],
    features: [
      "Product catalog with filters",
      "Shopping cart functionality",
      "Mobile-first design",
    ],
    color: "primary",
    featured: false,
  },
];

const StoryProjects = () => {
  const ref = useRef(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute -right-64 top-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10"
        style={{ background: "var(--gradient-accent)", y }}
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
          <span className="text-primary font-display text-6xl font-bold opacity-20">04</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter Four</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Featured Work</h2>
          </div>
        </motion.div>

        {/* Featured Projects */}
        <div className="space-y-16 mb-16">
          {projects.filter(p => p.featured).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`grid md:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Visual */}
              <motion.div
                className={`relative aspect-video rounded-2xl overflow-hidden ${
                  index % 2 === 1 ? "md:order-2" : ""
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`absolute inset-0 ${
                  project.color === "primary" 
                    ? "bg-gradient-to-br from-primary/20 to-primary/5" 
                    : "bg-gradient-to-br from-accent/20 to-accent/5"
                }`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: hoveredId === project.id ? 1.1 : 1,
                      rotate: hoveredId === project.id ? 10 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <project.icon className={`w-24 h-24 ${
                      project.color === "primary" ? "text-primary/50" : "text-accent/50"
                    }`} />
                  </motion.div>
                </div>
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }} />
              </motion.div>

              {/* Content */}
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <span className={`text-sm uppercase tracking-widest font-medium ${
                  project.color === "primary" ? "text-primary" : "text-accent"
                }`}>
                  {project.subtitle}
                </span>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                  {project.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{project.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        project.color === "primary" ? "bg-primary" : "bg-accent"
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-secondary/50 border border-border/50 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="group">
                    <Github className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                    View Code
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-display text-2xl font-semibold text-foreground mb-8">Other Projects</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.filter(p => !p.featured).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  project.color === "primary" ? "bg-primary/10" : "bg-accent/10"
                }`}>
                  <project.icon className={`w-6 h-6 ${
                    project.color === "primary" ? "text-primary" : "text-accent"
                  }`} />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-1">{project.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{project.subtitle}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StoryProjects;
