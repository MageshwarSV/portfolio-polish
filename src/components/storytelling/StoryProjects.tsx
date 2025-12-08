import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Github, Star, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects as defaultProjects } from "@/data/storytellingData";
import { getProjects, initializeData } from "@/lib/portfolioData";
import { useAnimationConfig } from "@/contexts/PerformanceContext";

// App Store Style Projects Section
const StoryProjects = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const animationConfig = useAnimationConfig();
  const [projects, setProjects] = useState(defaultProjects);

  useEffect(() => {
    let lastUpdate = localStorage.getItem('portfolio_last_update');

    const loadData = () => {
      try {
        initializeData();
        const loadedProjects = getProjects();
        if (loadedProjects && loadedProjects.length > 0) {
          setProjects(loadedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
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

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "ai", label: "AI & Automation" },
    { id: "iot", label: "IoT" },
    { id: "web", label: "Web" },
  ];

  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return (
    <section ref={ref} id="projects" className="relative py-24 overflow-hidden">
      <div className="container-custom">
        {/* Chapter header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-4 mb-8"
        >
          <span className="text-primary font-display text-5xl md:text-6xl font-bold opacity-20">04</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter Four</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Featured Work</h2>
          </div>
        </motion.div>

        {/* App Store Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">{filteredProjects.length} projects</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-xs ml-1">(Top Rated)</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Featured Projects (App Store Style) */}
        <div className="grid gap-6 mb-12">
          {filteredProjects.filter(p => p.featured).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group"
            >
              <div className={`relative rounded-3xl overflow-hidden border border-border/50 transition-all duration-300 ${hoveredId === project.id ? "border-primary/50 shadow-lg shadow-primary/10" : ""
                }`}>
                {/* Gradient Banner */}
                <div className={`h-48 md:h-64 relative ${project.color === "primary"
                  ? "bg-gradient-to-br from-primary/30 via-primary/10 to-transparent"
                  : "bg-gradient-to-br from-accent/30 via-accent/10 to-transparent"
                  }`}>
                  {/* Icon */}
                  {animationConfig.enableComplexAnimations ? (
                    <motion.div
                      animate={{
                        scale: hoveredId === project.id ? 1.1 : 1,
                        rotate: hoveredId === project.id ? 5 : 0
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <project.icon className={`w-24 h-24 md:w-32 md:h-32 ${project.color === "primary" ? "text-primary/50" : "text-accent/50"}`} />
                    </motion.div>
                  ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <project.icon className={`w-24 h-24 md:w-32 md:h-32 ${project.color === "primary" ? "text-primary/50" : "text-accent/50"}`} />
                    </div>
                  )}

                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium text-yellow-400">Featured</span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/50 backdrop-blur text-xs font-medium text-foreground">
                    {project.category.toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-background">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.color === "primary" ? "bg-primary/20" : "bg-accent/20"
                          }`}>
                          <project.icon className={`w-6 h-6 ${project.color === "primary" ? "text-primary" : "text-accent"
                            }`} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{project.subtitle}</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {project.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                            <span className={`w-1.5 h-1.5 rounded-full ${project.color === "primary" ? "bg-primary" : "bg-accent"
                              }`} />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-md bg-secondary/50 text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            More Projects
            <ArrowRight className="w-5 h-5 text-primary" />
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {filteredProjects.filter(p => !p.featured).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass-card p-5 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${project.color === "primary" ? "bg-primary/20" : "bg-accent/20"
                    }`}>
                    <project.icon className={`w-6 h-6 ${project.color === "primary" ? "text-primary" : "text-accent"
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{project.subtitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
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
